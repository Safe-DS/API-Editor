from copy import deepcopy
from typing import Optional, Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    BoundaryAnnotation,
    EnumReviewResult,
    Interval,
    TodoAnnotation,
)
from package_parser.processing.api.model import (
    AbstractType,
    Attribute,
    NamedType,
    Parameter,
    Result,
    UnionType,
)
from package_parser.processing.migration.model import (
    ManyToManyMapping,
    ManyToOneMapping,
    Mapping,
    OneToManyMapping,
    OneToOneMapping,
)

from ._constants import migration_author


def migrate_interval_to_fit_parameter_type(
    intervalv1: Interval, is_discrete: bool
) -> Interval:
    intervalv2 = deepcopy(intervalv1)
    if intervalv2.isDiscrete == is_discrete:
        return intervalv2
    if is_discrete:
        intervalv2.isDiscrete = True
        if intervalv1.upperLimitType in (0, 1):
            intervalv2.upperIntervalLimit = int(intervalv1.upperIntervalLimit)
            intervalv2.upperLimitType = 1
            if intervalv2.upperIntervalLimit == intervalv1.upperIntervalLimit:
                intervalv2.upperLimitType = intervalv1.upperLimitType
        if intervalv1.lowerLimitType in (0, 1):
            intervalv2.lowerIntervalLimit = int(intervalv1.lowerIntervalLimit)
            intervalv2.lowerLimitType = 1
            if intervalv2.lowerIntervalLimit == intervalv1.lowerIntervalLimit:
                intervalv2.lowerLimitType = intervalv1.lowerLimitType
            else:
                intervalv2.lowerIntervalLimit += 1
    else:
        intervalv2.isDiscrete = False
        if intervalv1.upperLimitType in (0, 1):
            intervalv2.upperIntervalLimit = float(intervalv1.upperIntervalLimit)
        if intervalv1.lowerLimitType in (0, 1):
            intervalv2.lowerIntervalLimit = float(intervalv1.lowerIntervalLimit)
    return intervalv2


def _contains_number_and_is_discrete(
    type_: Optional[AbstractType],
) -> Tuple[bool, bool]:
    if type_ is None:
        return False, False
    if isinstance(type_, NamedType):
        return type_.name in ("int", "float"), type_.name == "int"
    if isinstance(type_, UnionType):
        for element in type_.types:
            is_number, is_discrete = _contains_number_and_is_discrete(element)
            if is_number:
                return is_number, is_discrete
    return False, False


# pylint: disable=duplicate-code
def migrate_boundary_annotation(
    boundary_annotation: BoundaryAnnotation, mapping: Mapping
) -> list[AbstractAnnotation]:
    boundary_annotation = deepcopy(boundary_annotation)
    authors = boundary_annotation.authors
    authors.append(migration_author)
    boundary_annotation.authors = authors

    migrate_text = (
        "The @Boundary Annotation with the interval '"
        + str(boundary_annotation.interval.to_json())
        + "' from the previous version was at '"
        + boundary_annotation.target
        + "' and the possible alternatives in the new version of the api are: "
        + ", ".join(
            map(lambda api_element: api_element.name, mapping.get_apiv2_elements())
        )
    )

    if isinstance(mapping, (OneToOneMapping, ManyToOneMapping)):
        parameter = mapping.get_apiv2_elements()[0]
        if isinstance(parameter, (Attribute, Result)):
            return []
        if isinstance(parameter, Parameter):
            boundary_annotation.target = parameter.id
            (
                parameter_expects_number,
                parameter_type_is_discrete,
            ) = _contains_number_and_is_discrete(parameter.type)
            if parameter.type is None:
                boundary_annotation.reviewResult = EnumReviewResult.UNSURE
                boundary_annotation.comment = (
                    migrate_text
                    if len(boundary_annotation.comment) == 0
                    else boundary_annotation.comment + "\n" + migrate_text
                )
                return [boundary_annotation]
            if parameter_expects_number:
                if (
                    parameter_type_is_discrete
                    is not boundary_annotation.interval.isDiscrete
                ):
                    boundary_annotation.reviewResult = EnumReviewResult.UNSURE
                    boundary_annotation.comment = (
                        migrate_text
                        if len(boundary_annotation.comment) == 0
                        else boundary_annotation.comment + "\n" + migrate_text
                    )
                    boundary_annotation.interval = (
                        migrate_interval_to_fit_parameter_type(
                            boundary_annotation.interval, parameter_type_is_discrete
                        )
                    )
                return [boundary_annotation]
        return [
            TodoAnnotation(
                parameter.id,
                authors,
                boundary_annotation.reviewers,
                boundary_annotation.comment,
                EnumReviewResult.NONE,
                migrate_text,
            )
        ]
    migrated_annotations: list[AbstractAnnotation] = []
    if isinstance(mapping, (OneToManyMapping, ManyToManyMapping)):
        for parameter in mapping.get_apiv2_elements():
            if isinstance(parameter, Parameter):
                is_number, is_discrete = _contains_number_and_is_discrete(
                    parameter.type
                )
                if (
                    parameter.type is not None
                    and is_number
                    and is_discrete is boundary_annotation.interval.isDiscrete
                ):
                    migrated_annotations.append(
                        BoundaryAnnotation(
                            parameter.id,
                            authors,
                            boundary_annotation.reviewers,
                            boundary_annotation.comment,
                            EnumReviewResult.NONE,
                            boundary_annotation.interval,
                        )
                    )
                elif parameter.type is not None and is_number:
                    migrated_annotations.append(
                        BoundaryAnnotation(
                            parameter.id,
                            authors,
                            boundary_annotation.reviewers,
                            migrate_text
                            if len(boundary_annotation.comment) == 0
                            else boundary_annotation.comment + "\n" + migrate_text,
                            EnumReviewResult.UNSURE,
                            migrate_interval_to_fit_parameter_type(
                                boundary_annotation.interval,
                                is_discrete,
                            ),
                        )
                    )
                elif parameter.type is None:
                    migrated_annotations.append(
                        BoundaryAnnotation(
                            parameter.id,
                            authors,
                            boundary_annotation.reviewers,
                            migrate_text
                            if len(boundary_annotation.comment) == 0
                            else boundary_annotation.comment + "\n" + migrate_text,
                            EnumReviewResult.UNSURE,
                            boundary_annotation.interval,
                        )
                    )
                continue
            if not isinstance(parameter, (Attribute, Result)):
                migrated_annotations.append(
                    TodoAnnotation(
                        parameter.id,
                        authors,
                        boundary_annotation.reviewers,
                        boundary_annotation.comment,
                        EnumReviewResult.UNSURE,
                        migrate_text,
                    )
                )
    return migrated_annotations
