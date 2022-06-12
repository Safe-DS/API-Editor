import re
from typing import Optional, Union

import astroid
from astroid.arguments import CallSite
from astroid.helpers import safe_infer
from package_parser.model.usages import UsageCountStore
from package_parser.utils import parent_id


class _UsageFinder:
    def __init__(self, package_name: str) -> None:
        self.package_name: str = package_name
        self.usages: UsageCountStore = UsageCountStore()

    def enter_call(self, node: astroid.Call):
        called_tuple = _analyze_declaration_called_by(node, self.package_name)
        if called_tuple is None:
            return
        called, function_id, parameters, n_implicit_parameters = called_tuple

        bound_parameters = _bound_parameters(
            parameters, CallSite.from_call(node), n_implicit_parameters
        )
        if bound_parameters is None:
            return

        # Add class usage
        if (
            isinstance(called, (astroid.BoundMethod, astroid.UnboundMethod))
            or isinstance(called, astroid.FunctionDef)
            and called.is_method()
        ):
            self.usages.add_class_usages(parent_id(function_id))

        # Add function usage
        self.usages.add_function_usages(function_id)

        # Add parameter & value usage
        for parameter_name, value in bound_parameters.items():
            parameter_id = f"{function_id}/{parameter_name}"
            self.usages.add_parameter_usages(parameter_id)

            value = _stringify_value(value)
            self.usages.add_value_usages(parameter_id, value)


def _analyze_declaration_called_by(
    node: astroid.Call, package_name: str
) -> Optional[tuple[astroid.NodeNG, str, astroid.Arguments, int]]:
    """
    Returns None if the called declaration could not be determined or if it is not relevant for us. Otherwise, it
    returns a tuple with the form (called, qualified_name, parameters, n_implicit_parameters).
    """

    called = safe_infer(node.func)
    if called is None or not __is_relevant_qualified_name(package_name, called.qname()):
        return None

    n_implicit_parameters = __n_implicit_parameters(called)

    if isinstance(called, astroid.ClassDef):
        called = __called_constructor(called)
        if called is None:
            return None

    if isinstance(
        called, (astroid.BoundMethod, astroid.UnboundMethod, astroid.FunctionDef)
    ):
        return called, _id(package_name, called), called.args, n_implicit_parameters
    else:
        return None


def _id(
    package_name: str, called: Union[astroid.UnboundMethod, astroid.FunctionDef]
) -> str:
    path = _path(package_name, called)

    decorators: Optional[astroid.Decorators] = called.decorators
    if decorators is not None:
        decorator_names = [decorator.as_string() for decorator in decorators.nodes]
    else:
        decorator_names = []

    def is_getter() -> bool:
        return "property" in decorator_names

    def is_setter() -> bool:
        for decorator in decorator_names:
            if re.search(r"^[^.]*.setter$", decorator):
                return True

        return False

    def is_deleter() -> bool:
        for decorator in decorator_names:
            if re.search(r"^[^.]*.deleter$", decorator):
                return True

        return False

    result = "/".join(path)

    if is_getter():
        result += "@getter"
    elif is_setter():
        result += "@setter"
    elif is_deleter():
        result += "@deleter"

    return result


def _path(package_name: str, current: astroid.NodeNG) -> list[str]:
    if current is None:
        return []

    if isinstance(current, astroid.Module):
        return [package_name, current.name]
    elif hasattr(current, "name"):
        return _path(package_name, current.parent) + [current.name]
    else:
        return _path(package_name, current.parent)


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
    parameters: astroid.Arguments, arguments: CallSite, n_implicit_parameters: int
) -> Optional[dict[str, astroid.NodeNG]]:
    # Improper call
    if (
        parameters.args is None
        or arguments.has_invalid_arguments()
        or arguments.has_invalid_keywords()
    ):
        return None

    result: dict[str, astroid.NodeNG] = arguments.keyword_arguments.copy()

    positional_parameter_names = [
        it.name for it in (parameters.posonlyargs + parameters.args)
    ][n_implicit_parameters:]

    for index, arg in enumerate(arguments.positional_arguments):
        if index >= len(positional_parameter_names):
            break

        result[positional_parameter_names[index]] = arg

    return result
