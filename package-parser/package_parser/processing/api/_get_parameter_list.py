from typing import Optional

import astroid
from package_parser.processing.api.documentation import AbstractDocumentationParser
from package_parser.processing.api.model import Parameter, ParameterAssignment


def _get_parameter_list(
    documentation_parser: AbstractDocumentationParser,
    function_node: astroid.FunctionDef,
    function_id: str,
    function_qname: str,
    function_is_public: bool,
) -> list[Parameter]:
    parameters = function_node.args
    n_implicit_parameters = function_node.implicit_parameters()

    # Arguments that can be specified positionally only ( f(1) works but not f(x=1) )
    result = [
        Parameter(
            id_=function_id + "/" + it.name,
            name=it.name,
            qname=function_qname + "." + it.name,
            default_value=None,
            assigned_by=ParameterAssignment.POSITION_ONLY,
            is_public=function_is_public,
            documentation=documentation_parser.get_parameter_documentation(
                function_node, it.name
            ),
        )
        for it in parameters.posonlyargs
    ]

    # Arguments that can be specified positionally or by name ( f(1) and f(x=1) both work )
    result += [
        Parameter(
            id_=function_id + "/" + it.name,
            name=it.name,
            qname=function_qname + "." + it.name,
            default_value=_get_parameter_default(
                parameters.defaults,
                index - len(parameters.args) + len(parameters.defaults),
            ),
            assigned_by=ParameterAssignment.POSITION_OR_NAME,
            is_public=function_is_public,
            documentation=documentation_parser.get_parameter_documentation(
                function_node, it.name
            ),
        )
        for index, it in enumerate(parameters.args)
    ]

    # Arguments that can be specified by name only ( f(x=1) works but not f(1) )
    result += [
        Parameter(
            id_=function_id + "/" + it.name,
            name=it.name,
            qname=function_qname + "." + it.name,
            default_value=_get_parameter_default(
                parameters.kw_defaults,
                index - len(parameters.kwonlyargs) + len(parameters.kw_defaults),
            ),
            assigned_by=ParameterAssignment.NAME_ONLY,
            is_public=function_is_public,
            documentation=documentation_parser.get_parameter_documentation(
                function_node, it.name
            ),
        )
        for index, it in enumerate(parameters.kwonlyargs)
    ]

    implicit_parameters = result[:n_implicit_parameters]
    for implicit_parameter in implicit_parameters:
        implicit_parameter.assigned_by = ParameterAssignment.IMPLICIT

    return result


def _get_parameter_default(
    defaults: list[astroid.NodeNG], default_index: int
) -> Optional[str]:
    if 0 <= default_index < len(defaults):
        default = defaults[default_index]
        if default is None:
            return None
        return default.as_string()
    else:
        return None
