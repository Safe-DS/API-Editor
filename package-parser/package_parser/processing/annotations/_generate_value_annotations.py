from typing import Any, Optional

from package_parser.processing.annotations.model import (
    AnnotationStore,
    ConstantAnnotation,
    OptionalAnnotation,
    RequiredAnnotation,
    ValueAnnotation,
)
from package_parser.processing.api.model import API, Parameter, ParameterAssignment
from package_parser.processing.usages.model import UsageCountStore
from scipy.stats import binom

from ._constants import autogen_author


def _generate_value_annotations(
    api: API, usages: UsageCountStore, annotations: AnnotationStore
) -> None:
    for parameter in api.parameters().values():

        # Don't create annotations for variadic parameters
        if (
            parameter.assigned_by == ParameterAssignment.POSITIONAL_VARARG
            or parameter.assigned_by == ParameterAssignment.NAMED_VARARG
        ):
            continue

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

    default_value_type, default_value = _get_type_and_value_for_stringified_value(
        sole_stringified_value
    )
    if default_value_type is not None:
        annotations.valueAnnotations.append(
            ConstantAnnotation(
                target=parameter.id,
                authors=[autogen_author],
                reviewers=[],
                defaultValueType=default_value_type,
                defaultValue=default_value,
            )
        )
    else:
        annotations.valueAnnotations.append(
            RequiredAnnotation(
                target=parameter.id,
                authors=[autogen_author],
                reviewers=[],
            )
        )


def _generate_required_or_optional_annotation(
    parameter: Parameter, usages: UsageCountStore, annotations: AnnotationStore
) -> None:
    most_common_values = usages.most_common_parameter_values(parameter.id)
    if len(most_common_values) < 2:
        return

    # If the most common value is not a stringified literal, make parameter required
    if not _is_stringified_literal(most_common_values[0]):
        annotations.valueAnnotations.append(
            RequiredAnnotation(
                target=parameter.id, authors=[autogen_author], reviewers=[]
            )
        )
        return

    # Compute metrics
    most_common_value_count = usages.n_value_usages(parameter.id, most_common_values[0])
    second_most_common_value_count = usages.n_value_usages(
        parameter.id, most_common_values[1]
    )

    # Add appropriate annotation
    if _should_be_required(most_common_value_count, second_most_common_value_count):
        annotations.valueAnnotations.append(
            RequiredAnnotation(
                target=parameter.id, authors=[autogen_author], reviewers=[]
            )
        )
    else:
        (
            default_value_type,
            default_value,
        ) = _get_type_and_value_for_stringified_value(most_common_values[0])
        if default_value_type is not None:  # Just for mypy, always true
            annotations.valueAnnotations.append(
                OptionalAnnotation(
                    target=parameter.id,
                    authors=[autogen_author],
                    reviewers=[],
                    defaultValueType=default_value_type,
                    defaultValue=default_value,
                )
            )


def _should_be_required(
    most_common_value_count: int, second_most_common_value_count: int
) -> bool:
    """
    This function determines how to differentiate between an optional and a required parameter
    :param most_common_value_count: How often the most common value is used
    :param second_most_common_value_count: How often the second most common value is used
    :return: True means the parameter should be required, False means it should be optional
    """

    # Shortcut to speed up the check
    if most_common_value_count == second_most_common_value_count:
        return True

    # Precaution to ensure proper order of most_common_value_count and second_most_common_value_count
    if second_most_common_value_count > most_common_value_count:
        most_common_value_count, second_most_common_value_count = (
            second_most_common_value_count,
            most_common_value_count,
        )

    total = most_common_value_count + second_most_common_value_count

    # Our null hypothesis is that the user chooses between the most common and second most common value by a fair coin
    # toss. Unless this hypothesis is rejected, we make the parameter required. We reject the hypothesis if the p-value
    # is less than or equal to 5%. The p-value is the probability that we observe results that are at least as extreme
    # as the values we observed, assuming the null hypothesis is true.
    return (
        2
        * sum(
            binom.pmf(i, total, 0.5) for i in range(most_common_value_count, total + 1)
        )
        > 0.05
    )


def _is_stringified_literal(stringified_value: str) -> bool:
    default_type, _ = _get_type_and_value_for_stringified_value(stringified_value)
    return default_type is not None


def _get_type_and_value_for_stringified_value(
    stringified_value: str,
) -> tuple[Optional[ValueAnnotation.DefaultValueType], Any]:
    if stringified_value == "None":
        return ValueAnnotation.DefaultValueType.NONE, None
    elif stringified_value == "True" or stringified_value == "False":
        return ValueAnnotation.DefaultValueType.BOOLEAN, stringified_value == "True"
    elif _is_float(stringified_value):
        return ValueAnnotation.DefaultValueType.NUMBER, float(stringified_value)
    elif stringified_value[0] == "'" and stringified_value[-1] == "'":
        return ValueAnnotation.DefaultValueType.STRING, stringified_value[1:-1]
    else:
        return None, None


def _is_float(stringified_value: str) -> bool:
    try:
        float(stringified_value)
        return True
    except ValueError:
        return False
