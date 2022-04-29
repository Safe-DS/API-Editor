import json
from io import TextIOWrapper
from pathlib import Path
from typing import Callable

from package_parser.commands.find_usages import UsageStore
from package_parser.commands.get_api import API
from package_parser.utils import parent_qname


def generate_annotations(
    api_file: TextIOWrapper, usages_file: TextIOWrapper, output_file: Path
) -> None:
    """
    Generates an annotation file from the given API and UsageStore files, and writes it to the given output file.
    Annotations that are generated are: constant, unused,
    :param api_file: API file
    :param usages_file: UsageStore file
    :param output_file: Output file
    :return: None
    """
    if api_file is None or usages_file is None or output_file is None:
        raise ValueError("api_file, usages_file, and output_file must be specified.")

    with api_file:
        api_json = json.load(api_file)
        api = API.from_json(api_json)

    with usages_file:
        usages_json = json.load(usages_file)
        usages = UsageStore.from_json(usages_json)

    annotation_functions = [__get_unused_annotations, __get_constant_annotations]

    annotations_dict = __generate_annotation_dict(api, usages, annotation_functions)

    with output_file.open("w") as f:
        json.dump(annotations_dict, f, indent=2)


def __generate_annotation_dict(api: API, usages: UsageStore, functions: list[Callable]):
    _preprocess_usages(usages, api)

    annotations_dict: dict[str, dict[str, dict[str, str]]] = {}
    for generate_annotation in functions:
        annotations_dict.update(generate_annotation(usages, api))

    return annotations_dict


def __get_constant_annotations(
    usages: UsageStore, api: API
) -> dict[str, dict[str, dict[str, str]]]:
    """
    Returns all parameters that are only ever assigned a single value.
    :param usages: UsageStore object
    :param api: API object for usages
    :return: {"constant": dict[str, dict[str, str]]}
    """
    constant = "constant"
    constants: dict[str, dict[str, str]] = {}

    for parameter_qname in list(usages.parameter_usages.keys()):
        if len(usages.value_usages[parameter_qname].values()) == 0:
            continue

        if len(usages.value_usages[parameter_qname].keys()) == 1:
            if usages.most_common_value(parameter_qname) is None:
                continue

            target_name = __qname_to_target_name(api, parameter_qname)
            default_type, default_value = __get_default_type_from_value(
                str(usages.most_common_value(parameter_qname))
            )

            constants[target_name] = {
                "target": target_name,
                "defaultType": default_type,
                "defaultValue": default_value,
            }

    return {constant: constants}


def __get_unused_annotations(
    usages: UsageStore, api: API
) -> dict[str, dict[str, dict[str, str]]]:
    """
    Returns all parameters that are never used.
    :param usages: UsageStore object
    :param api: API object for usages
    :return: {"unused": dict[str, dict[str, str]]}
    """
    unused = "unused"
    unuseds: dict[str, dict[str, str]] = {}

    for parameter_name in list(api.parameters().keys()):
        if (
            parameter_name not in usages.parameter_usages
            or len(usages.parameter_usages[parameter_name]) == 0
        ):
            formatted_name = __qname_to_target_name(api, parameter_name)
            unuseds[formatted_name] = {"target": formatted_name}

    for function_name in list(api.functions.keys()):
        if (
            function_name not in usages.function_usages
            or len(usages.function_usages[function_name]) == 0
        ):
            formatted_name = __qname_to_target_name(api, function_name)
            unuseds[formatted_name] = {"target": formatted_name}

    for class_name in list(api.classes.keys()):
        if (
            class_name not in usages.class_usages
            or len(usages.class_usages[class_name]) == 0
        ):
            formatted_name = __qname_to_target_name(api, class_name)
            unuseds[formatted_name] = {"target": formatted_name}

    return {unused: unuseds}


def __qname_to_target_name(api: API, qname: str) -> str:
    """
    Formats the given name to the wanted format. This method is to be removed as soon as the UsageStore is updated to
    use the new format.
    :param api: API object
    :param qname: Name pre-formatting
    :return: Formatted name
    """
    if qname is None or api is None:
        raise ValueError("qname and api must be specified.")

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


def _preprocess_usages(usages: UsageStore, api: API) -> None:
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
