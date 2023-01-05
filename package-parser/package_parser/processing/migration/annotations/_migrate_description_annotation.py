from copy import deepcopy

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    DescriptionAnnotation,
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
from ._get_annotated_api_element import get_annotated_api_element
from ._get_migration_text import get_migration_text


def migrate_description_annotation(
    description_annotation: DescriptionAnnotation, mapping: Mapping
) -> list[AbstractAnnotation]:
    description_annotation = deepcopy(description_annotation)
    authors = description_annotation.authors
    authors.append(migration_author)
    description_annotation.authors = authors

    if isinstance(mapping, (ManyToOneMapping, OneToOneMapping)):
        element = mapping.get_apiv2_elements()[0]
        if isinstance(element, (Attribute, Result)):
            return []
        description_annotation.target = element.id
        return [description_annotation]

    annotated_apiv1_element = get_annotated_api_element(
        description_annotation, mapping.get_apiv1_elements()
    )
    if annotated_apiv1_element is None:
        return []

    description_annotations: list[AbstractAnnotation] = []
    for element in mapping.get_apiv2_elements():
        if isinstance(element, type(annotated_apiv1_element)) and not isinstance(
            element, (Attribute, Result)
        ):
            description_annotations.append(
                DescriptionAnnotation(
                    element.id,
                    authors,
                    description_annotation.reviewers,
                    description_annotation.comment,
                    EnumReviewResult.NONE,
                    newDescription=description_annotation.newDescription,
                )
            )
        elif not isinstance(element, (Attribute, Result)):
            description_annotations.append(
                TodoAnnotation(
                    element.id,
                    authors,
                    description_annotation.reviewers,
                    description_annotation.comment,
                    EnumReviewResult.NONE,
                    get_migration_text(
                        description_annotation, mapping, for_todo_annotation=True
                    ),
                )
            )
    return description_annotations
