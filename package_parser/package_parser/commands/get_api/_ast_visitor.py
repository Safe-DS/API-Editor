from typing import Optional

import astroid
from numpydoc.docscrape import NumpyDocString

from package_parser.utils import parent_qname
from ._file_filters import _is_init_file
from ._model import API, Function, Parameter, Class, ParameterDocstring, ParameterAssignment


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
                    self.is_public(node.name, qname),
                    node.doc,
                    node.as_string()
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
                    is_public,
                    node.doc,
                    node.as_string()
                )
            )

    @staticmethod
    def __function_parameters(node: astroid.FunctionDef, function_is_public: bool) -> list[Parameter]:
        parameters = node.args
        n_implicit_parameters = node.implicit_parameters()

        # For constructors (__init__ functions) the parameters are described on the class
        if node.name == "__init__" and isinstance(node.parent, astroid.ClassDef):
            docstring = node.parent.doc
        else:
            docstring = node.doc
        function_numpydoc = NumpyDocString(docstring or "")

        # Arguments that can be specified positionally only ( f(1) works but not f(x=1) )
        result = [
            Parameter(
                it.name,
                default_value=None,
                is_public=function_is_public,
                assigned_by=ParameterAssignment.POSITION_ONLY,
                docstring=_CallableVisitor.__parameter_docstring(function_numpydoc, it.name)
            )

            for it in parameters.posonlyargs
        ]

        # Arguments that can be specified positionally or by name ( f(1) and f(x=1) both work )
        result += [
            Parameter(
                it.name,
                _CallableVisitor.__parameter_default(
                    parameters.defaults,
                    index - len(parameters.args) + len(parameters.defaults)
                ),
                function_is_public,
                ParameterAssignment.POSITION_OR_NAME,
                _CallableVisitor.__parameter_docstring(function_numpydoc, it.name)
            )

            for index, it in enumerate(parameters.args)
        ]

        # Arguments that can be specified by name only ( f(x=1) works but not f(1) )
        result += [
            Parameter(
                it.name,
                _CallableVisitor.__parameter_default(
                    parameters.kw_defaults,
                    index - len(parameters.kwonlyargs) + len(parameters.kw_defaults)
                ),
                function_is_public,
                ParameterAssignment.NAME_ONLY,
                _CallableVisitor.__parameter_docstring(function_numpydoc, it.name)
            )

            for index, it in enumerate(parameters.kwonlyargs)
        ]

        return result[n_implicit_parameters:]

    @staticmethod
    def __parameter_default(defaults: list[astroid.NodeNG], default_index: int) -> Optional[str]:
        if 0 <= default_index < len(defaults):
            default = defaults[default_index]
            if default is None:
                return None
            return default.as_string()
        else:
            return None

    @staticmethod
    def __parameter_docstring(function_numpydoc: NumpyDocString, parameter_name: str) -> ParameterDocstring:
        parameters_numpydoc = function_numpydoc["Parameters"]
        candidate_parameters_numpydoc = [it for it in parameters_numpydoc if it.name == parameter_name]

        if len(candidate_parameters_numpydoc) > 0:
            last_parameter_numpydoc = candidate_parameters_numpydoc[-1]
            return ParameterDocstring(
                last_parameter_numpydoc.type,
                "\n".join(last_parameter_numpydoc.desc)
            )

        return ParameterDocstring("", "")

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
