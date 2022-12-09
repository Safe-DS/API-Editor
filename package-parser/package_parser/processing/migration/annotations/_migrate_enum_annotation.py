from copy import deepcopy
from typing import List, Optional

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumAnnotation,
    EnumPair,
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


def _contains_string(type_: AbstractType) -> bool:
    if isinstance(type_, NamedType):
        return type_.name == "str"
    if isinstance(type_, UnionType):
        for element in type_.types:
            if _contains_string(element):
                return True
    return False


def _default_value_is_in_instance_values_or_is_empty(
    default_value: Optional[str], pairs: List[EnumPair]
) -> bool:
    return (
        default_value is None
        or default_value in map(lambda pair: pair.stringValue, pairs)
        or len(default_value) == 0
    )


# pylint: disable=duplicate-code
def migrate_enum_annotation(
    enum_annotation: EnumAnnotation, mapping: Mapping
) -> list[AbstractAnnotation]:
    enum_annotation = deepcopy(enum_annotation)
    authors = enum_annotation.authors
    authors.append(migration_author)
    enum_annotation.authors = authors

    migrate_text = (
        "The @Enum Annotation with the new name '"
        + enum_annotation.enumName
        + " ("
        + ", ".join(
            map(
                lambda enum_pair: enum_pair.stringValue + ", " + enum_pair.instanceName,
                enum_annotation.pairs,
            )
        )
        + ")' from the previous version was at '"
        + enum_annotation.target
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
            if parameter.type is not None:
                if _contains_string(
                    parameter.type
                ) and _default_value_is_in_instance_values_or_is_empty(
                    parameter.default_value, enum_annotation.pairs
                ):
                    enum_annotation.target = parameter.id
                    return [enum_annotation]
                if isinstance(parameter.type, NamedType):
                    # assuming api has been chanced to an enum type:
                    # do not migrate annotation
                    return []
            else:
                enum_annotation.reviewResult = EnumReviewResult.UNSURE
                enum_annotation.target = parameter.id
                return [enum_annotation]
        return [
            TodoAnnotation(
                parameter.id,
                authors,
                enum_annotation.reviewers,
                enum_annotation.comment,
                EnumReviewResult.NONE,
                migrate_text,
            )
        ]

    migrated_annotations: list[AbstractAnnotation] = []
    if isinstance(mapping, (OneToManyMapping, ManyToManyMapping)):
        for parameter in mapping.get_apiv2_elements():
            if isinstance(parameter, Parameter):
                if parameter.type is not None:
                    if _contains_string(
                        parameter.type
                    ) and _default_value_is_in_instance_values_or_is_empty(
                        parameter.default_value, enum_annotation.pairs
                    ):
                        migrated_annotations.append(
                            EnumAnnotation(
                                parameter.id,
                                authors,
                                enum_annotation.reviewers,
                                enum_annotation.comment,
                                EnumReviewResult.NONE,
                                enum_annotation.enumName,
                                enum_annotation.pairs,
                            )
                        )
                    elif isinstance(parameter.type, NamedType):
                        continue
                else:
                    migrated_annotations.append(
                        TodoAnnotation(
                            parameter.id,
                            authors,
                            enum_annotation.reviewers,
                            enum_annotation.comment,
                            EnumReviewResult.UNSURE,
                            migrate_text,
                        )
                    )
    return migrated_annotations
