import json
from io import TextIOWrapper
from pathlib import Path
from typing import Any

from package_parser.commands.find_usages import (
    ClassUsage,
    FunctionUsage,
    UsageStore,
    ValueUsage,
)
from package_parser.commands.get_api import API
from package_parser.utils import parent_qname


def generate_annotations(
    api_file: TextIOWrapper, usages_file: TextIOWrapper, out_dir: Path
):
    with api_file:
        api_json = json.load(api_file)
        api = API.from_json(api_json)

    with usages_file:
        usages_json = json.load(usages_file)
        usages = UsageStore.from_json(usages_json)

    # out_dir.mkdir(parents=True, exist_ok=True)
    # base_file_name = api_file.name.replace("__api.json", "")

    __preprocess_usages(usages, api)
    constant_parameters = __find_constant_parameters(usages, api)
    return constant_parameters


def __preprocess_usages(usages: UsageStore, api: API) -> None:
    __remove_internal_usages(usages, api)
    __add_unused_api_elements(usages, api)
    __add_implicit_usages_of_default_value(usages, api)


def __remove_internal_usages(usages: UsageStore, api: API) -> None:
    """
    Removes usages of internal parts of the API. It might incorrectly remove some calls to methods that are inherited
    from internal classes into a public class but these are just fit/predict/etc., i.e. something we want to keep
    unchanged anyway.

    :param usages: Usage store
    :param api: Description of the API
    """

    # Internal classes
    for class_qname in list(usages.class_usages.keys()):
        if not api.is_public_class(class_qname):
            print(f"Removing usages of internal class {class_qname}")
            usages.remove_class(class_qname)

    # Internal functions
    for function_qname in list(usages.function_usages.keys()):
        if not api.is_public_function(function_qname):
            print(f"Removing usages of internal function {function_qname}")
            usages.remove_function(function_qname)

    # Internal parameters
    parameter_qnames = set(api.parameters().keys())

    for parameter_qname in list(usages.parameter_usages.keys()):
        function_qname = parent_qname(parameter_qname)
        if parameter_qname not in parameter_qnames or not api.is_public_function(
            function_qname
        ):
            print(f"Removing usages of internal parameter {parameter_qname}")
            usages.remove_parameter(parameter_qname)


def __add_unused_api_elements(usages: UsageStore, api: API) -> None:
    """
    Adds unused API elements to the UsageStore. When a class, function or parameter is not used, it is not content of
    the UsageStore, so we need to add it.

    :param usages: Usage store
    :param api: Description of the API
    """

    # Public classes
    for class_qname in api.classes:
        if api.is_public_class(class_qname):
            usages.init_class(class_qname)

    # Public functions
    for function in api.functions.values():
        if api.is_public_function(function.qname):
            usages.init_function(function.qname)

            # "Public" parameters
            for parameter in function.parameters:
                parameter_qname = f"{function.qname}.{parameter.name}"
                usages.init_parameter(parameter_qname)
                usages.init_value(parameter_qname)


def __add_implicit_usages_of_default_value(usages: UsageStore, api: API) -> None:
    """
    Adds the implicit usages of a parameters default value. When a function is called and a parameter is used with its
    default value, that usage of a value is not part of the UsageStore, so  we need to add it.

    :param usages: Usage store
    :param api: Description of the API
    """

    for parameter_qname, parameter_usage_list in list(usages.parameter_usages.items()):
        default_value = api.get_default_value(parameter_qname)
        if default_value is None:
            continue

        function_qname = parent_qname(parameter_qname)
        function_usage_list = usages.function_usages[function_qname]

        locations_of_implicit_usages_of_default_value = set(
            [it.location for it in function_usage_list]
        ) - set([it.location for it in parameter_usage_list])

        for location in locations_of_implicit_usages_of_default_value:
            usages.add_value_usage(parameter_qname, default_value, location)


def __find_constant_parameters(
    usages: UsageStore, api: API
) -> dict[str, dict[str, str]]:
    """
    Returns all parameters that are only ever assigned a single value.

    :param usages: Usage store
    """

    result = {}

    for parameter_qname in list(usages.parameter_usages.keys()):

        if len(usages.value_usages[parameter_qname].values()) == 0:
            continue

        if len(usages.value_usages[parameter_qname].keys()) == 1:
            target_name = __qname_to_target_name(api, parameter_qname)
            default_type, default_value = __get_default_type_from_value(
                str(usages.most_common_value(parameter_qname))
            )
            print(target_name)
            result[target_name] = {
                "target": target_name,
                "defaultType": default_type,
                "defaultValue": default_value,
            }

    print(json.dumps(result))
    return result


def __qname_to_target_name(api: API, qname: str) -> str:
    target_elements = qname.split(".")

    package_name = api.package
    module_name = class_name = function_name = parameter_name = ""

    if ".".join(target_elements) in api.parameters().keys():
        parameter_name = "/" + target_elements.pop()
    if ".".join(target_elements) in api.functions.keys():
        function_name = f"/{target_elements.pop()}"
    if ".".join(target_elements) in api.classes.keys():
        class_name = f"/{target_elements.pop()}"
    if ".".join(target_elements) in api.modules.keys():
        module_name = "/" + ".".join(target_elements)

    return package_name + module_name + class_name + function_name + parameter_name


def __get_default_type_from_value(default_value: str) -> tuple[str, str]:
    default_value = str(default_value)[1:-1]

    if default_value == "null":
        default_type = "none"
    elif default_value == "True" or default_value == "False":
        default_type = "boolean"
    elif default_value.isnumeric():
        default_type = "number"
        default_value = default_value
    else:
        default_type = "string"
        default_value = default_value

    return default_type, default_value
