import inspect
from typing import Optional

import astroid
from numpydoc.docscrape import NumpyDocString

from package_parser.processing.api.model.api import Parameter, ParameterAssignment, ParameterAndResultDocstring


def _get_parameter_list(
    node: astroid.FunctionDef,
    function_id: str,
    function_qname: str,
    function_is_public: bool,
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
            docstring=_get_parameter_docstring(function_numpydoc, it.name),
        )
        for it in parameters.posonlyargs
    ]

    # Arguments that can be specified positionally or by name ( f(1) and f(x=1) both work )
    result += [
        Parameter(
            function_id + "/" + it.name,
            it.name,
            function_qname + "." + it.name,
            _get_parameter_default(
                parameters.defaults,
                index - len(parameters.args) + len(parameters.defaults),
            ),
            ParameterAssignment.POSITION_OR_NAME,
            function_is_public,
            _get_parameter_docstring(function_numpydoc, it.name),
        )
        for index, it in enumerate(parameters.args)
    ]

    # Arguments that can be specified by name only ( f(x=1) works but not f(1) )
    result += [
        Parameter(
            function_id + "/" + it.name,
            it.name,
            function_qname + "." + it.name,
            _get_parameter_default(
                parameters.kw_defaults,
                index - len(parameters.kwonlyargs) + len(parameters.kw_defaults),
            ),
            ParameterAssignment.NAME_ONLY,
            function_is_public,
            _get_parameter_docstring(function_numpydoc, it.name),
        )
        for index, it in enumerate(parameters.kwonlyargs)
    ]

    implicit_parameters = result[:n_implicit_parameters]
    for implicit_parameter in implicit_parameters:
        implicit_parameter.assigned_by = ParameterAssignment.IMPLICIT

    return result


def _get_parameter_default(
    defaults: list[astroid.NodeNG],
    default_index: int
) -> Optional[str]:
    if 0 <= default_index < len(defaults):
        default = defaults[default_index]
        if default is None:
            return None
        return default.as_string()
    else:
        return None


def _get_parameter_docstring(
    function_numpydoc: NumpyDocString,
    parameter_name: str
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
