from typing import Callable, Tuple

import pytest
from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    AnnotationStore,
    EnumReviewResult,
    RenameAnnotation,
    TodoAnnotation,
)
from package_parser.processing.api.model import (
    Parameter,
    ParameterAssignment,
    ParameterDocumentation,
)
from package_parser.processing.migration import migrate_annotations
from package_parser.processing.migration.annotations import (
    migrate_rename_annotation,
    migration_author,
)
from package_parser.processing.migration.model import (
    Mapping,
    OneToManyMapping,
    OneToOneMapping,
)


def migrate_rename_annotation_data_one_to_one_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
    Callable[[RenameAnnotation, Mapping], list[AbstractAnnotation]],
]:
    parameterv1 = Parameter(
        id_="test/test.Test_",
        name="Test",
        qname="test.Test",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.TestB",
        name="TestB",
        qname="test.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    mappings = OneToOneMapping(1.0, parameterv1, parameterv2)
    annotationsv1 = RenameAnnotation(
        target="test/test.Test_",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestE",
    )
    annotationsv2 = RenameAnnotation(
        target="test/test.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestE",
    )
    return mappings, annotationsv1, [annotationsv2], migrate_rename_annotation


def migrate_rename_annotation_data_one_to_many_mapping__with_changed_new_name() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
    Callable[[RenameAnnotation, Mapping], list[AbstractAnnotation]],
]:
    parameterv1 = Parameter(
        id_="test/test.Test",
        name="Test",
        qname="test.Test",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.TestA",
        name="TestA",
        qname="test.TestA",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_b = Parameter(
        id_="test/test.TestB",
        name="TestB",
        qname="test.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    mappings = OneToManyMapping(1.0, parameterv1, [parameterv2_a, parameterv2_b])
    annotationsv1 = RenameAnnotation(
        target="test/test.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestA",
    )
    annotationsv2 = RenameAnnotation(
        target="test/test.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="The @Rename Annotation with the new name 'TestA' from the previous version was at 'test/test.Test' and the possible alternatives in the new version of the api are: TestA, TestB",
        reviewResult=EnumReviewResult.UNSURE,
        newName="TestA",
    )
    return mappings, annotationsv1, [annotationsv2], migrate_rename_annotation


def migrate_rename_annotation_data_one_to_many_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
    Callable[[RenameAnnotation, Mapping], list[AbstractAnnotation]],
]:
    parameterv1 = Parameter(
        id_="test/test.Test",
        name="Test",
        qname="test.Test",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.TestA",
        name="TestA",
        qname="test.TestA",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_b = Parameter(
        id_="test/test.TestB",
        name="TestB",
        qname="test.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    mappings = OneToManyMapping(1.0, parameterv1, [parameterv2_a, parameterv2_b])
    annotationsv1 = RenameAnnotation(
        target="test/test.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestZ",
    )
    annotationsv2_a = TodoAnnotation(
        target="test/test.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="The @Rename Annotation with the new name 'TestZ' from the previous version was at 'test/test.Test' and the possible alternatives in the new version of the api are: TestA, TestB",
    )
    annotationsv2_b = TodoAnnotation(
        target="test/test.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="The @Rename Annotation with the new name 'TestZ' from the previous version was at 'test/test.Test' and the possible alternatives in the new version of the api are: TestA, TestB",
    )
    return (
        mappings,
        annotationsv1,
        [annotationsv2_a, annotationsv2_b],
        migrate_rename_annotation,
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
