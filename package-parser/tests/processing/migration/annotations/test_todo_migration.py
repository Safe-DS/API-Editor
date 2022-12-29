from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    TodoAnnotation,
)
from package_parser.processing.api.model import (
    Class,
    ClassDocumentation,
    Parameter,
    ParameterAssignment,
    ParameterDocumentation,
)
from package_parser.processing.migration import ManyToManyMapping
from package_parser.processing.migration.annotations import (
    get_migration_text,
    migration_author,
)
from package_parser.processing.migration.model import (
    Mapping,
    OneToManyMapping,
    OneToOneMapping,
)


def migrate_todo_annotation_data_one_to_one_mapping() -> Tuple[
    Mapping, AbstractAnnotation, list[AbstractAnnotation]
]:
    parameterv1 = Parameter(
        id_="test/test.todo.test1.Test",
        name="Test1",
        qname="test.todo.test1.Test",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.todo.test1.Test",
        name="Test",
        qname="test.todo.test1.Test",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    mappings = OneToOneMapping(1.0, parameterv1, parameterv2)
    annotationsv1 = TodoAnnotation(
        target="test/test.todo.test1.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    annotationsv2 = TodoAnnotation(
        target="test/test.todo.test1.Test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    return mappings, annotationsv1, [annotationsv2]


def migrate_todo_annotation_data_one_to_many_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.todo.test2.Test",
        name="Test",
        qname="test.todo.test2.Test",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.todo.test2.TestA",
        name="TestA",
        qname="test.todo.test2.TestA",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv2_b = Parameter(
        id_="test/test.todo.test2.TestB",
        name="TestB",
        qname="test.todo.test2.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    mappings = OneToManyMapping(1.0, parameterv1, [parameterv2_a, parameterv2_b])
    annotationsv1 = TodoAnnotation(
        target="test/test.todo.test2.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    annotationsv2_a = TodoAnnotation(
        target="test/test.todo.test2.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    annotationsv2_b = TodoAnnotation(
        target="test/test.todo.test2.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    return mappings, annotationsv1, [annotationsv2_a, annotationsv2_b]


def migrate_todo_annotation_data_many_to_many_mapping() -> Tuple[
    Mapping, AbstractAnnotation, list[AbstractAnnotation]
]:
    parameterv1_a = Parameter(
        id_="test/test.todo.test3.TestA",
        name="TestA",
        qname="test.todo.test3.TestA",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv1_b = Parameter(
        id_="test/test.todo.test3.TestB",
        name="TestB",
        qname="test.todo.test3.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.todo.test3.NewTestA",
        name="NewTestA",
        qname="test.todo.test3.NewTestA",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv2_b = Parameter(
        id_="test/test.todo.test3.NewTestB",
        name="NewTestB",
        qname="test.todo.test3.NewTestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    # pylint: disable=duplicate-code
    classv2 = Class(
        id_="test/test.todo.test3.TestTodoClass",
        qname="test.todo.test3.TestTodoClass",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="class TestTodoClass:\n    pass",
        instance_attributes=[],
    )
    mappings = ManyToManyMapping(
        1.0, [parameterv1_a, parameterv1_b], [parameterv2_a, parameterv2_b, classv2]
    )
    annotationv1 = TodoAnnotation(
        target="test/test.todo.test3.TestA",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    annotationv2_a = TodoAnnotation(
        target="test/test.todo.test3.NewTestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    annotationv2_b = TodoAnnotation(
        target="test/test.todo.test3.NewTestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    annotationv2_class = TodoAnnotation(
        target="test/test.todo.test3.TestTodoClass",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo=get_migration_text(annotationv1, mappings),
    )
    return (
        mappings,
        annotationv1,
        [annotationv2_a, annotationv2_b, annotationv2_class],
    )
