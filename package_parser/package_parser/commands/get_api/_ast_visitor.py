from typing import Optional

import astroid

from package_parser.utils import parent_qname
from ._file_filters import _is_init_file
from ._model import API, Function, Parameter, Class


class _CallableVisitor:
    def __init__(self, api: API) -> None:
        self.reexported: set[str] = set()
        self.api: API = api

    def enter_module(self, module_node: astroid.Module):
        """
        Find re-exported declarations in __init__.py files.
        """

        if not _is_init_file(module_node.file):
            return

        for _, global_declaration_node_list in module_node.globals.items():
            global_declaration_node = global_declaration_node_list[0]

            if isinstance(global_declaration_node, astroid.ImportFrom):
                base_import_path = module_node.relative_to_absolute_name(
                    global_declaration_node.modname,
                    global_declaration_node.level
                )

                for declaration, _ in global_declaration_node.names:
                    reexported_name = f"{base_import_path}.{declaration}"

                    if reexported_name.startswith(module_node.name):
                        self.reexported.add(reexported_name)

    def enter_classdef(self, node: astroid.ClassDef) -> None:
        qname = node.qname()

        if qname not in self.api.classes:
            self.api.add_class(
                Class(
                    qname,
                    self.is_public(node.name, qname)
                )
            )

    def enter_functiondef(self, node: astroid.FunctionDef) -> None:
        qname = node.qname()

        if qname not in self.api.functions:
            is_public = self.is_public(node.name, qname)

            self.api.add_function(
                Function(
                    qname,
                    self.__function_parameters(node, is_public),
                    is_public
                )
            )

    @staticmethod
    def __function_parameters(node: astroid.FunctionDef, function_is_public: bool) -> list[Parameter]:
        parameters: astroid.Arguments = node.args
        n_implicit_parameters = node.implicit_parameters()

        result = [(it.name, None) for it in parameters.posonlyargs]
        result += [
            (
                it.name,
                _CallableVisitor.__parameter_default(
                    parameters.defaults,
                    index - len(parameters.args) + len(parameters.defaults)
                )
            )
            for index, it in enumerate(parameters.args)
        ]
        result += [
            (
                it.name,
                _CallableVisitor.__parameter_default(
                    parameters.kw_defaults,
                    index - len(parameters.kwonlyargs) + len(parameters.kw_defaults)
                )
            )
            for index, it in enumerate(parameters.kwonlyargs)
        ]

        return [
            Parameter(name, default, function_is_public)
            for name, default in result[n_implicit_parameters:]
            if name != "self"
        ]

    @staticmethod
    def __parameter_default(defaults: list[astroid.NodeNG], default_index: int) -> Optional[str]:
        if 0 <= default_index < len(defaults):
            default = defaults[default_index]
            if default is None:
                return None
            return default.as_string()
        else:
            return None

    def is_public(self, name: str, qualified_name: str) -> bool:
        if name.startswith("_") and not name.endswith("__"):
            return False

        if qualified_name in self.reexported:
            return True

        # Containing class is re-exported (always false if the current API element is not a method)
        if parent_qname(qualified_name) in self.reexported:
            return True

        # The slicing is necessary so __init__ functions are not excluded (already handled in the first condition).
        return all(not it.startswith("_") for it in qualified_name.split(".")[:-1])
