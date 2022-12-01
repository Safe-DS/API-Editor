from typing import Optional

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    AnnotationStore,
)
from package_parser.processing.api.model import Attribute, Result
from package_parser.processing.migration.annotations import migrate_rename_annotation
from package_parser.processing.migration.model import Mapping


def _get_mapping_from_annotation(
    annotation: AbstractAnnotation, mappings: list[Mapping]
) -> Optional[Mapping]:
    for mapping in mappings:
        for element in mapping.get_apiv1_elements():
            if (
                not isinstance(element, (Attribute, Result))
                and element.id == annotation.target
            ):
                return mapping
    return None


def migrate_annotations(
    annotationsv1: AnnotationStore, mappings: list[Mapping]
) -> AnnotationStore:
    migrated_annotation_store = AnnotationStore()

    for rename_annotation in annotationsv1.renameAnnotations:
        mapping = _get_mapping_from_annotation(rename_annotation, mappings)
        if mapping is not None:
            for annotation in migrate_rename_annotation(rename_annotation, mapping):
                migrated_annotation_store.add_annotation(annotation)

    return migrated_annotation_store