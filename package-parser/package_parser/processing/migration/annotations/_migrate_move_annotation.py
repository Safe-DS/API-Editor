from copy import deepcopy

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    MoveAnnotation,
)
from package_parser.processing.api.model import Attribute, Result
from package_parser.processing.migration.model import (
    ManyToOneMapping,
    Mapping,
    OneToOneMapping,
)

from ._constants import migration_author
from ._get_migration_text import get_migration_text


def migrate_move_annotation(
    move_annotation: MoveAnnotation, mapping: Mapping
) -> list[AbstractAnnotation]:
    move_annotation = deepcopy(move_annotation)
    authors = move_annotation.authors
    authors.append(migration_author)
    move_annotation.authors = authors

    if isinstance(mapping, (ManyToOneMapping, OneToOneMapping)):
        element = mapping.get_apiv2_elements()[0]
        if isinstance(element, (Attribute, Result)):
            return []
        move_annotation.target = element.id
        return [move_annotation]

    migrate_text = get_migration_text(move_annotation, mapping)

    annotated_apiv1_element = None
    for element in mapping.get_apiv1_elements():
        if not isinstance(element, (Attribute, Result)) and element.id:
            annotated_apiv1_element = element

    move_annotations: list[AbstractAnnotation] = []
    for element in mapping.get_apiv2_elements():
        if isinstance(element, type(annotated_apiv1_element)) and not isinstance(
            element, (Attribute, Result)
        ):
            move_annotations.append(
                MoveAnnotation(
                    element.id,
                    authors,
                    move_annotation.reviewers,
                    move_annotation.comment,
                    EnumReviewResult.NONE,
                    move_annotation.destination,
                )
            )
        elif not isinstance(element, (Attribute, Result)):
            move_annotations.append(
                MoveAnnotation(
                    element.id,
                    authors,
                    move_annotation.reviewers,
                    move_annotation.comment,
                    EnumReviewResult.UNSURE,
                    migrate_text,
                )
            )
    return move_annotations
