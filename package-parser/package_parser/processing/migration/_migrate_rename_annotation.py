from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    RenameAnnotation,
    TodoAnnotation,
)
from package_parser.processing.api.model import Attribute, Result

from ._constants import migration_author
from ._mapping import ManyToOneMapping, Mapping, OneToOneMapping


def migrate_rename_annotation(
    rename_annotation: RenameAnnotation, mapping: Mapping
) -> list[AbstractAnnotation]:
    new_name = rename_annotation.newName
    authors = rename_annotation.authors
    authors.append(migration_author)

    if isinstance(mapping, (ManyToOneMapping, OneToOneMapping)):
        element = mapping.get_apiv2_elements()[0]
        if isinstance(element, (Attribute, Result)):
            return []
        if (
            rename_annotation.target != element.id
            and element.id.split(".")[-1] != new_name
        ):
            rename_annotation.reviewResult = EnumReviewResult.UNSURE
        rename_annotation.target = element.id
        return [rename_annotation]
    # Can be decided to which apiv2 element a todo annotation or a unsure rename annotation can be placed?
    # Maybe the element with the lowest Levenshtein distance to the annotation target?
    # if it is their names are equal?
    # if no such element exists mark all with a todo annotation
    # if any mapping is found: keep and migrate them in some way because they were correct in an older version

    migrate_text = (
        "The @Rename Annotation with the new name '"
        + rename_annotation.newName
        + "' from the previous version was at '"
        + rename_annotation.target
        + "' and the possible alternatives in the new version of the api are: "
        + ", ".join(
            map(
                lambda api_element: api_element.id
                if not isinstance(api_element, (Attribute, Result))
                else api_element.name,
                mapping.get_apiv2_elements(),
            )
        )
    )

    todo_annotations: list[AbstractAnnotation] = []
    for element in mapping.get_apiv1_elements():
        if not isinstance(element, (Attribute, Result)):
            if element.id.split(".")[-1] in (
                new_name,
                rename_annotation.target.split(".")[-1],
            ):
                rename_annotation.reviewResult = EnumReviewResult.UNSURE
                if len(rename_annotation.comment) == 0:
                    rename_annotation.comment += "\n "
                rename_annotation.comment += migrate_text
                return [rename_annotation]
            todo_annotations.append(
                TodoAnnotation(
                    element.id, authors, [], "", EnumReviewResult.NONE, migrate_text
                )
            )
    return todo_annotations
