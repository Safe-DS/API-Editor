from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    RenameAnnotation,
    TodoAnnotation,
)
from package_parser.processing.api.model import (
    Class,
    ClassDocumentation,
    Parameter,
    ParameterAssignment,
    ParameterDocumentation,
)
from package_parser.processing.migration.annotations import (
    get_migration_text,
    migration_author,
)
from package_parser.processing.migration.model import (
    ManyToOneMapping,
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


# pylint: disable=duplicate-code
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
        id_="test/test.rename.test3.Test",
        name="Test",
        qname="test.rename.test3.Test",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    classv2 = Class(
        id_="test/test.rename.test3/NewClass",
        qname="test.rename.test3.NewClass",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="class NewClass:\n    pass",
        instance_attributes=[],
    )
    mappings = OneToManyMapping(
        1.0, parameterv1, [parameterv2_a, parameterv2_b, classv2]
    )
    annotationv1 = RenameAnnotation(
        target="test/test.rename.test3.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestZ",
    )
    annotationv2_a = RenameAnnotation(
        target="test/test.rename.test3.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment=get_migration_text(annotationv1, mappings),
        reviewResult=EnumReviewResult.UNSURE,
        newName="TestZ",
    )
    annotationv2_b = RenameAnnotation(
        target="test/test.rename.test3.Test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestZ",
    )
    annotationv2_c = TodoAnnotation(
        target="test/test.rename.test3/NewClass",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(annotationv1, mappings, for_todo_annotation=True),
    )
    return (
        mappings,
        annotationv1,
        [annotationv2_a, annotationv2_b, annotationv2_c],
    )


def migrate_rename_annotation_data_duplicated() -> Tuple[
    Mapping,
    list[AbstractAnnotation],
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.rename.duplicate.Test_",
        name="Test",
        qname="test.rename.duplicate.Test_",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv1_2 = Parameter(
        id_="test/test.rename.duplicate.Test_2",
        name="Test",
        qname="test.rename.duplicate.Test_2",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.rename.duplicate.TestB",
        name="TestB",
        qname="test.rename.duplicate.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    mappings = ManyToOneMapping(1.0, [parameterv1, parameterv1_2], parameterv2)
    annotationv1 = RenameAnnotation(
        target="test/test.rename.duplicate.Test_",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestE",
    )
    annotationv1_2 = RenameAnnotation(
        target="test/test.rename.duplicate.Test_2",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestE",
    )
    annotationv2 = RenameAnnotation(
        target="test/test.rename.duplicate.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newName="TestE",
    )
    return mappings, [annotationv1, annotationv1_2], [annotationv2]
