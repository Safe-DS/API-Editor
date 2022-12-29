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
from package_parser.processing.migration.annotations import (
    get_migration_text,
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
]:
    parameterv1 = Parameter(
        id_="test/test.rename.test1.Test_",
        name="Test",
        qname="test.rename.test1.Test_",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.rename.test1.TestB",
        name="TestB",
        qname="test.rename.test1.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    mappings = OneToOneMapping(1.0, parameterv1, parameterv2)
    annotationv1 = RenameAnnotation(
        target="test/test.rename.test1.Test_",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestE",
    )
    annotationv2 = RenameAnnotation(
        target="test/test.rename.test1.TestB",
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
        id_="test/test.rename.test2.Test",
        name="Test",
        qname="test.rename.test2.Test",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.rename.test2.TestA",
        name="TestA",
        qname="test.rename.test2.TestA",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_b = Parameter(
        id_="test/test.rename.test2.TestB",
        name="TestB",
        qname="test.rename.test2.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    mappings = OneToManyMapping(1.0, parameterv1, [parameterv2_a, parameterv2_b])
    annotationv1 = RenameAnnotation(
        target="test/test.rename.test2.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestA",
    )
    annotationv2 = RenameAnnotation(
        target="test/test.rename.test2.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment=get_migration_text(annotationv1, mappings),
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
        id_="test/test.rename.test3.Test",
        name="Test",
        qname="test.rename.test3.Test",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.rename.test3.TestA",
        name="TestA",
        qname="test.rename.test3.TestA",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_b = Parameter(
        id_="test/test.rename.test3.TestB",
        name="TestB",
        qname="test.rename.test3.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    mappings = OneToManyMapping(1.0, parameterv1, [parameterv2_a, parameterv2_b])
    annotationv1 = RenameAnnotation(
        target="test/test.rename.test3.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestZ",
    )
    annotationv2_a = TodoAnnotation(
        target="test/test.rename.test3.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(annotationv1, mappings),
    )
    annotationv2_b = TodoAnnotation(
        target="test/test.rename.test3.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(annotationv1, mappings),
    )
    return (
        mappings,
        annotationv1,
        [annotationv2_a, annotationv2_b],
    )
