from typing import Any, Optional

from package_parser.model.annotations import (
    AnnotationStore,
    ConstantAnnotation,
    OptionalAnnotation,
    RequiredAnnotation,
)
from package_parser.model.api import API, Parameter
from package_parser.model.usages import UsageCountStore


def _generate_parameter_importance_annotations(
    api: API, usages: UsageCountStore, annotations: AnnotationStore
) -> None:
    for parameter in api.parameters().values():
        parameter_values = usages.most_common_parameter_values(parameter.id)

        if len(parameter_values) == 1:
            _generate_constant_annotation(parameter, parameter_values[0], annotations)
        elif len(parameter_values) > 1:
            _generate_required_or_optional_annotation(parameter, usages, annotations)


def _generate_constant_annotation(
    parameter: Parameter, sole_stringified_value: str, annotations: AnnotationStore
) -> None:
    """
    Collect all parameters that are only ever assigned a single value.
    :param parameter: Parameter to be annotated
    :param sole_stringified_value: The sole value that is assigned to the parameter
    :param annotations: AnnotationStore object
    """

    default_type, default_value = _get_default_type_and_value_for_stringified_value(
        sole_stringified_value
    )
    if default_type is not None:
        annotations.constants.append(
            ConstantAnnotation(parameter.id, default_type, default_value)
        )


def _generate_required_or_optional_annotation(
    parameter: Parameter, usages: UsageCountStore, annotations: AnnotationStore
) -> None:
    most_common_values = usages.most_common_parameter_values(parameter.id)
    if len(most_common_values) < 2:
        return

    # If the most common value is not a stringified literal, make parameter required
    if not _is_stringified_literal(most_common_values[0]):
        if parameter.is_optional():
            annotations.requireds.append(RequiredAnnotation(parameter.id))
        return

    # Compute metrics
    most_common_value_count = usages.n_value_usages(parameter.id, most_common_values[0])

    # We deliberately don't ensure this is a literal. Otherwise, we might make a parameter optional even though there is
    # a tie between the most common value and the second most common value if the latter is not a literal. This would
    # also mean different annotations would be generated depending on the order the values were inserted into the
    # UsageCountStore since the counts are identical.
    #
    # Example:
    #   Values: "1" used 5 times, "call()" used 5 times
    #
    #   If we now treat "1" as the most common value, we would make the parameter optional:
    #     - most_common_value_count = 5
    #     - second_most_common_value_count = 0 ("call()" is not a literal, so we would skip it and default to 0)
    #     - total_literal_value_count = 5
    #     - n_different_literal_values = 1
    #     - (5 - 0) >= (5 / 1)
    #
    #   However, if we treat "call()" as the most common value, we would make the parameter required since it is not a
    #   literal.
    second_most_common_value_count = usages.n_value_usages(
        parameter.id, most_common_values[1]
    )

    literal_values = [
        stringified_value
        for stringified_value in most_common_values
        if _is_stringified_literal(stringified_value)
    ]
    total_literal_value_count = sum(
        [usages.n_value_usages(parameter.id, value) for value in literal_values]
    )
    n_different_literal_values = len(literal_values)

    # Add appropriate annotation
    if _should_be_required(
        most_common_value_count,
        second_most_common_value_count,
        total_literal_value_count,
        n_different_literal_values,
    ):
        if parameter.is_optional():
            annotations.requireds.append(RequiredAnnotation(parameter.id))
    else:
        if parameter.is_required() or parameter.default_value != literal_values[0]:
            (
                default_type,
                default_value,
            ) = _get_default_type_and_value_for_stringified_value(literal_values[0])
            if default_type is not None:  # Just for mypy, always true
                annotations.optionals.append(
                    OptionalAnnotation(parameter.id, default_type, default_value)
                )


def _should_be_required(
    most_common_value_count: int,
    second_most_common_value_count: int,
    total_literal_value_count: int,
    n_different_literal_values: int,
) -> bool:
    """
    This function determines how to differentiate between an optional and a required parameter
    :param most_common_value_count: The number of times the most common value is used
    :param second_most_common_value_count: The number of times the second most common value is used
    :param total_literal_value_count: The total number of times the parameter is set to a literal value
    :param n_different_literal_values: The number of different literal values that are used
    :return: True means the parameter should be required, False means it should be optional
    """

    return (
        most_common_value_count - second_most_common_value_count
        < total_literal_value_count / n_different_literal_values
    )


def _is_stringified_literal(stringified_value: str) -> bool:
    default_type, _ = _get_default_type_and_value_for_stringified_value(
        stringified_value
    )
    return default_type is not None


def _get_default_type_and_value_for_stringified_value(
    stringified_value: str,
) -> tuple[Optional[str], Any]:
    if stringified_value == "None":
        return "none", None
    elif stringified_value == "True" or stringified_value == "False":
        return "boolean", stringified_value == "True"
    elif stringified_value.isnumeric():
        return "number", float(stringified_value)
    elif stringified_value[0] == "'" and stringified_value[-1] == "'":
        return "string", stringified_value[1:-1]
    else:
        return None, None
