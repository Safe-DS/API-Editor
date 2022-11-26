from typing import Optional

from package_parser.processing.annotations.model import (
    AnnotationStore,
    BoundaryAnnotation,
    CalledAfterAnnotation,
    CompleteAnnotation,
    DescriptionAnnotation,
    EnumAnnotation,
    GroupAnnotation,
    MoveAnnotation,
    PureAnnotation,
    RemoveAnnotation,
    RenameAnnotation,
    TodoAnnotation,
    ValueAnnotation, AbstractAnnotation
)
from package_parser.processing.migration import Mapping
from package_parser.processing.migration._mapping import api_element
from package_parser.processing.migration.annotation._migrate_rename_annotation import migrate_rename_annotation


def _get_mapping_from_annotation(annotation: AbstractAnnotation, mappings: list[Mapping]) -> Optional[Mapping]:
    for mapping in mappings:
        for element in mapping.get_apiv1_elements():
            if hasattr(element, "id") and element.id == annotation.target:
                return mapping
    return None


def migrate_annotations(annotationsv1: AnnotationStore, mappings: list[Mapping]) -> AnnotationStore:
    boundary_annotations: list[BoundaryAnnotation] = []
    called_after_annotations: list[CalledAfterAnnotation] = []
    complete_annotations: list[CompleteAnnotation] = []
    description_annotations: list[DescriptionAnnotation] = []
    enum_annotations: list[EnumAnnotation] = []
    group_annotations: list[GroupAnnotation] = []
    move_annotations: list[MoveAnnotation] = []
    pure_annotations: list[PureAnnotation] = []
    remove_annotations: list[RemoveAnnotation] = []
    rename_annotations: list[RenameAnnotation] = []
    todo_annotations: list[TodoAnnotation] = []
    value_annotations: list[ValueAnnotation] = []

    for renameAnnotation in annotationsv1.renameAnnotations:
        mapping = _get_mapping_from_annotation(renameAnnotation, mappings)
        annotation = migrate_rename_annotation(renameAnnotation, mapping)
        if annotation is not None:
            rename_annotations.append(annotation)

    annotationsv2 = AnnotationStore(
        boundary_annotations, called_after_annotations, complete_annotations,
        description_annotations, enum_annotations, group_annotations, move_annotations,
        pure_annotations, remove_annotations, rename_annotations, todo_annotations,
        value_annotations
    )
    return annotationsv2
