from package_parser.model.annotations import AnnotationStore, ParameterType, ConstantAnnotation, RequiredAnnotation, \
    OptionalAnnotation, ParameterInfo
from package_parser.model.api import API
from package_parser.model.usages import UsageCountStore


def _generate_constant_annotations(api: API, usages: UsageCountStore, annotations: AnnotationStore) -> None:
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


def _generate_required_annotations(api: API, usages: UsageCountStore, annotations: AnnotationStore) -> None:
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


def _generate_optional_annotations(api: API, usages: UsageCountStore, annotations: AnnotationStore) -> None:
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

    used_values = [
        (stringified_value, count)
        for (stringified_value, count) in usages.value_usages[qname].items()
        if count > 0
    ]

    if len(used_values) == 0:
        return ParameterInfo(ParameterType.Unused)
    # elif (len(used_values)) == 1:
    #     return ParameterInfo(ParameterType.Required, used_values[0][0], used_values[0][0])

    # Creates a list of tuples with values value_name and value_total_usages
    values = []
    for stringified_value, count in usages.value_usages[qname].items():
        is_string = __get_default_type_from_value(stringified_value) == "string"
        # Check if value is used more than 0 times AND if the value is correctly formatted as a string (with single
        #  quotes). If it isn't a string, just accept it.
        if count > 0 and (
            (is_string and stringified_value[0] == "'" and stringified_value[-1] == "'") or not is_string
        ):
            values.append((stringified_value, count))

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


def _generate_parameter_importance_annotations(annotations, api, usages):
    _generate_constant_annotations(api, usages, annotations)
    _generate_required_annotations(api, usages, annotations)
    _generate_optional_annotations(api, usages, annotations)
