import json
import os
from copy import deepcopy

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    AnnotationStore, TodoAnnotation, EnumReviewResult
)
from package_parser.processing.api.model import API, Class, ClassDocumentation
from package_parser.processing.migration import APIMapping, Migration
from package_parser.processing.migration.model import Mapping, SimpleDiffer, ManyToOneMapping
from tests.processing.migration.annotations.test_boundary_migration import (
    migrate_boundary_annotation_data_duplicated,
    migrate_boundary_annotation_data_one_to_many_mapping,
    migrate_boundary_annotation_data_one_to_one_mapping,
    migrate_boundary_annotation_data_one_to_one_mapping_float_to_int,
    migrate_boundary_annotation_data_one_to_one_mapping_int_to_float,
)
from tests.processing.migration.annotations.test_called_after_migration import (
    migrate_called_after_annotation_data_duplicated,
    migrate_called_after_annotation_data_one_to_many_mapping,
    migrate_called_after_annotation_data_one_to_many_mapping__two_classes,
    migrate_called_after_annotation_data_one_to_one_mapping,
    migrate_called_after_annotation_data_one_to_one_mapping__before_splits,
    migrate_called_after_annotation_data_one_to_one_mapping__no_mapping_found,
)
from tests.processing.migration.annotations.test_description_migration import (
    migrate_description_annotation_data_duplicated,
    migrate_description_annotation_data_one_to_many_mapping__class,
    migrate_description_annotation_data_one_to_one_mapping__function,
    migrate_description_annotation_data_one_to_one_mapping__parameter,
)
from tests.processing.migration.annotations.test_enum_migration import (
    migrate_enum_annotation_data_duplicated,
    migrate_enum_annotation_data_one_to_many_mapping,
    migrate_enum_annotation_data_one_to_many_mapping__only_one_relevant_mapping,
    migrate_enum_annotation_data_one_to_one_mapping,
)
from tests.processing.migration.annotations.test_expert_migration import (
    migrate_expert_annotation_data__class,
    migrate_expert_annotation_data__function,
    migrate_expert_annotation_data__parameter,
    migrate_expert_annotation_data_duplicated,
)
from tests.processing.migration.annotations.test_group_annotation import (
    migrate_group_annotation_data_duplicated,
    migrate_group_annotation_data_one_to_many_mapping,
    migrate_group_annotation_data_one_to_one_mapping,
    migrate_group_annotation_data_one_to_one_mapping__one_mapping_for_parameters,
)
from tests.processing.migration.annotations.test_move_migration import (
    migrate_move_annotation_data_one_to_many_mapping,
    migrate_move_annotation_data_one_to_one_mapping__class,
    migrate_move_annotation_data_one_to_one_mapping__global_function,
    migrate_move_annotation_data_one_to_one_mapping_duplicated,
)
from tests.processing.migration.annotations.test_remove_migration import (
    migrate_remove_annotation_data_duplicated,
    migrate_remove_annotation_data_one_to_many_mapping,
    migrate_remove_annotation_data_one_to_one_mapping,
)
from tests.processing.migration.annotations.test_rename_migration import (
    migrate_rename_annotation_data_duplicated,
    migrate_rename_annotation_data_one_to_many_mapping,
    migrate_rename_annotation_data_one_to_one_mapping,
)
from tests.processing.migration.annotations.test_todo_migration import (
    migrate_todo_annotation_data_duplicated,
    migrate_todo_annotation_data_many_to_many_mapping,
    migrate_todo_annotation_data_one_to_many_mapping,
    migrate_todo_annotation_data_one_to_one_mapping,
)
from tests.processing.migration.annotations.test_value_migration import (
    migrate_constant_annotation_data_duplicated,
    migrate_constant_annotation_data_one_to_many_mapping,
    migrate_constant_annotation_data_one_to_one_mapping,
    migrate_omitted_annotation_data_duplicated,
    migrate_omitted_annotation_data_one_to_many_mapping,
    migrate_omitted_annotation_data_one_to_one_mapping,
    migrate_optional_annotation_data_duplicated,
    migrate_optional_annotation_data_one_to_many_mapping,
    migrate_optional_annotation_data_one_to_one_mapping,
    migrate_required_annotation_data_duplicated,
    migrate_required_annotation_data_one_to_many_mapping,
    migrate_required_annotation_data_one_to_one_mapping,
)

test_data = [
    # boundary annotation
    migrate_boundary_annotation_data_one_to_one_mapping(),
    migrate_boundary_annotation_data_one_to_one_mapping_int_to_float(),
    migrate_boundary_annotation_data_one_to_one_mapping_float_to_int(),
    migrate_boundary_annotation_data_one_to_many_mapping(),
    migrate_boundary_annotation_data_duplicated(),
    # called after annotation
    migrate_called_after_annotation_data_one_to_one_mapping(),
    migrate_called_after_annotation_data_one_to_many_mapping(),
    migrate_called_after_annotation_data_one_to_one_mapping__no_mapping_found(),
    migrate_called_after_annotation_data_one_to_one_mapping__before_splits(),
    migrate_called_after_annotation_data_one_to_many_mapping__two_classes(),
    migrate_called_after_annotation_data_duplicated(),
    # description annotation
    migrate_description_annotation_data_one_to_one_mapping__function(),
    migrate_description_annotation_data_one_to_many_mapping__class(),
    migrate_description_annotation_data_one_to_one_mapping__parameter(),
    migrate_description_annotation_data_duplicated(),
    # enum annotation
    migrate_enum_annotation_data_one_to_one_mapping(),
    migrate_enum_annotation_data_one_to_many_mapping(),
    migrate_enum_annotation_data_one_to_many_mapping__only_one_relevant_mapping(),
    migrate_enum_annotation_data_duplicated(),
    # expert annotation
    migrate_expert_annotation_data__function(),
    migrate_expert_annotation_data__class(),
    migrate_expert_annotation_data__parameter(),
    migrate_expert_annotation_data_duplicated(),
    # group annotation
    migrate_group_annotation_data_one_to_one_mapping(),
    migrate_group_annotation_data_one_to_many_mapping(),
    migrate_group_annotation_data_one_to_one_mapping__one_mapping_for_parameters(),
    migrate_group_annotation_data_duplicated(),
    # move annotation
    migrate_move_annotation_data_one_to_one_mapping__class(),
    migrate_move_annotation_data_one_to_one_mapping__global_function(),
    migrate_move_annotation_data_one_to_many_mapping(),
    migrate_move_annotation_data_one_to_one_mapping_duplicated(),
    # remove annotation
    migrate_remove_annotation_data_one_to_one_mapping(),
    migrate_remove_annotation_data_one_to_many_mapping(),
    migrate_remove_annotation_data_duplicated(),
    # rename annotation
    migrate_rename_annotation_data_one_to_one_mapping(),
    migrate_rename_annotation_data_one_to_many_mapping(),
    migrate_rename_annotation_data_duplicated(),
    # to-do annotation
    migrate_todo_annotation_data_one_to_one_mapping(),
    migrate_todo_annotation_data_one_to_many_mapping(),
    migrate_todo_annotation_data_many_to_many_mapping(),
    migrate_todo_annotation_data_duplicated(),
    # value annotation
    migrate_constant_annotation_data_one_to_one_mapping(),
    migrate_omitted_annotation_data_one_to_one_mapping(),
    migrate_required_annotation_data_one_to_one_mapping(),
    migrate_optional_annotation_data_one_to_one_mapping(),
    migrate_constant_annotation_data_one_to_many_mapping(),
    migrate_optional_annotation_data_one_to_many_mapping(),
    migrate_required_annotation_data_one_to_many_mapping(),
    migrate_omitted_annotation_data_one_to_many_mapping(),
    migrate_constant_annotation_data_duplicated(),
    migrate_omitted_annotation_data_duplicated(),
    migrate_required_annotation_data_duplicated(),
    migrate_optional_annotation_data_duplicated(),
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
        if isinstance(annotationv1, list):
            for annotationv1_ in annotationv1:
                annotation_store.add_annotation(annotationv1_)
        else:
            annotation_store.add_annotation(annotationv1)
        for expected_annotation in annotationsv2:
            expected_annotation_store.add_annotation(expected_annotation)

    migration = Migration(annotation_store, mappings)
    migration.migrate_annotations()

    for value in migration.unsure_migrated_annotation_store.to_json().values():
        if isinstance(value, dict):
            assert len(value) == 0

    _assert_annotation_stores_are_equal(
        migration.migrated_annotation_store, expected_annotation_store
    )


def test_migrate_command_and_both_annotation_stores() -> None:
    apiv1_json_path = os.path.join(
        os.getcwd(), "tests", "data", "migration", "apiv1_data.json"
    )
    apiv2_json_path = os.path.join(
        os.getcwd(), "tests", "data", "migration", "apiv2_data.json"
    )
    annotationsv1_json_path = os.path.join(
        os.getcwd(), "tests", "data", "migration", "annotationv1.json"
    )
    annotationsv2_json_path = os.path.join(
        os.getcwd(), "tests", "data", "migration", "annotationv2.json"
    )
    unsure_annotationsv2_json_path = os.path.join(
        os.getcwd(), "tests", "data", "migration", "unsure_annotationv2.json"
    )
    with open(apiv1_json_path, "r", encoding="utf-8") as apiv1_file, open(
        apiv2_json_path, "r", encoding="utf-8"
    ) as apiv2_file, open(
        annotationsv1_json_path, "r", encoding="utf-8"
    ) as annotationsv1_file, open(
        annotationsv2_json_path, "r", encoding="utf-8"
    ) as annotationsv2_file, open(
        unsure_annotationsv2_json_path, "r", encoding="utf-8"
    ) as unsure_annotationsv2_file:
        apiv1_json = json.load(apiv1_file)
        apiv1 = API.from_json(apiv1_json)
        apiv2_json = json.load(apiv2_file)
        apiv2 = API.from_json(apiv2_json)
        annotationsv1_json = json.load(annotationsv1_file)
        annotationsv1 = AnnotationStore.from_json(annotationsv1_json)
        expected_annotationsv2_json = json.load(annotationsv2_file)
        annotationsv2 = AnnotationStore.from_json(expected_annotationsv2_json)
        expected_unsure_annotationsv2_json = json.load(unsure_annotationsv2_file)
        unsure_annotationsv2 = AnnotationStore.from_json(
            expected_unsure_annotationsv2_json
        )

        differ = SimpleDiffer(None, [], apiv1, apiv2)
        api_mapping = APIMapping(
            apiv1, apiv2, differ, threshold_of_similarity_between_mappings=0.3
        )
        mappings = api_mapping.map_api()
        migration = Migration(
            annotationsv1, mappings, reliable_similarity=0.9, unsure_similarity=0.75
        )
        migration.migrate_annotations()

        _assert_annotation_stores_are_equal(
            migration.migrated_annotation_store, annotationsv2
        )
        _assert_annotation_stores_are_equal(
            migration.unsure_migrated_annotation_store, unsure_annotationsv2
        )


def _assert_annotation_stores_are_equal(
    actual_annotations: AnnotationStore, expected_annotation_store: AnnotationStore
) -> None:
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


def test_handle_duplicates() -> None:
    classv1_a = Class(
        "test/test.duplicate/TestClass",
        "Test",
        [],
        [],
        True,
        [],
        ClassDocumentation("", ""),
        "",
        [],
    )
    classv1_b = deepcopy(classv1_a)
    classv1_b.id = "test/test.duplicate/TestClass2"
    classv2 = deepcopy(classv1_a)
    base_annotation = TodoAnnotation(classv1_a.id,
                                     [""],
                                     [""],
                                     "",
                                     EnumReviewResult.NONE,
                                     "todo")
    duplicate_in_apiv2 = TodoAnnotation(classv1_b.id,
                                        [""],
                                        [""],
                                        "",
                                        EnumReviewResult.NONE,
                                        "todo")
    same_target_and_type_in_apiv2 = TodoAnnotation(classv1_b.id,
                                                   [""],
                                                   [""],
                                                   "",
                                                   EnumReviewResult.NONE,
                                                   "lightbringer")
    same_target_and_type_in_both_api_versions = TodoAnnotation(classv1_a.id,
                                                               [""],
                                                               [""],
                                                               "",
                                                               EnumReviewResult.NONE,
                                                               "darkage")
    annotation_store = AnnotationStore()
    annotation_store.todoAnnotations = [base_annotation, duplicate_in_apiv2, same_target_and_type_in_apiv2,
                                        same_target_and_type_in_both_api_versions]
    migration = Migration(annotation_store, [ManyToOneMapping(1.0, [classv1_a, classv1_b], classv2)])
    migration.migrate_annotations()
    store = AnnotationStore()
    store.add_annotation(TodoAnnotation.from_json(

        {
            'authors': ['', 'migration'],
            'comment': "Conflicting Attribute during migration: {'newTodo': 'lightbringer'}, {'newTodo': 'todo'}",
            'newTodo': 'darkage',
            'reviewResult': 'unsure',
            'reviewers': [''],
            'target': 'test/test.duplicate/TestClass'
        }

    ))
    migrated_annotation_store = migration.migrated_annotation_store.to_json()
    todoAnnotations = migrated_annotation_store.pop("todoAnnotations")
    migrated_annotation_store["todoAnnotations"] = {}
    assert migrated_annotation_store == migration.unsure_migrated_annotation_store.to_json() == AnnotationStore().to_json()
    assert len(todoAnnotations) == 1
    todo_values = ['darkage', 'lightbringer', "todo"]
    assert todoAnnotations[classv2.id]["newTodo"] in todo_values
    todo_values.remove(todoAnnotations[classv2.id].pop("newTodo"))
    assert todoAnnotations[classv2.id] == {
        'authors': ['', 'migration'],
        'comment': "Conflicting Attribute during migration: {'newTodo': '"+todo_values[0]+"'}, {'newTodo': '"+todo_values[1]+"'}",
        'reviewResult': 'unsure',
        'reviewers': [''],
        'target': 'test/test.duplicate/TestClass'
    }
