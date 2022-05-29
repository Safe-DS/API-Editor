import json
import re
from pathlib import Path
from typing import Callable

from package_parser.commands.get_api import API
from package_parser.models import UsageCountStore
from package_parser.models.annotation_models import (
    AnnotationStore,
    BoundaryAnnotation,
    ConstantAnnotation,
    EnumAnnotation,
    EnumPair,
    Interval,
    OptionalAnnotation,
    ParameterInfo,
    ParameterType,
    RemoveAnnotation,
    RequiredAnnotation,
)
from package_parser.utils import ensure_file_exists, parent_qname


def generate_annotations(
    api_file_path: Path, usages_file_path: Path, output_file_path: Path
) -> None:
    """
    Generates an annotation file from the given API and UsageStore files, and writes it to the given output file.
    Annotations that are generated are: remove, constant, required, optional, enum and boundary.
    :param api_file_path: API file Path
    :param usages_file_path: UsageStore file Path
    :param output_file_path: Output file Path
    """

    with open(api_file_path) as api_file:
        api_json = json.load(api_file)
        api = API.from_json(api_json)

    with open(usages_file_path) as usages_file:
        usages_json = json.load(usages_file)
        usages = UsageCountStore.from_json(usages_json)

    annotations = AnnotationStore()
    annotation_functions = [
        __get_remove_annotations,
        __get_constant_annotations,
        __get_required_annotations,
        __get_optional_annotations,
        __get_enum_annotations,
        __get_boundary_annotations,
    ]

    __generate_annotation_dict(api, usages, annotations, annotation_functions)

    ensure_file_exists(output_file_path)
    with output_file_path.open("w") as f:
        json.dump(annotations.to_json(), f, indent=2)


def __generate_annotation_dict(
    api: API,
    usages: UsageCountStore,
    annotations: AnnotationStore,
    functions: list[Callable],
):
    preprocess_usages(usages, api)

    for generate_annotation in functions:
        generate_annotation(usages, api, annotations)


def __get_constant_annotations(
    usages: UsageCountStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Collect all parameters that are only ever assigned a single value.
    :param usages: UsageStore object
    :param api: API object for usages
    :param annotations: AnnotationStore object
    """
    for qname in list(usages.value_usages.keys()):
        parameter_info = __get_parameter_info(qname, usages)

        param = api.parameters().get(qname)
        if param is None:
            continue
        target_name = param.pname

        if parameter_info.type == ParameterType.Constant:
            annotations.constants.append(
                ConstantAnnotation(
                    target=target_name,
                    defaultType=parameter_info.value_type,
                    defaultValue=parameter_info.value,
                )
            )


def __get_remove_annotations(
    usages: UsageCountStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Collect all functions and classes that are never used.
    :param usages: UsageStore object
    :param api: API object for usages
    :param annotations: AnnotationStore object
    """
    for function_name, function in api.functions.items():
        if (
            function_name not in usages.function_usages
            or usages.function_usages[function_name] == 0
        ):
            annotations.removes.append(RemoveAnnotation(function.pname))

    for class_name, class_ in api.classes.items():
        if (
            class_name not in usages.class_usages
            or usages.class_usages[class_name] == 0
        ):
            annotations.removes.append(RemoveAnnotation(class_.pname))


def __get_enum_annotations(
    usages: UsageCountStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Returns all parameters that are never used.
    :param usages: UsageStore object
    :param api: API object for usages
    :param annotations: AnnotationStore object
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
    usages: UsageCountStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Collects all parameters that are currently optional but should be required to be assigned a value
    :param usages: Usage store
    :param api: Description of the API
    :param annotations: AnnotationStore, that holds all annotations
    """
    parameters = api.parameters()
    optional_parameters = [
        (it, parameters[it])
        for it in parameters
        if parameters[it].default_value is not None
        and parameters[it].qname in usages.parameter_usages
    ]
    for qname, parameter in optional_parameters:
        if __get_parameter_info(qname, usages).type is ParameterType.Required:
            annotations.requireds.append(RequiredAnnotation(parameter.pname))


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


def preprocess_usages(usages: UsageCountStore, api: API) -> None:
    __remove_internal_usages(usages, api)
    __add_unused_api_elements(usages, api)
    __add_implicit_usages_of_default_value(usages, api)


def __remove_internal_usages(usages: UsageCountStore, api: API) -> None:
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


def __add_unused_api_elements(usages: UsageCountStore, api: API) -> None:
    """
    Adds unused API elements to the UsageStore. When a class, function or parameter is not used, it is not content of
    the UsageStore, so we need to add it.

    :param usages: Usage store
    :param api: Description of the API
    """

    # Public classes
    for class_qname in api.classes:
        if api.is_public_class(class_qname):
            usages.add_class_usage(class_qname, 0)

    # Public functions
    for function in api.functions.values():
        if api.is_public_function(function.qname):
            usages.add_function_usages(function.qname, 0)

            # "Public" parameters
            for parameter in function.parameters:
                usages.init_value(parameter.qname)
                usages.add_parameter_usages(parameter.qname, 0)


def __add_implicit_usages_of_default_value(usages: UsageCountStore, api: API) -> None:
    """
    Adds the implicit usages of a parameters default value. When a function is called and a parameter is used with its
    default value, that usage of a value is not part of the UsageStore, so  we need to add it.

    :param usages: Usage store
    :param api: Description of the API
    """

    for parameter_qname, parameter_usage_count in list(usages.parameter_usages.items()):
        default_value = api.get_default_value(parameter_qname)
        if default_value is None:
            continue

        function_qname = parent_qname(parameter_qname)
        function_usage_count = usages.n_function_usages(function_qname)

        n_locations_of_implicit_usages_of_default_value = (
            function_usage_count - parameter_usage_count
        )
        usages.add_value_usages(
            parameter_qname,
            default_value,
            n_locations_of_implicit_usages_of_default_value,
        )


def __get_optional_annotations(
    usages: UsageCountStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Collects all parameters that are currently required but should be optional to be assigned a value
    :param usages: Usage store
    :param api: Description of the API
    :param annotations: AnnotationStore, that holds all annotations
    """

    parameters = api.parameters()

    for qname, parameter in parameters.items():
        if qname not in usages.parameter_usages.keys():
            continue
        parameter_info = __get_parameter_info(qname, usages)

        if qname in parameters:
            old_default = parameters[qname].default_value
            if old_default is not None and old_default[0] == "'":
                old_default = old_default[1:-1]

            if parameter_info.value == old_default:
                continue

        if parameter_info.type == ParameterType.Optional:
            annotations.optionals.append(
                OptionalAnnotation(
                    target=parameter.pname,
                    defaultValue=parameter_info.value,
                    defaultType=parameter_info.value_type,
                )
            )


def __get_parameter_info(qname: str, usages: UsageCountStore) -> ParameterInfo:
    """
    Returns a ParameterInfo object, that contains the type of the parameter, the value that is associated with it,
    and the values type.
    :param qname: name of the parameter
    :param usages: UsageStore
    :return ParameterInfo
    """

    values = [(it[0], it[1]) for it in usages.value_usages[qname].items() if it[1] > 0]

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

    # If it's neither required nor constant, return optional
    value = max(values, key=lambda item: item[1])[0]
    if value[0] == "'":
        value = value[1:-1]

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

    seconds_most_used_value_tuple, most_used_value_tuple = sorted(
        values, key=lambda tup: tup[1]
    )[-2:]
    return most_used_value_tuple[1] - seconds_most_used_value_tuple[1] <= m / n


def __get_boundary_annotations(
    usages: UsageCountStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Annotates all parameters which are a boundary.
    :param usages: Usage store
    :param api: Description of the API
    :param annotations: AnnotationStore, that holds all annotations
    """
    for _, parameter in api.parameters().items():
        refined_type = parameter.refined_type.as_dict()
        if "kind" in refined_type and refined_type["kind"] == "BoundaryType":
            min_value = refined_type["min"]
            max_value = refined_type["max"]

            is_discrete = refined_type["base_type"] == "int"

            min_limit_type = 0
            max_limit_type = 0
            if not refined_type["min_inclusive"]:
                min_limit_type = 1
            if not refined_type["max_inclusive"]:
                max_limit_type = 1
            if min_value == "NegativeInfinity":
                min_value = 0
                min_limit_type = 2
            if max_value == "Infinity":
                max_value = 0
                max_limit_type = 2

            interval = Interval(
                isDiscrete=is_discrete,
                lowerIntervalLimit=min_value,
                upperIntervalLimit=max_value,
                lowerLimitType=min_limit_type,
                upperLimitType=max_limit_type,
            )
            boundary = BoundaryAnnotation(
                target=parameter.pname,
                interval=interval,
            )
            annotations.boundaries.append(boundary)
