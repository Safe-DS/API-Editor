from typing import Callable
import pytest

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    AnnotationStore,
)
from package_parser.processing.migration import migrate_annotations
from package_parser.processing.migration.model import Mapping
from tests.processing.migration.annotations.test_rename_migration import (
    migrate_rename_annotation_data_one_to_many_mapping,
    migrate_rename_annotation_data_one_to_many_mapping__with_changed_new_name,
    migrate_rename_annotation_data_one_to_one_mapping,
)

test_data = [
    migrate_rename_annotation_data_one_to_many_mapping__with_changed_new_name(),
    migrate_rename_annotation_data_one_to_one_mapping(),
    migrate_rename_annotation_data_one_to_many_mapping(),
]


@pytest.mark.parametrize(
    "mappings,annotationv1,expected_annotationsv2,migrate", test_data
)
def test_migrate_annotations(
    mappings: Mapping,
    annotationv1: AbstractAnnotation,
    expected_annotationsv2: list[AbstractAnnotation],
    migrate: Callable[[AbstractAnnotation, Mapping], list[AbstractAnnotation]],
):
    assert migrate(annotationv1, mappings) == expected_annotationsv2


def test_migrate_all_annotations():
    mappings: list[Mapping] = []
    annotation_store: AnnotationStore = AnnotationStore()
    expected_annotation_store: AnnotationStore = AnnotationStore()

    for mapping, annotationv1, annotationsv2, _ in test_data:
        mappings.append(mapping)
        annotation_store.add_annotation(annotationv1)
        for expected_annotation in annotationsv2:
            expected_annotation_store.add_annotation(expected_annotation)
    assert migrate_annotations(annotation_store, mappings) == expected_annotation_store
