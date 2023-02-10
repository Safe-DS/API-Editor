from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    DescriptionAnnotation,
    EnumReviewResult,
    TodoAnnotation,
)
from package_parser.processing.api.model import (
    Class,
    ClassDocumentation,
    Function,
    FunctionDocumentation,
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


# pylint: disable=duplicate-code
def migrate_description_annotation_data_one_to_one_mapping__function() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    functionv1 = Function(
        id="test/test.description.test1.test/test",
        qname="test.description.test1.test.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    functionv2 = Function(
        id="test/test.description.test1.test/new_test",
        qname="test.description.test1.test.new_test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    mapping = OneToOneMapping(1.0, functionv1, functionv2)

    annotationv1 = DescriptionAnnotation(
        target="test/test.description.test1.test/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newDescription="lightbringer",
    )
    annotationv2 = DescriptionAnnotation(
        target="test/test.description.test1.test/new_test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newDescription="lightbringer",
    )
    return mapping, annotationv1, [annotationv2]


# pylint: disable=duplicate-code
def migrate_description_annotation_data_one_to_many_mapping__class() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:

    classv1 = Class(
        id_="test/test.description.test2.test/DescriptionTestClass",
        qname="test.description.test2.test.DescriptionTestClass",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="class DescriptionTestClass:\n    pass",
        instance_attributes=[],
    )
    classv2_a = Class(
        id_="test/test.description.test2.test/NewDescriptionTestClass",
        qname="test.description.test2.test.NewDescriptionTestClass",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="class NewDescriptionTestClass:\n    pass",
        instance_attributes=[],
    )
    classv2_b = Class(
        id_="test/test.description.test2.test/NewDescriptionTestClass2",
        qname="test.description.test2.test.NewDescriptionTestClass2",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="class NewDescriptionTestClass2:\n    pass",
        instance_attributes=[],
    )
    functionv2 = Function(
        id="test/test.description.test2.test/TestClass/new_test",
        qname="test.description.test2.test.TestClass.new_test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    mapping = OneToManyMapping(1.0, classv1, [classv2_a, classv2_b, functionv2])

    annotationv1 = DescriptionAnnotation(
        target="test/test.description.test2.test/DescriptionTestClass",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newDescription="42",
    )
    annotationv2_a = DescriptionAnnotation(
        target="test/test.description.test2.test/NewDescriptionTestClass",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newDescription="42",
    )
    annotationv2_b = DescriptionAnnotation(
        target="test/test.description.test2.test/NewDescriptionTestClass2",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newDescription="42",
    )
    annotationv2_c = TodoAnnotation(
        target="test/test.description.test2.test/TestClass/new_test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(annotationv1, mapping, for_todo_annotation=True),
    )
    return mapping, annotationv1, [annotationv2_a, annotationv2_b, annotationv2_c]


def migrate_description_annotation_data_one_to_one_mapping__parameter() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.description.test3/test.test",
        qname="test.description.test3.test.test",
        name="test",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )

    parameterv2 = Parameter(
        id_="test/test.description.test3/test.new_test",
        qname="test.description.test3.test.new_test",
        name="new_test",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )

    mapping = OneToOneMapping(1.0, parameterv1, parameterv2)

    annotationv1 = DescriptionAnnotation(
        target="test/test.description.test3/test.test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newDescription="test description",
    )
    annotationv2 = DescriptionAnnotation(
        target="test/test.description.test3/test.new_test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newDescription="test description",
    )
    return mapping, annotationv1, [annotationv2]


def migrate_description_annotation_data_duplicated() -> Tuple[
    Mapping,
    list[AbstractAnnotation],
    list[AbstractAnnotation],
]:
    functionv1 = Function(
        id="test/test.description.duplicate.test/test",
        qname="test.description.duplicate.test.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv1_2 = Function(
        id="test/test.description.duplicate.test/test_2",
        qname="test.description.duplicate.test.test_2",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    functionv2 = Function(
        id="test/test.description.duplicate.test/new_test",
        qname="test.description.duplicate.test.new_test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    mapping = ManyToOneMapping(1.0, [functionv1, functionv1_2], functionv2)

    annotationv1 = DescriptionAnnotation(
        target="test/test.description.duplicate.test/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newDescription="lightbringer",
    )
    annotationv1_2 = DescriptionAnnotation(
        target="test/test.description.duplicate.test/test_2",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newDescription="lightbringer",
    )
    annotationv2 = DescriptionAnnotation(
        target="test/test.description.duplicate.test/new_test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newDescription="lightbringer",
    )
    return mapping, [annotationv1, annotationv1_2], [annotationv2]
