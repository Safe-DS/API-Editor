import logging
import re
from typing import Any, Optional, Union

import astroid
from astroid import NodeNG
from astroid.context import InferenceContext
from astroid.helpers import safe_infer
from package_parser.processing.api.model import (
    API,
    Class,
    FromImport,
    Function,
    Import,
    Module, NamedType, UnionType,
)
from package_parser.utils import parent_qualified_name

from ._file_filters import _is_init_file
from ._get_parameter_list import get_parameter_list
from .documentation_parsing import AbstractDocumentationParser
from .model._api import Attribute


def trim_code(code, from_line_no, to_line_no, encoding):
    if code is None:
        return None
    if isinstance(code, bytes):
        code = code.decode(encoding)
    lines = code.split("\n")
    return "\n".join(lines[from_line_no - 1 : to_line_no])


class _AstVisitor:
    def __init__(
        self, documentation_parser: AbstractDocumentationParser, api: API
    ) -> None:
        self.documentation_parser: AbstractDocumentationParser = documentation_parser
        self.reexported: dict[str, list[str]] = {}
        self.api: API = api
        self.__declaration_stack: list[Union[Module, Class, Function]] = []

    def __get_id(self, name: str) -> str:
        segments = [self.api.package]
        segments += [it.name for it in self.__declaration_stack]
        segments += [name]

        return "/".join(segments)

    def __get_function_id(self, name: str, decorators: list[str]) -> str:
        def is_getter() -> bool:
            return "property" in decorators

        def is_setter() -> bool:
            for decorator in decorators:
                if re.search(r"^[^.]*.setter$", decorator):
                    return True

            return False

        def is_deleter() -> bool:
            for decorator in decorators:
                if re.search(r"^[^.]*.deleter$", decorator):
                    return True

            return False

        result = self.__get_id(name)

        if is_getter():
            result += "@getter"
        elif is_setter():
            result += "@setter"
        elif is_deleter():
            result += "@deleter"

        return result

    def enter_module(self, module_node: astroid.Module):
        imports: list[Import] = []
        from_imports: list[FromImport] = []
        visited_global_nodes: set[astroid.NodeNG] = set()
        id_ = f"{self.api.package}/{module_node.qname()}"

        for _, global_node_list in module_node.globals.items():
            global_node = global_node_list[0]

            # For some reason from-imports get visited as often as there are imported names, leading to duplicates
            if global_node in visited_global_nodes:
                continue
            visited_global_nodes.add(global_node)

            # import X as Y
            if isinstance(global_node, astroid.Import):
                for (name, alias) in global_node.names:
                    imports.append(Import(name, alias))

            # from X import a as b
            if isinstance(global_node, astroid.ImportFrom):
                base_import_path = module_node.relative_to_absolute_name(
                    global_node.modname, global_node.level
                )

                for (name, alias) in global_node.names:
                    from_imports.append(FromImport(base_import_path, name, alias))

                # Find re-exported declarations in __init__.py files
                if _is_init_file(module_node.file) and is_public_module(
                    module_node.qname()
                ):
                    for declaration, _ in global_node.names:
                        context = InferenceContext()
                        context.lookupname = declaration
                        node = safe_infer(global_node, context)

                        if node is None:
                            logging.warning(
                                f"Could not resolve 'from {global_node.modname} import {declaration}"
                            )
                            continue

                        reexported_name = node.qname()

                        if reexported_name.startswith(module_node.name):
                            if reexported_name not in self.reexported:
                                self.reexported[reexported_name] = []
                            self.reexported[reexported_name].append(id_)

        # Remember module, so we can later add classes and global functions
        module = Module(
            id_,
            module_node.qname(),
            imports,
            from_imports,
        )
        self.__declaration_stack.append(module)

    def leave_module(self, _: astroid.Module) -> None:
        module = self.__declaration_stack.pop()
        if not isinstance(module, Module):
            raise AssertionError("Imbalanced push/pop on stack")

        self.api.add_module(module)

    @staticmethod
    def get_type_of_attribute(infered_value: Any) -> Optional[str]:
        if infered_value == astroid.Uninferable:
            return None
        if isinstance(infered_value, astroid.Const) and infered_value.value is None:
            return None
        if isinstance(infered_value, astroid.List):
            return "list"
        if isinstance(infered_value, astroid.Dict):
            return "dict"
        if isinstance(infered_value, astroid.ClassDef):
            return "type"
        if isinstance(infered_value, astroid.Tuple):
            return "tuple"
        if isinstance(infered_value, (astroid.FunctionDef, astroid.Lambda)):
            return "Callable"
        if isinstance(infered_value, astroid.Const):
            return infered_value.value.__class__.__name__
        if isinstance(infered_value, astroid.Instance):
            return infered_value.name
        return None

    @staticmethod
    def get_instance_attributes(
        instance_attributes: dict[str, Any]
    ) -> list[Attribute]:
        attributes = []
        for name, assignments in instance_attributes.items():
            types = set()
            for assignment in assignments:
                if isinstance(assignment, astroid.AssignAttr) and isinstance(
                    assignment.parent, astroid.Assign
                ):
                    attribute_type = _AstVisitor.get_type_of_attribute(next(astroid.inference.infer_attribute(self=assignment)))
                    if attribute_type is not None:
                        types.add(attribute_type)
            if len(types) == 1:
                attributes.append(Attribute(name, NamedType(types.pop())))
            if len(types) > 1:
                attributes.append(Attribute(name, UnionType([NamedType(type_) for type_ in types])))
        return attributes

    def enter_classdef(self, class_node: astroid.ClassDef) -> None:
        qname = class_node.qname()
        instance_attributes = self.get_instance_attributes(class_node.instance_attrs)

        decorators: Optional[astroid.Decorators] = class_node.decorators
        if decorators is not None:
            decorator_names = [decorator.as_string() for decorator in decorators.nodes]
        else:
            decorator_names = []

        code = self.get_code(class_node)

        # Remember class, so we can later add methods
        class_ = Class(
            id_=self.__get_id(class_node.name),
            qname=qname,
            decorators=decorator_names,
            superclasses=class_node.basenames,
            is_public=self.is_public(class_node.name, qname),
            reexported_by=self.reexported.get(qname, []),
            documentation=self.documentation_parser.get_class_documentation(class_node),
            code=code,
            instance_attributes=instance_attributes,
        )
        self.__declaration_stack.append(class_)

    def leave_classdef(self, _: astroid.ClassDef) -> None:
        class_ = self.__declaration_stack.pop()
        if not isinstance(class_, Class):
            raise AssertionError("Imbalanced push/pop on stack")

        if len(self.__declaration_stack) > 0:
            parent = self.__declaration_stack[-1]

            # Ignore nested classes for now
            if isinstance(parent, Module):
                self.api.add_class(class_)
                parent.add_class(class_.id)

    def enter_functiondef(self, function_node: astroid.FunctionDef) -> None:
        qname = function_node.qname()

        decorators: Optional[astroid.Decorators] = function_node.decorators
        if decorators is not None:
            decorator_names = [decorator.as_string() for decorator in decorators.nodes]
        else:
            decorator_names = []

        is_public = self.is_public(function_node.name, qname)

        code = self.get_code(function_node)

        function = Function(
            id=self.__get_function_id(function_node.name, decorator_names),
            qname=qname,
            decorators=decorator_names,
            parameters=get_parameter_list(
                self.documentation_parser,
                function_node,
                self.__get_id(function_node.name),
                qname,
                is_public,
            ),
            results=[],  # TODO: results
            is_public=is_public,
            reexported_by=self.reexported.get(qname, []),
            documentation=self.documentation_parser.get_function_documentation(
                function_node
            ),
            code=code,
        )
        self.__declaration_stack.append(function)

    def get_code(self, function_node: Union[astroid.FunctionDef, astroid.ClassDef]):
        code = ""
        node: NodeNG = function_node
        while node.parent is not None:
            node = node.parent
            if isinstance(node, astroid.Module):
                code = trim_code(
                    node.file_bytes,
                    function_node.lineno,
                    function_node.tolineno,
                    node.file_encoding,
                )
                break
        return code

    def leave_functiondef(self, _: astroid.FunctionDef) -> None:
        function = self.__declaration_stack.pop()
        if not isinstance(function, Function):
            raise AssertionError("Imbalanced push/pop on stack")

        if len(self.__declaration_stack) > 0:
            parent = self.__declaration_stack[-1]

            # Ignore nested functions for now
            if isinstance(parent, Module):
                self.api.add_function(function)
                parent.add_function(function.id)
            elif isinstance(parent, Class):
                self.api.add_function(function)
                parent.add_method(function.id)

    def is_public(self, name: str, qualified_name: str) -> bool:
        if name.startswith("_") and not name.endswith("__"):
            return False

        if qualified_name in self.reexported:
            return True

        # Containing class is re-exported (always false if the current API element is not a method)
        if (
            isinstance(self.__declaration_stack[-1], Class)
            and parent_qualified_name(qualified_name) in self.reexported
        ):
            return True

        # The slicing is necessary so __init__ functions are not excluded (already handled in the first condition).
        return all(not it.startswith("_") for it in qualified_name.split(".")[:-1])


def is_public_module(module_name: str) -> bool:
    return all(not it.startswith("_") for it in module_name.split("."))
