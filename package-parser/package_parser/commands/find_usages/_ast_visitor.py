from typing import Optional

import astroid
from astroid.arguments import CallSite
from astroid.helpers import safe_infer

from ._model import UsageStore, Location


class _UsageFinder:
    def __init__(self, package_name: str, python_file: str) -> None:
        self.package_name: str = package_name
        self.python_file: str = python_file
        self.usages: UsageStore = UsageStore()

    def enter_call(self, node: astroid.Call):
        called_tuple = _analyze_declaration_called_by(node, self.package_name)
        if called_tuple is None:
            return
        called, function_qname, parameters, n_implicit_parameters = called_tuple

        bound_parameters = _bound_parameters(
            parameters,
            CallSite.from_call(node),
            n_implicit_parameters
        )
        if bound_parameters is None:
            return

        location = Location(self.python_file, node.lineno, node.col_offset)

        # Add class usage
        if isinstance(called, (astroid.BoundMethod, astroid.UnboundMethod)) or \
            isinstance(called, astroid.FunctionDef) and called.is_method():
            self.usages.add_class_usage(".".join(function_qname.split(".")[:-1]), location)

        # Add function usage
        self.usages.add_function_usage(function_qname, location)

        # Add parameter & value usage
        for parameter_name, value in bound_parameters.items():
            parameter_qname = f"{function_qname}.{parameter_name}"
            self.usages.add_parameter_usage(parameter_qname, location)

            value = _stringify_value(value)
            self.usages.add_value_usage(parameter_qname, value, location)


def _analyze_declaration_called_by(node: astroid.Call, package_name: str) -> Optional[
    tuple[astroid.NodeNG, str, astroid.Arguments, int]]:
    """
    Returns None if the called declaration could not be determined or if it is not relevant for us. Otherwise, it
    returns a tuple with the form (called, qualified_name, parameters, n_implicit_parameters).
    """

    called = safe_infer(node.func)
    if called is None or not __is_relevant_qualified_name(
        package_name,
        called.qname()
    ):
        return None

    n_implicit_parameters = __n_implicit_parameters(called)

    if isinstance(called, astroid.ClassDef):
        called = __called_constructor(called)
        if called is None:
            return None

    if isinstance(called, (astroid.BoundMethod, astroid.UnboundMethod, astroid.FunctionDef)):
        return called, called.qname(), called.args, n_implicit_parameters
    else:
        return None


def __is_relevant_qualified_name(package_name: str, qualified_name: str) -> bool:
    return qualified_name.startswith(package_name)


def __n_implicit_parameters(called: astroid.NodeNG) -> int:
    return called.implicit_parameters() if hasattr(called, "implicit_parameters") else 0


def __called_constructor(class_def: astroid.ClassDef) -> Optional[astroid.FunctionDef]:
    try:
        # Use last __init__
        constructor = class_def.local_attr("__init__")[-1]
    except astroid.NotFoundError:
        return None

    if isinstance(constructor, astroid.FunctionDef):
        return constructor
    else:
        return None


def _stringify_value(value: astroid.NodeNG):
    return value.as_string()


def _bound_parameters(
    parameters: astroid.Arguments,
    arguments: CallSite,
    n_implicit_parameters: int
) -> Optional[dict[str, astroid.NodeNG]]:
    # Improper call
    if parameters.args is None or arguments.has_invalid_arguments() or arguments.has_invalid_keywords():
        return None

    result: dict[str, astroid.NodeNG] = arguments.keyword_arguments.copy()

    positional_parameter_names = [it.name for it in (parameters.posonlyargs + parameters.args)][n_implicit_parameters:]

    for index, arg in enumerate(arguments.positional_arguments):
        if index >= len(positional_parameter_names):
            break

        result[positional_parameter_names[index]] = arg

    return result
