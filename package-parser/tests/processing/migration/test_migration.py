from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    AnnotationStore,
)
from package_parser.processing.migration import migrate_annotations
from package_parser.processing.migration.model import Mapping
from tests.processing.migration.annotations.test_boundary_migration import (
    migrate_boundary_annotation_data_one_to_many_mapping,
    migrate_boundary_annotation_data_one_to_one_mapping,
    migrate_boundary_annotation_data_one_to_one_mapping_float_to_int,
    migrate_boundary_annotation_data_one_to_one_mapping_int_to_float,
)
from tests.processing.migration.annotations.test_called_after_migration import (
    migrate_called_after_annotation_data_one_to_many_mapping,
    migrate_called_after_annotation_data_one_to_many_mapping__two_classes,
    migrate_called_after_annotation_data_one_to_one_mapping,
    migrate_called_after_annotation_data_one_to_one_mapping__before_splits,
    migrate_called_after_annotation_data_one_to_one_mapping__no_mapping_found,
)
from tests.processing.migration.annotations.test_description_migration import (
    migrate_description_annotation_data_one_to_many_mapping__class,
    migrate_description_annotation_data_one_to_one_mapping__function,
    migrate_description_annotation_data_one_to_one_mapping__parameter,
)
from tests.processing.migration.annotations.test_enum_migration import (
    migrate_enum_annotation_data_one_to_many_mapping,
    migrate_enum_annotation_data_one_to_many_mapping__only_one_relevant_mapping,
    migrate_enum_annotation_data_one_to_one_mapping,
)
from tests.processing.migration.annotations.test_expert_migration import (
    migrate_expert_annotation_data__class,
    migrate_expert_annotation_data__function,
    migrate_expert_annotation_data__parameter,
)
from tests.processing.migration.annotations.test_group_annotation import (
    migrate_group_annotation_data_one_to_many_mapping,
    migrate_group_annotation_data_one_to_one_mapping,
    migrate_group_annotation_data_one_to_one_mapping__one_mapping_for_parameters,
)
from tests.processing.migration.annotations.test_move_migration import (
    migrate_move_annotation_data_one_to_many_mapping,
    migrate_move_annotation_data_one_to_one_mapping__class,
    migrate_move_annotation_data_one_to_one_mapping__global_function,
)
from tests.processing.migration.annotations.test_remove_migration import (
    migrate_remove_annotation_data_one_to_many_mapping,
    migrate_remove_annotation_data_one_to_one_mapping,
)
from tests.processing.migration.annotations.test_rename_migration import (
    migrate_rename_annotation_data_one_to_many_mapping,
    migrate_rename_annotation_data_one_to_many_mapping__with_changed_new_name,
    migrate_rename_annotation_data_one_to_one_mapping,
)
from tests.processing.migration.annotations.test_todo_migration import (
    migrate_todo_annotation_data_many_to_many_mapping,
    migrate_todo_annotation_data_one_to_many_mapping,
    migrate_todo_annotation_data_one_to_one_mapping,
)
from tests.processing.migration.annotations.test_value_migration import (
    migrate_constant_annotation_data_one_to_many_mapping,
    migrate_constant_annotation_data_one_to_one_mapping,
    migrate_omitted_annotation_data_one_to_many_mapping,
    migrate_omitted_annotation_data_one_to_one_mapping,
    migrate_optional_annotation_data_one_to_many_mapping,
    migrate_optional_annotation_data_one_to_one_mapping,
    migrate_required_annotation_data_one_to_many_mapping,
    migrate_required_annotation_data_one_to_one_mapping,
)

test_data = [
    # boundary annotation
    migrate_boundary_annotation_data_one_to_one_mapping(),
    migrate_boundary_annotation_data_one_to_one_mapping_int_to_float(),
    migrate_boundary_annotation_data_one_to_one_mapping_float_to_int(),
    migrate_boundary_annotation_data_one_to_many_mapping(),
    # called after annotation
    migrate_called_after_annotation_data_one_to_one_mapping(),
    migrate_called_after_annotation_data_one_to_many_mapping(),
    migrate_called_after_annotation_data_one_to_one_mapping__no_mapping_found(),
    migrate_called_after_annotation_data_one_to_one_mapping__before_splits(),
    migrate_called_after_annotation_data_one_to_many_mapping__two_classes(),
    # description annotation
    migrate_description_annotation_data_one_to_one_mapping__function(),
    migrate_description_annotation_data_one_to_many_mapping__class(),
    migrate_description_annotation_data_one_to_one_mapping__parameter(),
    # enum annotation
    migrate_enum_annotation_data_one_to_one_mapping(),
    migrate_enum_annotation_data_one_to_many_mapping(),
    migrate_enum_annotation_data_one_to_many_mapping__only_one_relevant_mapping(),
    # expert annotation
    migrate_expert_annotation_data__function(),
    migrate_expert_annotation_data__class(),
    migrate_expert_annotation_data__parameter(),
    # group annotation
    migrate_group_annotation_data_one_to_one_mapping(),
    migrate_group_annotation_data_one_to_many_mapping(),
    migrate_group_annotation_data_one_to_one_mapping__one_mapping_for_parameters(),
    # move annotation
    migrate_move_annotation_data_one_to_one_mapping__class(),
    migrate_move_annotation_data_one_to_one_mapping__global_function(),
    migrate_move_annotation_data_one_to_many_mapping(),
    # remove annotation
    migrate_remove_annotation_data_one_to_one_mapping(),
    migrate_remove_annotation_data_one_to_many_mapping(),
    # rename annotation
    migrate_rename_annotation_data_one_to_many_mapping__with_changed_new_name(),
    migrate_rename_annotation_data_one_to_one_mapping(),
    migrate_rename_annotation_data_one_to_many_mapping(),
    # to-do annotation
    migrate_todo_annotation_data_one_to_one_mapping(),
    migrate_todo_annotation_data_one_to_many_mapping(),
    migrate_todo_annotation_data_many_to_many_mapping(),
    # value annotation
    migrate_constant_annotation_data_one_to_one_mapping(),
    migrate_omitted_annotation_data_one_to_one_mapping(),
    migrate_required_annotation_data_one_to_one_mapping(),
    migrate_optional_annotation_data_one_to_one_mapping(),
    migrate_constant_annotation_data_one_to_many_mapping(),
    migrate_optional_annotation_data_one_to_many_mapping(),
    migrate_required_annotation_data_one_to_many_mapping(),
    migrate_omitted_annotation_data_one_to_many_mapping(),
]


def test_migrate_all_annotations() -> None:
    mappings: list[Mapping] = []
    annotation_store: AnnotationStore = AnnotationStore()
    expected_annotation_store: AnnotationStore = AnnotationStore()

    for mapping, annotationv1, annotationsv2 in test_data:
        if isinstance(mapping, list):
            mappings.extend(mapping)
        else:
            mappings.append(mapping)
        annotation_store.add_annotation(annotationv1)
        for expected_annotation in annotationsv2:
            expected_annotation_store.add_annotation(expected_annotation)

    actual_annotations = migrate_annotations(annotation_store, mappings)

    def get_key(annotation: AbstractAnnotation) -> str:
        return annotation.target

    assert sorted(actual_annotations.boundaryAnnotations, key=get_key) == sorted(
        expected_annotation_store.boundaryAnnotations, key=get_key
    )
    assert sorted(actual_annotations.calledAfterAnnotations, key=get_key) == sorted(
        expected_annotation_store.calledAfterAnnotations, key=get_key
    )
    assert sorted(actual_annotations.completeAnnotations, key=get_key) == sorted(
        expected_annotation_store.completeAnnotations, key=get_key
    )
    assert sorted(actual_annotations.descriptionAnnotations, key=get_key) == sorted(
        expected_annotation_store.descriptionAnnotations, key=get_key
    )
    assert sorted(actual_annotations.enumAnnotations, key=get_key) == sorted(
        expected_annotation_store.enumAnnotations, key=get_key
    )
    assert sorted(actual_annotations.groupAnnotations, key=get_key) == sorted(
        expected_annotation_store.groupAnnotations, key=get_key
    )
    assert sorted(actual_annotations.moveAnnotations, key=get_key) == sorted(
        expected_annotation_store.moveAnnotations, key=get_key
    )
    assert sorted(actual_annotations.pureAnnotations, key=get_key) == sorted(
        expected_annotation_store.pureAnnotations, key=get_key
    )
    assert sorted(actual_annotations.removeAnnotations, key=get_key) == sorted(
        expected_annotation_store.removeAnnotations, key=get_key
    )
    assert sorted(actual_annotations.renameAnnotations, key=get_key) == sorted(
        expected_annotation_store.renameAnnotations, key=get_key
    )
    assert sorted(actual_annotations.todoAnnotations, key=get_key) == sorted(
        expected_annotation_store.todoAnnotations, key=get_key
    )
    assert sorted(actual_annotations.valueAnnotations, key=get_key) == sorted(
        expected_annotation_store.valueAnnotations, key=get_key
    )
