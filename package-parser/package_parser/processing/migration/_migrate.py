from typing import Optional

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    AnnotationStore,
)
from package_parser.processing.api.model import Attribute, Result
from package_parser.processing.migration.annotations import (
    migrate_boundary_annotation,
    migrate_called_after_annotation,
    migrate_description_annotation,
    migrate_enum_annotation,
    migrate_group_annotation,
    migrate_move_annotation,
    migrate_remove_annotation,
    migrate_rename_annotation,
    migrate_todo_annotation,
    migrate_value_annotation,
)
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

    for boundary_annotation in annotationsv1.boundaryAnnotations:
        mapping = _get_mapping_from_annotation(boundary_annotation, mappings)
        if mapping is not None:
            for annotation in migrate_boundary_annotation(boundary_annotation, mapping):
                migrated_annotation_store.add_annotation(annotation)

    for called_after_annotation in annotationsv1.calledAfterAnnotations:
        mapping = _get_mapping_from_annotation(called_after_annotation, mappings)
        if mapping is not None:
            for annotation in migrate_called_after_annotation(
                called_after_annotation, mapping, mappings
            ):
                migrated_annotation_store.add_annotation(annotation)

    for description_annotation in annotationsv1.descriptionAnnotations:
        mapping = _get_mapping_from_annotation(description_annotation, mappings)
        if mapping is not None:
            for annotation in migrate_description_annotation(
                description_annotation, mapping
            ):
                migrated_annotation_store.add_annotation(annotation)

    for enum_annotation in annotationsv1.enumAnnotations:
        mapping = _get_mapping_from_annotation(enum_annotation, mappings)
        if mapping is not None:
            for annotation in migrate_enum_annotation(enum_annotation, mapping):
                migrated_annotation_store.add_annotation(annotation)

    for group_annotation in annotationsv1.groupAnnotations:
        mapping = _get_mapping_from_annotation(group_annotation, mappings)
        if mapping is not None:
            for annotation in migrate_group_annotation(
                group_annotation, mapping, mappings
            ):
                migrated_annotation_store.add_annotation(annotation)

    for move_annotation in annotationsv1.moveAnnotations:
        mapping = _get_mapping_from_annotation(move_annotation, mappings)
        if mapping is not None:
            for annotation in migrate_move_annotation(move_annotation, mapping):
                migrated_annotation_store.add_annotation(annotation)

    for rename_annotation in annotationsv1.renameAnnotations:
        mapping = _get_mapping_from_annotation(rename_annotation, mappings)
        if mapping is not None:
            for annotation in migrate_rename_annotation(rename_annotation, mapping):
                migrated_annotation_store.add_annotation(annotation)

    for remove_annotation in annotationsv1.removeAnnotations:
        mapping = _get_mapping_from_annotation(remove_annotation, mappings)
        if mapping is not None:
            for annotation in migrate_remove_annotation(remove_annotation, mapping):
                migrated_annotation_store.add_annotation(annotation)

    for todo_annotation in annotationsv1.todoAnnotations:
        mapping = _get_mapping_from_annotation(todo_annotation, mappings)
        if mapping is not None:
            for annotation in migrate_todo_annotation(todo_annotation, mapping):
                migrated_annotation_store.add_annotation(annotation)

    for value_annotation in annotationsv1.valueAnnotations:
        mapping = _get_mapping_from_annotation(value_annotation, mappings)
        if mapping is not None:
            for annotation in migrate_value_annotation(value_annotation, mapping):
                migrated_annotation_store.add_annotation(annotation)

    return migrated_annotation_store
