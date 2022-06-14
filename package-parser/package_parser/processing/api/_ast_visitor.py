import inspect
import logging
import re
from typing import Optional, Union

import astroid
from astroid.context import InferenceContext
from astroid.helpers import safe_infer
from numpydoc.docscrape import NumpyDocString
from package_parser.model.api import (
    API,
    Class,
    FromImport,
    Function,
    Import,
    Module,
    Parameter,
    ParameterAndResultDocstring,
    ParameterAssignment,
)
from package_parser.utils import parent_qualified_name

from ._file_filters import _is_init_file


class _AstVisitor:
    def __init__(self, api: API) -> None:
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

    def enter_classdef(self, class_node: astroid.ClassDef) -> None:
        qname = class_node.qname()

        decorators: Optional[astroid.Decorators] = class_node.decorators
        if decorators is not None:
            decorator_names = [decorator.as_string() for decorator in decorators.nodes]
        else:
            decorator_names = []

        numpydoc = NumpyDocString(inspect.cleandoc(class_node.doc or ""))

        # Remember class, so we can later add methods
        class_ = Class(
            self.__get_id(class_node.name),
            qname,
            decorator_names,
            class_node.basenames,
            self.is_public(class_node.name, qname),
            self.reexported.get(qname, []),
            _AstVisitor.__description(numpydoc),
            class_node.doc,
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

        numpydoc = NumpyDocString(inspect.cleandoc(function_node.doc or ""))
        is_public = self.is_public(function_node.name, qname)

        function = Function(
            self.__get_function_id(function_node.name, decorator_names),
            qname,
            decorator_names,
            self.__function_parameters(
                function_node, is_public, qname, self.__get_id(function_node.name)
            ),
            [],  # TODO: results
            is_public,
            self.reexported.get(qname, []),
            _AstVisitor.__description(numpydoc),
            function_node.doc,
        )
        self.__declaration_stack.append(function)

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

    @staticmethod
    def __description(numpydoc: NumpyDocString) -> str:
        has_summary = "Summary" in numpydoc and len(numpydoc["Summary"]) > 0
        has_extended_summary = (
            "Extended Summary" in numpydoc and len(numpydoc["Extended Summary"]) > 0
        )

        result = ""
        if has_summary:
            result += "\n".join(numpydoc["Summary"])
        if has_summary and has_extended_summary:
            result += "\n\n"
        if has_extended_summary:
            result += "\n".join(numpydoc["Extended Summary"])
        return result

    @staticmethod
    def __function_parameters(
        node: astroid.FunctionDef,
        function_is_public: bool,
        function_qname: str,
        function_id: str,
    ) -> list[Parameter]:
        parameters = node.args
        n_implicit_parameters = node.implicit_parameters()

        # For constructors (__init__ functions) the parameters are described on the class
        if node.name == "__init__" and isinstance(node.parent, astroid.ClassDef):
            docstring = node.parent.doc
        else:
            docstring = node.doc
        function_numpydoc = NumpyDocString(inspect.cleandoc(docstring or ""))

        # Arguments that can be specified positionally only ( f(1) works but not f(x=1) )
        result = [
            Parameter(
                id_=function_id + "/" + it.name,
                name=it.name,
                qname=function_qname + "." + it.name,
                default_value=None,
                assigned_by=ParameterAssignment.POSITION_ONLY,
                is_public=function_is_public,
                docstring=_AstVisitor.__parameter_docstring(function_numpydoc, it.name),
            )
            for it in parameters.posonlyargs
        ]

        # Arguments that can be specified positionally or by name ( f(1) and f(x=1) both work )
        result += [
            Parameter(
                function_id + "/" + it.name,
                it.name,
                function_qname + "." + it.name,
                _AstVisitor.__parameter_default(
                    parameters.defaults,
                    index - len(parameters.args) + len(parameters.defaults),
                ),
                ParameterAssignment.POSITION_OR_NAME,
                function_is_public,
                _AstVisitor.__parameter_docstring(function_numpydoc, it.name),
            )
            for index, it in enumerate(parameters.args)
        ]

        # Arguments that can be specified by name only ( f(x=1) works but not f(1) )
        result += [
            Parameter(
                function_id + "/" + it.name,
                it.name,
                function_qname + "." + it.name,
                _AstVisitor.__parameter_default(
                    parameters.kw_defaults,
                    index - len(parameters.kwonlyargs) + len(parameters.kw_defaults),
                ),
                ParameterAssignment.NAME_ONLY,
                function_is_public,
                _AstVisitor.__parameter_docstring(function_numpydoc, it.name),
            )
            for index, it in enumerate(parameters.kwonlyargs)
        ]

        implicit_parameters = result[:n_implicit_parameters]
        for implicit_parameter in implicit_parameters:
            implicit_parameter.assigned_by = ParameterAssignment.IMPLICIT

        return result

    @staticmethod
    def __parameter_default(
        defaults: list[astroid.NodeNG], default_index: int
    ) -> Optional[str]:
        if 0 <= default_index < len(defaults):
            default = defaults[default_index]
            if default is None:
                return None
            return default.as_string()
        else:
            return None

    @staticmethod
    def __parameter_docstring(
        function_numpydoc: NumpyDocString, parameter_name: str
    ) -> ParameterAndResultDocstring:
        parameters_numpydoc = function_numpydoc["Parameters"]
        candidate_parameters_numpydoc = [
            it for it in parameters_numpydoc if it.name == parameter_name
        ]

        if len(candidate_parameters_numpydoc) > 0:
            last_parameter_numpydoc = candidate_parameters_numpydoc[-1]
            return ParameterAndResultDocstring(
                last_parameter_numpydoc.type, "\n".join(last_parameter_numpydoc.desc)
            )

        return ParameterAndResultDocstring("", "")

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
