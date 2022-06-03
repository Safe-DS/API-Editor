import re
from typing import Callable

from package_parser.model.annotations import (
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
from package_parser.model.api import API
from package_parser.model.usages import UsageCountStore
from package_parser.processing.annotations._usages_preprocessor import (
    _preprocess_usages,
)


def generate_annotations(api: API, usages: UsageCountStore) -> AnnotationStore:
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

    return annotations


def __generate_annotation_dict(
    api: API,
    usages: UsageCountStore,
    annotations: AnnotationStore,
    functions: list[Callable],
):
    _preprocess_usages(usages, api)

    for generate_annotation in functions:
        generate_annotation(usages, api, annotations)


def __get_constant_annotations(
    usages: UsageCountStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Collect all parameters that are only ever assigned a single value.
    :param usages: UsageCountStore object
    :param api: API object for usages
    :param annotations: AnnotationStore object
    """
    for qname in list(usages.value_usages.keys()):
        parameter_info = __get_parameter_info(qname, usages)

        param = api.parameters().get(qname)

        if parameter_info.value_type is None:
            continue

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
    _usages: UsageCountStore, api: API, annotations: AnnotationStore
) -> None:
    """
    Returns all parameters that are never used.
    :param _usages: UsageStore object
    :param api: API object for usages
    :param annotations: AnnotationStore object
    """
    for _, parameter in api.parameters().items():
        enum_type = parameter.type.to_json()
        pairs = []
        if "kind" in enum_type and enum_type["kind"] == "UnionType":
            for type_in_union in enum_type["types"]:
                if type_in_union["kind"] == "EnumType":
                    values = sorted(list(type_in_union["values"]))
                    for string_value in values:
                        instance_name = __to_enum_name(string_value)
                        pairs.append(
                            EnumPair(
                                stringValue=string_value, instanceName=instance_name
                            )
                        )
        elif "kind" in enum_type and enum_type["kind"] == "EnumType":
            values = sorted(list(enum_type["values"]))
            for string_value in values:
                instance_name = __to_enum_name(string_value)
                pairs.append(
                    EnumPair(stringValue=string_value, instanceName=instance_name)
                )

        if len(pairs) > 0:
            enum_name = __to_enum_name(parameter.name)
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

        if parameter_info.value_type is None:
            continue

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
    # Creates a list of tuples with values value_name and value_total_usages
    values = []
    for it in usages.value_usages[qname].items():
        is_string = __get_default_type_from_value(it[0]) == "string"
        # Check if value is used more than 0 times AND if the value is correctly formatted as a string (with single
        #  quotes). If it isn't a string, just accept it.
        if it[1] > 0 and ((is_string and it[0][0] == "'" and  it[0][-1] == "'") or not is_string):
            values.append((it[0], it[1]))

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
        boundary_type = parameter.type.to_json()
        if "kind" in boundary_type and boundary_type["kind"] == "UnionType":
            union_type = boundary_type
            for type_in_union in union_type["types"]:
                if type_in_union["kind"] == "BoundaryType":
                    boundary_type = type_in_union
        if "kind" in boundary_type and boundary_type["kind"] == "BoundaryType":
            min_value = boundary_type["min"]
            max_value = boundary_type["max"]

            is_discrete = boundary_type["base_type"] == "int"

            min_limit_type = 0
            max_limit_type = 0
            if not boundary_type["min_inclusive"]:
                min_limit_type = 1
            if not boundary_type["max_inclusive"]:
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
