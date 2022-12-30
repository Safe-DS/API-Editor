from typing import Optional

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    AnnotationStore,
    EnumReviewResult,
)
from package_parser.processing.api.model import Attribute, Result
from package_parser.processing.migration.annotations import (
    migrate_boundary_annotation,
    migrate_called_after_annotation,
    migrate_description_annotation,
    migrate_enum_annotation,
    migrate_expert_annotation,
    migrate_group_annotation,
    migrate_move_annotation,
    migrate_remove_annotation,
    migrate_rename_annotation,
    migrate_todo_annotation,
    migrate_value_annotation,
)
from package_parser.processing.migration.model import Mapping


class Migration:
    reliable_similarity: float
    unsure_similarity: float
    migrated_annotation_store: AnnotationStore = AnnotationStore()
    unsure_annotation_store: AnnotationStore = AnnotationStore()

    def __init__(
        self, reliable_similarity: float = 0.9, unsure_similarity: float = 0.5
    ) -> None:
        self.reliable_similarity = reliable_similarity
        self.unsure_similarity = unsure_similarity

    @staticmethod
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
        self, annotationsv1: AnnotationStore, mappings: list[Mapping]
    ) -> AnnotationStore:
        for boundary_annotation in annotationsv1.boundaryAnnotations:
            mapping = self._get_mapping_from_annotation(boundary_annotation, mappings)
            if mapping is not None:
                for annotation in migrate_boundary_annotation(
                    boundary_annotation, mapping
                ):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for called_after_annotation in annotationsv1.calledAfterAnnotations:
            mapping = self._get_mapping_from_annotation(
                called_after_annotation, mappings
            )
            if mapping is not None:
                for annotation in migrate_called_after_annotation(
                    called_after_annotation, mapping, mappings
                ):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for description_annotation in annotationsv1.descriptionAnnotations:
            mapping = self._get_mapping_from_annotation(
                description_annotation, mappings
            )
            if mapping is not None:
                for annotation in migrate_description_annotation(
                    description_annotation, mapping
                ):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for enum_annotation in annotationsv1.enumAnnotations:
            mapping = self._get_mapping_from_annotation(enum_annotation, mappings)
            if mapping is not None:
                for annotation in migrate_enum_annotation(enum_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for expert_annotation in annotationsv1.expertAnnotations:
            mapping = self._get_mapping_from_annotation(expert_annotation, mappings)
            if mapping is not None:
                for annotation in migrate_expert_annotation(expert_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for group_annotation in annotationsv1.groupAnnotations:
            mapping = self._get_mapping_from_annotation(group_annotation, mappings)
            if mapping is not None:
                for annotation in migrate_group_annotation(
                    group_annotation, mapping, mappings
                ):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for move_annotation in annotationsv1.moveAnnotations:
            mapping = self._get_mapping_from_annotation(move_annotation, mappings)
            if mapping is not None:
                for annotation in migrate_move_annotation(move_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for rename_annotation in annotationsv1.renameAnnotations:
            mapping = self._get_mapping_from_annotation(rename_annotation, mappings)
            if mapping is not None:
                for annotation in migrate_rename_annotation(rename_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for remove_annotation in annotationsv1.removeAnnotations:
            mapping = self._get_mapping_from_annotation(remove_annotation, mappings)
            if mapping is not None:
                for annotation in migrate_remove_annotation(remove_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for todo_annotation in annotationsv1.todoAnnotations:
            mapping = self._get_mapping_from_annotation(todo_annotation, mappings)
            if mapping is not None:
                for annotation in migrate_todo_annotation(todo_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        for value_annotation in annotationsv1.valueAnnotations:
            mapping = self._get_mapping_from_annotation(value_annotation, mappings)
            if mapping is not None:
                for annotation in migrate_value_annotation(value_annotation, mapping):
                    self.add_annotations_based_on_similarity(
                        annotation, mapping.get_similarity()
                    )

        return self.migrated_annotation_store

    def add_annotations_based_on_similarity(
        self, annotation: AbstractAnnotation, similarity: float
    ) -> None:
        if similarity >= self.reliable_similarity:
            self.migrated_annotation_store.add_annotation(annotation)
        elif similarity >= self.unsure_similarity:
            annotation.reviewResult = EnumReviewResult.UNSURE
            self.migrated_annotation_store.add_annotation(annotation)
        else:
            self.unsure_annotation_store.add_annotation(annotation)
