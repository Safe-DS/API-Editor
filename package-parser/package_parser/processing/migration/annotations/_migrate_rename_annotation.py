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

    migrate_text = get_migration_text(rename_annotation, mapping)

    todo_annotations: list[AbstractAnnotation] = []
    for element in mapping.get_apiv2_elements():
        if not isinstance(element, (Attribute, Result)):
            if element.name in (
                new_name,
                rename_annotation.target.split(".")[-1],
            ):
                rename_annotation.target = element.id
                rename_annotation.reviewResult = EnumReviewResult.UNSURE
                rename_annotation.comment = (
                    migrate_text
                    if len(rename_annotation.comment) == 0
                    else rename_annotation.comment + "\n" + migrate_text
                )
                return [rename_annotation]
            todo_annotations.append(
                TodoAnnotation(
                    element.id,
                    authors,
                    rename_annotation.reviewers,
                    rename_annotation.comment,
                    EnumReviewResult.NONE,
                    migrate_text,
                )
            )
    return todo_annotations
