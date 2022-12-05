from copy import deepcopy

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    TodoAnnotation,
)
from package_parser.processing.api.model import Attribute, Result
from package_parser.processing.migration.model import (
    ManyToOneMapping,
    Mapping,
    OneToOneMapping,
)

from ._constants import migration_author


def migrate_todo_annotation(
    todo_annotation: TodoAnnotation, mapping: Mapping
) -> list[AbstractAnnotation]:
    todo_annotation = deepcopy(todo_annotation)
    authors = todo_annotation.authors
    authors.append(migration_author)
    todo_annotation.authors = authors

    if isinstance(mapping, (ManyToOneMapping, OneToOneMapping)):
        element = mapping.get_apiv2_elements()[0]
        if isinstance(element, (Attribute, Result)):
            return []
        todo_annotation.target = element.id
        return [todo_annotation]

    migrate_text = (
        "The @Todo Annotation with the todo '"
        + todo_annotation.newTodo
        + "' from the previous version was at '"
        + todo_annotation.target
        + "' and the possible alternatives in the new version of the api are: "
        + ", ".join(
            map(lambda api_element: api_element.name, mapping.get_apiv2_elements())
        )
    )

    annotated_apiv1_element = None
    for element in mapping.get_apiv1_elements():
        if not isinstance(element, (Attribute, Result)) and element.id:
            annotated_apiv1_element = element

    todo_annotations: list[AbstractAnnotation] = []
    for element in mapping.get_apiv2_elements():
        if isinstance(element, type(annotated_apiv1_element)) and not isinstance(
            element, (Attribute, Result)
        ):
            todo_annotations.append(
                TodoAnnotation(
                    element.id,
                    authors,
                    todo_annotation.reviewers,
                    todo_annotation.comment,
                    EnumReviewResult.NONE,
                    todo_annotation.newTodo,
                )
            )
        elif not isinstance(element, (Attribute, Result)):
            todo_annotations.append(
                TodoAnnotation(
                    element.id,
                    authors,
                    todo_annotation.reviewers,
                    todo_annotation.comment,
                    EnumReviewResult.UNSURE,
                    migrate_text,
                )
            )
    return todo_annotations
