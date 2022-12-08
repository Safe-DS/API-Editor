from copy import deepcopy
from typing import Optional, Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    BoundaryAnnotation,
    EnumReviewResult,
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
                return [boundary_annotation]
            if parameter_expects_number:
                if (
                    parameter_type_is_discrete
                    and not boundary_annotation.interval.isDiscrete
                ):
                    boundary_annotation.reviewResult = EnumReviewResult.UNSURE
                    boundary_annotation.interval.isDiscrete = True
                    boundary_annotation.interval.upperIntervalLimit = int(
                        boundary_annotation.interval.upperIntervalLimit
                    )
                    boundary_annotation.interval.lowerIntervalLimit = int(
                        boundary_annotation.interval.upperIntervalLimit
                    )
                if (
                    not parameter_type_is_discrete
                    and boundary_annotation.interval.isDiscrete
                ):
                    boundary_annotation.reviewResult = EnumReviewResult.UNSURE
                    boundary_annotation.interval.isDiscrete = False
                    boundary_annotation.interval.upperIntervalLimit = float(
                        boundary_annotation.interval.upperIntervalLimit
                    )
                    boundary_annotation.interval.lowerIntervalLimit = float(
                        boundary_annotation.interval.upperIntervalLimit
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
                else:
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
