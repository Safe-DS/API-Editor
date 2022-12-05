from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    RenameAnnotation,
    TodoAnnotation,
)
from package_parser.processing.api.model import (
    Parameter,
    ParameterAssignment,
    ParameterDocumentation,
)
from package_parser.processing.migration.annotations import migration_author
from package_parser.processing.migration.model import (
    Mapping,
    OneToManyMapping,
    OneToOneMapping,
)


def migrate_rename_annotation_data_one_to_one_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
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
    annotationv1 = RenameAnnotation(
        target="test/test.Test_",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestE",
    )
    annotationv2 = RenameAnnotation(
        target="test/test.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestE",
    )
    return mappings, annotationv1, [annotationv2]


def migrate_rename_annotation_data_one_to_many_mapping__with_changed_new_name() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.rename.Test",
        name="Test",
        qname="test.rename.Test",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.rename.TestA",
        name="TestA",
        qname="test.rename.TestA",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_b = Parameter(
        id_="test/test.rename.TestB",
        name="TestB",
        qname="test.rename.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    mappings = OneToManyMapping(1.0, parameterv1, [parameterv2_a, parameterv2_b])
    annotationv1 = RenameAnnotation(
        target="test/test.rename.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestA",
    )
    annotationv2 = RenameAnnotation(
        target="test/test.rename.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="The @Rename Annotation with the new name 'TestA' from the previous version was at 'test/test.rename.Test' and the possible alternatives in the new version of the api are: TestA, TestB",
        reviewResult=EnumReviewResult.UNSURE,
        newName="TestA",
    )
    return mappings, annotationv1, [annotationv2]


def migrate_rename_annotation_data_one_to_many_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.rename.Test",
        name="Test",
        qname="test.rename.Test",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.rename.TestA",
        name="TestA",
        qname="test.rename.TestA",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_b = Parameter(
        id_="test/test.rename.TestB",
        name="TestB",
        qname="test.rename.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    mappings = OneToManyMapping(1.0, parameterv1, [parameterv2_a, parameterv2_b])
    annotationv1 = RenameAnnotation(
        target="test/test.rename.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestZ",
    )
    annotationv2_a = TodoAnnotation(
        target="test/test.rename.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="The @Rename Annotation with the new name 'TestZ' from the previous version was at 'test/test.rename.Test' and the possible alternatives in the new version of the api are: TestA, TestB",
    )
    annotationv2_b = TodoAnnotation(
        target="test/test.rename.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="The @Rename Annotation with the new name 'TestZ' from the previous version was at 'test/test.rename.Test' and the possible alternatives in the new version of the api are: TestA, TestB",
    )
    return (
        mappings,
        annotationv1,
        [annotationv2_a, annotationv2_b],
    )
