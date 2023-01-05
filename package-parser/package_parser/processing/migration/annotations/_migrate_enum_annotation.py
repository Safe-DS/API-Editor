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
from ._get_annotated_api_element import get_annotated_api_element
from ._get_migration_text import get_migration_text


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

    annotated_apiv1_element = get_annotated_api_element(
        enum_annotation, mapping.get_apiv1_elements()
    )
    if annotated_apiv1_element is None or not isinstance(
        annotated_apiv1_element, Parameter
    ):
        return []

    if isinstance(mapping, (OneToOneMapping, ManyToOneMapping)):
        parameter = mapping.get_apiv2_elements()[0]
        if isinstance(parameter, (Attribute, Result)):
            return []
        if isinstance(parameter, Parameter):
            if (
                parameter.type is not None
                and _contains_string(parameter.type)
                and _default_value_is_in_instance_values_or_is_empty(
                    parameter.default_value, enum_annotation.pairs
                )
            ) or (parameter.type is None and annotated_apiv1_element.type is None):
                enum_annotation.target = parameter.id
                return [enum_annotation]
            if isinstance(parameter.type, NamedType):
                # assuming api has been chanced to an enum type:
                # do not migrate annotation
                return []
            enum_annotation.reviewResult = EnumReviewResult.UNSURE
            enum_annotation.comment = get_migration_text(enum_annotation, mapping)
            enum_annotation.target = parameter.id
            return [enum_annotation]
        return [
            TodoAnnotation(
                parameter.id,
                authors,
                enum_annotation.reviewers,
                enum_annotation.comment,
                EnumReviewResult.NONE,
                get_migration_text(enum_annotation, mapping, for_todo_annotation=True),
            )
        ]

    migrated_annotations: list[AbstractAnnotation] = []
    if isinstance(mapping, (OneToManyMapping, ManyToManyMapping)):
        for parameter in mapping.get_apiv2_elements():
            if isinstance(parameter, Parameter):
                if (
                    parameter.type is not None
                    and _contains_string(parameter.type)
                    and _default_value_is_in_instance_values_or_is_empty(
                        parameter.default_value, enum_annotation.pairs
                    )
                ) or (parameter.type is None and annotated_apiv1_element.type is None):
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
                    continue
                if isinstance(parameter.type, NamedType):
                    continue
                migrated_annotations.append(
                    EnumAnnotation(
                        parameter.id,
                        authors,
                        enum_annotation.reviewers,
                        get_migration_text(enum_annotation, mapping),
                        EnumReviewResult.UNSURE,
                        enum_annotation.enumName,
                        enum_annotation.pairs,
                    )
                )
            elif not isinstance(parameter, (Attribute, Result)):
                migrated_annotations.append(
                    TodoAnnotation(
                        parameter.id,
                        authors,
                        enum_annotation.reviewers,
                        enum_annotation.comment,
                        EnumReviewResult.NONE,
                        get_migration_text(
                            enum_annotation, mapping, for_todo_annotation=True
                        ),
                    )
                )
    return migrated_annotations
