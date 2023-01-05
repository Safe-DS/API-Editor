from copy import deepcopy

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    MoveAnnotation,
    TodoAnnotation,
)
from package_parser.processing.api.model import (
    Attribute,
    Class,
    Function,
    Parameter,
    Result,
)
from package_parser.processing.migration.model import (
    ManyToOneMapping,
    Mapping,
    OneToOneMapping,
)

from ._constants import migration_author
from ._get_annotated_api_element import get_annotated_api_element
from ._get_migration_text import get_migration_text


def is_moveable(element: Attribute | Class | Function | Parameter | Result) -> bool:
    if isinstance(element, (Attribute, Result)):
        return False
    if isinstance(element, Function):
        # check for global function
        element_parents = element.id.split("/")
        return len(element_parents) == 3
    return isinstance(element, Class)


# pylint: disable=duplicate-code
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
        if not is_moveable(element):
            return [
                TodoAnnotation(
                    element.id,
                    authors,
                    move_annotation.reviewers,
                    move_annotation.comment,
                    EnumReviewResult.NONE,
                    get_migration_text(
                        move_annotation, mapping, for_todo_annotation=True
                    ),
                )
            ]
        move_annotation.target = element.id
        return [move_annotation]

    annotated_apiv1_element = get_annotated_api_element(
        move_annotation, mapping.get_apiv1_elements()
    )
    if annotated_apiv1_element is None:
        return []

    move_annotations: list[AbstractAnnotation] = []
    for element in mapping.get_apiv2_elements():
        if (
            isinstance(element, type(annotated_apiv1_element))
            and is_moveable(element)
            and not isinstance(element, (Attribute, Result))
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
                TodoAnnotation(
                    element.id,
                    authors,
                    move_annotation.reviewers,
                    move_annotation.comment,
                    EnumReviewResult.NONE,
                    get_migration_text(
                        move_annotation, mapping, for_todo_annotation=True
                    ),
                )
            )
    return move_annotations
