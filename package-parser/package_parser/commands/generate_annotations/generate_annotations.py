import json
import re
from io import TextIOWrapper
from pathlib import Path
from typing import Callable

from package_parser.commands.find_usages import UsageStore
from package_parser.commands.get_api import API
from package_parser.models.annotation_models import (
    AnnotationStore,
    ConstantAnnotation,
    EnumAnnotation,
    EnumPair,
    OptionalAnnotation,
    ParameterInfo,
    ParameterType,
    RequiredAnnotation,
    UnusedAnnotation,
)
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
    """
    if api_file is None or usages_file is None or output_file is None:
        raise ValueError("Api_file, usages_file, and output_file must be specified.")

    with api_file:
        api_json = json.load(api_file)
        api = API.from_json(api_json)

    with usages_file:
        usages_json = json.load(usages_file)
        usages = UsageStore.from_json(usages_json)

    annotations = AnnotationStore()
    annotation_functions = [
        __get_unused_annotations,
        __get_constant_annotations,
        __get_required_annotations,
        __get_optional_annotations,
        __get_enum_annotations,
    ]

    __generate_annotation_dict(api, usages, annotations, annotation_functions)

    with output_file.open("w") as f:
        json.dump(annotations.to_json(), f, indent=2)


def __generate_annotation_dict(
    api: API,
    usages: UsageStore,
    annotations: AnnotationStore,
    functions: list[Callable],
):
    _preprocess_usages(usages, api)

    for generate_annotation in functions:
        generate_annotation(usages, api, annotations)


def __get_constant_annotations(
    usages: UsageStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Collect all parameters that are only ever assigned a single value.
    :param usages: UsageStore object
    :param api: API object for usages
    :param annotations: AnnotationStore object
    """
    for qname in list(usages.parameter_usages.keys()):
        parameter_info = __get_parameter_info(qname, usages)

            default_type, default_value = __get_default_type_from_value(
                str(usages.most_common_value(parameter_qname))
            )

            target_name = api.parameters().get(parameter_qname).pname

        if parameter_info.type == ParameterType.Constant:
            formatted_name = __qname_to_target_name(api, qname)
            annotations.constant.append(
                ConstantAnnotation(
                    target=target_name,
                    defaultType=default_type,
                    defaultValue=default_value,
                )
            )


def __get_unused_annotations(
    usages: UsageStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Collect all parameters, functions and classes that are never used.
    :param usages: UsageStore object
    :param api: API object for usages
    :param annotations: AnnotationStore object
    :return: None
    """
    for parameter_name, parameter in api.parameters().items():
        if (
            parameter_name not in usages.parameter_usages
            or len(usages.parameter_usages[parameter_name]) == 0
        ):
            annotations.unused.append(UnusedAnnotation(parameter.pname))

    for function_name, function in api.functions.items():
        if (
            function_name not in usages.function_usages
            or len(usages.function_usages[function_name]) == 0
        ):
            annotations.unused.append(UnusedAnnotation(function.pname))

    for class_name, class_ in api.classes.items():
        if (
            class_name not in usages.class_usages
            or len(usages.class_usages[class_name]) == 0
        ):
            annotations.unused.append(UnusedAnnotation(class_.pname))


def __get_enum_annotations(
    usages: UsageStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Returns all parameters that are never used.
    :param usages: UsageStore object
    :param api: API object for usages
    :param annotations: AnnotationStore object
    :return: None
    """
    for _, parameter in api.parameters().items():
        refined_type = parameter.refined_type.as_dict()
        if "kind" in refined_type and refined_type["kind"] == "EnumType":
            enum_name = __to_enum_name(parameter.name)
            values = sorted(list(refined_type["values"]))
            pairs = []
            for string_value in values:
                instance_name = __to_enum_name(string_value)
                pairs.append(
                    EnumPair(stringValue=string_value, instanceName=instance_name)
                )

            annotations.enums.append(
                EnumAnnotation(target=parameter.pname, enumName=enum_name, pairs=pairs)
            )


def __to_enum_name(parameter_name: str) -> str:
    parameter_name = re.sub("[^a-zA-Z_]", "", parameter_name)
    value_split = re.split("_", parameter_name)
    parameter_name = ""
    for split in value_split:
        parameter_name += split.capitalize()
    return parameter_name


def __get_required_annotations(
    usages: UsageStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Collects all parameters that are currently optional but should be required to be assign a value
    :param usages: Usage store
    :param api: Description of the API
    :param annotations: AnnotationStore, that holds all annotations
    """
    parameters = api.parameters()
    optional_parameter = [
        (it, parameters[it])
        for it in parameters
        if parameters[it].default_value is not None
    ]
    for qname, _ in optional_parameter:

        if __get_parameter_info(qname, usages).type is ParameterType.Required:
            formatted_name = __qname_to_target_name(api, qname)
            annotations.requireds.append(RequiredAnnotation(formatted_name))



def __get_default_type_from_value(default_value: str) -> str:
    if default_value == "null":
        default_type = "none"
    elif default_value == "True" or default_value == "False":
        default_type = "boolean"
    elif default_value.isnumeric():
        default_type = "number"
    else:
        default_type = "string"

    return default_type


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


def __get_optional_annotations(
    usages: UsageStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Collects all parameters that are currently required but should be optional to be assign a value
    :param usages: Usage store
    :param api: Description of the API
    :param annotations: AnnotationStore, that holds all annotations
    """
    parameters = api.parameters()
    all_parameter = [(it, parameters[it]) for it in parameters]

    for qname, _ in all_parameter:
        parameter_info = __get_parameter_info(qname, usages)

        if parameter_info.type == ParameterType.Optional:
            formatted_name = __qname_to_target_name(api, qname)
            annotations.optionals.append(
                OptionalAnnotation(
                    target=formatted_name,
                    defaultValue=parameter_info.value,
                    defaultType=parameter_info.value_type,
                )
            )


def __get_parameter_info(qname: str, usages: UsageStore) -> ParameterInfo:
    """
    Returns a ParameterInfo object, that contains the type of the parameter, the value that is associated with it,
    and the values type.
    :param qname: name of the parameter
    :param usages: UsageStore
    :return ParameterInfo
    """
    values = [(it[0], len(it[1])) for it in usages.value_usages[qname].items()]

    if len(values) == 0:
        return ParameterInfo(ParameterType.Unused)
    elif len(values) == 1:
        value = values[0][0]
        if value[0] == "'":
            value = value[1:-1]
        return ParameterInfo(
            ParameterType.Constant, value, __get_default_type_from_value(value)
        )

    if __is_required(values):
        return ParameterInfo(ParameterType.Required)

    value = max(values, key=lambda item: item[1])[0]
    if value[0] == "'":
        value = value[1:-1]

    # If its neither required nor constant, return optional
    return ParameterInfo(
        ParameterType.Optional, value, __get_default_type_from_value(value)
    )


def __is_required(values: list[tuple[str, int]]) -> bool:
    """
    This replaceable function determines how to differentiate between an optional and a required parameter
    :param values: List of all associated values and the amount they get used with
    :return True means the parameter should be required, False means it should be optional
    """
    n = len(values)
    m = sum([count for value, count in values])

    seconds_most_used_value_tupel, most_used_value_tupel = sorted(
        values, key=lambda tup: tup[1]
    )[-2:]
    return most_used_value_tupel[1] - seconds_most_used_value_tupel[1] <= m / n
