from copy import deepcopy

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    RenameAnnotation,
    TodoAnnotation,
)
from package_parser.processing.api.model import Attribute, Result
from package_parser.processing.migration.model import (
    ManyToOneMapping,
    Mapping,
    OneToOneMapping,
)

from ._constants import migration_author
from ._get_annotated_api_element import get_annotated_api_element
from ._get_migration_text import get_migration_text


def migrate_rename_annotation(
    rename_annotation: RenameAnnotation, mapping: Mapping
) -> list[AbstractAnnotation]:
    rename_annotation = deepcopy(rename_annotation)
    new_name = rename_annotation.newName
    authors = rename_annotation.authors
    authors.append(migration_author)
    rename_annotation.authors = authors

    if isinstance(mapping, (ManyToOneMapping, OneToOneMapping)):
        element = mapping.get_apiv2_elements()[0]
        if isinstance(element, (Attribute, Result)):
            return []
        rename_annotation.target = element.id
        return [rename_annotation]

    annotated_apiv1_element = get_annotated_api_element(
        rename_annotation, mapping.get_apiv1_elements()
    )
    if annotated_apiv1_element is None:
        return []

    annotations: list[AbstractAnnotation] = []
    for element in mapping.get_apiv2_elements():
        if isinstance(element, type(annotated_apiv1_element)) and not isinstance(
            element, (Attribute, Result)
        ):
            if element.name not in (
                new_name,
                rename_annotation.target.split(".")[-1],
            ):
                annotations.append(
                    RenameAnnotation(
                        element.id,
                        authors,
                        rename_annotation.reviewers,
                        get_migration_text(rename_annotation, mapping),
                        EnumReviewResult.UNSURE,
                        rename_annotation.newName,
                    )
                )
            else:
                annotations.append(
                    RenameAnnotation(
                        element.id,
                        authors,
                        rename_annotation.reviewers,
                        rename_annotation.comment,
                        EnumReviewResult.NONE,
                        rename_annotation.newName,
                    )
                )
        elif not isinstance(element, (Attribute, Result)):
            annotations.append(
                TodoAnnotation(
                    element.id,
                    authors,
                    rename_annotation.reviewers,
                    rename_annotation.comment,
                    EnumReviewResult.NONE,
                    get_migration_text(
                        rename_annotation, mapping, for_todo_annotation=True
                    ),
                )
            )
    return annotations
