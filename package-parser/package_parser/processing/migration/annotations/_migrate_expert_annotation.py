from copy import deepcopy

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    ExpertAnnotation,
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


def migrate_expert_annotation(
    expert_annotation: ExpertAnnotation, mapping: Mapping
) -> list[AbstractAnnotation]:
    expert_annotation = deepcopy(expert_annotation)
    authors = expert_annotation.authors
    authors.append(migration_author)
    expert_annotation.authors = authors
    migrate_text = get_migration_text(expert_annotation, mapping)

    if isinstance(mapping, (ManyToOneMapping, OneToOneMapping)):
        element = mapping.get_apiv2_elements()[0]
        if isinstance(element, (Attribute, Result)):
            return []
        expert_annotation.target = element.id
        return [expert_annotation]

    annotated_apiv1_element = get_annotated_api_element(
        expert_annotation, mapping.get_apiv1_elements()
    )
    if annotated_apiv1_element is None:
        return []

    expert_annotations: list[AbstractAnnotation] = []
    for element in mapping.get_apiv2_elements():
        if isinstance(element, type(annotated_apiv1_element)) and not isinstance(
            element, (Attribute, Result)
        ):
            expert_annotations.append(
                ExpertAnnotation(
                    element.id,
                    authors,
                    expert_annotation.reviewers,
                    expert_annotation.comment,
                    EnumReviewResult.NONE,
                )
            )
        elif not isinstance(element, (Attribute, Result)):
            expert_annotations.append(
                TodoAnnotation(
                    element.id,
                    authors,
                    expert_annotation.reviewers,
                    expert_annotation.comment,
                    EnumReviewResult.NONE,
                    migrate_text,
                )
            )
    return expert_annotations
