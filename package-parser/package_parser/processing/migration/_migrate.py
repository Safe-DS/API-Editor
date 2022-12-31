from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    AnnotationStore,
    EnumReviewResult, BoundaryAnnotation, CalledAfterAnnotation, DescriptionAnnotation, EnumAnnotation,
    ExpertAnnotation, GroupAnnotation, MoveAnnotation, RemoveAnnotation, RenameAnnotation, TodoAnnotation,
    ValueAnnotation, ConstantAnnotation, OptionalAnnotation, OmittedAnnotation, RequiredAnnotation,
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
from typing import Optional, Tuple


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
        self._remove_duplicates()
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

    def _remove_duplicates(self):
        duplicates: list[Tuple[AbstractAnnotation, AbstractAnnotation]] = []
        for annotation_store in [self.migrated_annotation_store, self.unsure_annotation_store]:
            for annotation_type_store in [annotation_store.boundaryAnnotations,
                                          annotation_store.calledAfterAnnotations,
                                          annotation_store.descriptionAnnotations,
                                          annotation_store.enumAnnotations,
                                          annotation_store.expertAnnotations,
                                          annotation_store.groupAnnotations,
                                          annotation_store.moveAnnotations,
                                          annotation_store.removeAnnotations,
                                          annotation_store.renameAnnotations,
                                          annotation_store.todoAnnotations,
                                          annotation_store.valueAnnotations]:
                for annotation_a in annotation_type_store:
                    for annotation_b in annotation_type_store:
                        if _are_semantic_equal(annotation_a, annotation_b):
                            duplicates.append((annotation_a, annotation_b))
        for annotation_a, annotation_b in duplicates:
            # todo this
            pass


def _are_semantic_equal(annotation_a: AbstractAnnotation, annotation_b: AbstractAnnotation):
    # todo
    if annotation_a.target == annotation_b.target and isinstance(annotation_a, type(annotation_b)) and isinstance(annotation_b, type(annotation_a)):
        if isinstance(annotation_a, BoundaryAnnotation) and isinstance(annotation_b, BoundaryAnnotation):
            return annotation_a.interval == annotation_b.interval
        if isinstance(annotation_a, CalledAfterAnnotation) and isinstance(annotation_b, CalledAfterAnnotation):
            return annotation_a.calledAfterName == annotation_b.calledAfterName
        if isinstance(annotation_a, DescriptionAnnotation) and isinstance(annotation_b, DescriptionAnnotation):
            return annotation_a.newDescription == annotation_b.newDescription
        if isinstance(annotation_a, EnumAnnotation) and isinstance(annotation_b, EnumAnnotation):
            return annotation_a.enumName == annotation_b.enumName and set(annotation_a.pairs) == set(annotation_b.pairs)
        if isinstance(annotation_a, ExpertAnnotation) and isinstance(annotation_b, ExpertAnnotation):
            return True
        if isinstance(annotation_a, GroupAnnotation) and isinstance(annotation_b, GroupAnnotation):
            return annotation_a.groupName == annotation_b.groupName and set(annotation_a.parameters) == set(annotation_b.parameters)
        if isinstance(annotation_a, MoveAnnotation) and isinstance(annotation_b, MoveAnnotation):
            return annotation_a.destination == annotation_b.destination
        if isinstance(annotation_a, RemoveAnnotation) and isinstance(annotation_b, RemoveAnnotation):
            return True
        if isinstance(annotation_a, RenameAnnotation) and isinstance(annotation_b, RenameAnnotation):
            return annotation_a.newName == annotation_b.newName
        if isinstance(annotation_a, TodoAnnotation) and isinstance(annotation_b, TodoAnnotation):
            return annotation_a.newTodo == annotation_b
        if isinstance(annotation_a, ValueAnnotation) and isinstance(annotation_b, ValueAnnotation):
            if annotation_a.variant == annotation_b.variant:
                if isinstance(annotation_a, ConstantAnnotation) and isinstance(annotation_b, ConstantAnnotation):
                    return annotation_a.defaultValue == annotation_b.defaultValue and annotation_a.defaultValueType == annotation_b.defaultValueType
                if isinstance(annotation_a, OptionalAnnotation) and isinstance(annotation_b, OptionalAnnotation):
                    return annotation_a.defaultValue == annotation_b.defaultValue and annotation_a.defaultValueType == annotation_b.defaultValueType
                if isinstance(annotation_a, OmittedAnnotation) and isinstance(annotation_b, OmittedAnnotation):
                    return True
                if isinstance(annotation_a, RequiredAnnotation) and isinstance(annotation_b, RequiredAnnotation):
                    return True
    return False
