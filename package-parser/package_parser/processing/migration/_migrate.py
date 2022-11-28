from typing import Optional

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
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
    ValueAnnotation,
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
    annotations: list[AbstractAnnotation] = []

    for rename_annotation in annotationsv1.renameAnnotations:
        mapping = _get_mapping_from_annotation(rename_annotation, mappings)
        if mapping is not None:
            annotations.extend(migrate_rename_annotation(rename_annotation, mapping))

    boundary_annotations: list[BoundaryAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, BoundaryAnnotation)
    ]
    called_after_annotations: list[CalledAfterAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, CalledAfterAnnotation)
    ]
    complete_annotations: list[CompleteAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, CompleteAnnotation)
    ]
    description_annotations: list[DescriptionAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, DescriptionAnnotation)
    ]
    enum_annotations: list[EnumAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, EnumAnnotation)
    ]
    group_annotations: list[GroupAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, GroupAnnotation)
    ]
    move_annotations: list[MoveAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, MoveAnnotation)
    ]
    pure_annotations: list[PureAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, PureAnnotation)
    ]
    remove_annotations: list[RemoveAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, RemoveAnnotation)
    ]
    rename_annotations: list[RenameAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, RenameAnnotation)
    ]
    todo_annotations: list[TodoAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, TodoAnnotation)
    ]
    value_annotations: list[ValueAnnotation] = [
        annotation
        for annotation in annotations
        if isinstance(annotation, ValueAnnotation)
    ]
    annotationsv2 = AnnotationStore(
        boundary_annotations,
        called_after_annotations,
        complete_annotations,
        description_annotations,
        enum_annotations,
        group_annotations,
        move_annotations,
        pure_annotations,
        remove_annotations,
        rename_annotations,
        todo_annotations,
        value_annotations,
    )
    return annotationsv2
