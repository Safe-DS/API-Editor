from copy import deepcopy
from typing import Optional

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    CalledAfterAnnotation,
    EnumReviewResult,
    TodoAnnotation,
)
from package_parser.processing.api.model import Attribute, Function, Result
from package_parser.processing.migration.model import (
    ManyToOneMapping,
    Mapping,
    OneToOneMapping,
)

from ._constants import migration_author
from ._get_migration_text import get_migration_text


def migrate_called_after_annotation(
    called_after_annotation: CalledAfterAnnotation,
    mapping: Mapping,
    mappings: list[Mapping],
) -> list[AbstractAnnotation]:
    called_before_mapping = _get_mapping_for_function_called_before(
        called_after_annotation, mappings
    )
    called_after_annotation = deepcopy(called_after_annotation)
    authors = called_after_annotation.authors
    authors.append(migration_author)
    called_after_annotation.authors = authors
    migrate_text = get_migration_text(
        called_after_annotation, mapping, additional_information=called_before_mapping
    )
    migrated_annotations: list[AbstractAnnotation] = []
    if called_before_mapping is not None:
        for element in mapping.get_apiv2_elements():
            if isinstance(element, (Attribute, Result)):
                continue
            if isinstance(element, Function) and isinstance(
                called_before_mapping, (OneToOneMapping, ManyToOneMapping)
            ):
                migrated_annotations.append(
                    CalledAfterAnnotation(
                        element.id,
                        authors,
                        called_after_annotation.reviewers,
                        called_after_annotation.comment,
                        called_after_annotation.reviewResult,
                        called_before_mapping.get_apiv2_elements()[0].name,
                    )
                )
                continue
            migrated_annotations.append(
                TodoAnnotation(
                    element.id,
                    authors,
                    called_after_annotation.reviewers,
                    called_after_annotation.comment,
                    called_after_annotation.reviewResult,
                    migrate_text,
                )
            )
    else:
        for element in mapping.get_apiv2_elements():
            if isinstance(element, (Attribute, Result)):
                continue
            if isinstance(element, Function):
                migrated_annotations.append(
                    CalledAfterAnnotation(
                        element.id,
                        authors,
                        called_after_annotation.reviewers,
                        called_after_annotation.comment,
                        EnumReviewResult.UNSURE,
                        called_after_annotation.calledAfterName,
                    )
                )
                continue
            migrated_annotations.append(
                TodoAnnotation(
                    element.id,
                    authors,
                    called_after_annotation.reviewers,
                    called_after_annotation.comment,
                    called_after_annotation.reviewResult,
                    migrate_text,
                )
            )
    return migrated_annotations


def _get_mapping_for_function_called_before(
    called_after_annotation: CalledAfterAnnotation, mappings: list[Mapping]
) -> Optional[Mapping]:
    called_before_id = (
        "/".join(called_after_annotation.target.split("/")[:-1])
        + "/"
        + called_after_annotation.calledAfterName
    )
    for mapping in mappings:
        for element in mapping.get_apiv1_elements():
            if isinstance(element, Function) and called_before_id == element.id:
                return mapping
    return None
