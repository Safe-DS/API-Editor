from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    TodoAnnotation,
)
from package_parser.processing.api.model import (
    Parameter,
    ParameterAssignment,
    ParameterDocumentation,
)
from package_parser.processing.migration import ManyToManyMapping
from package_parser.processing.migration.annotations import (
    migration_author,
)
from package_parser.processing.migration.model import (
    Mapping,
    OneToManyMapping,
    OneToOneMapping,
)


def migrate_todo_annotation_data_one_to_one_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation]
]:
    parameterv1 = Parameter(
        id_="test/test.todo.Test1",
        name="Test1",
        qname="test.todo.Test1",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.todo.Test2",
        name="Test2",
        qname="test.todo.Test2",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    mappings = OneToOneMapping(1.0, parameterv1, parameterv2)
    annotationsv1 = TodoAnnotation(
        target="test/test.todo.Test1",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    annotationsv2 = TodoAnnotation(
        target="test/test.todo.Test2",
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
        id_="test/test.todo.Test3",
        name="Test3",
        qname="test.todo.Test3",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.todo.Test4",
        name="Test4",
        qname="test.todo.Test4",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv2_b = Parameter(
        id_="test/test.todo.Test5",
        name="Test5",
        qname="test.todo.Test5",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    mappings = OneToManyMapping(1.0, parameterv1, [parameterv2_a, parameterv2_b])
    annotationsv1 = TodoAnnotation(
        target="test/test.todo.Test3",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    annotationsv2_a = TodoAnnotation(
        target="test/test.todo.Test4",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    annotationsv2_b = TodoAnnotation(
        target="test/test.todo.Test5",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    return mappings, annotationsv1, [annotationsv2_a, annotationsv2_b]


def migrate_todo_annotation_data_many_to_many_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation]
]:
    parameterv1_a = Parameter(
        id_="test/test.todo.Test6",
        name="Test6",
        qname="test.todo.Test6",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv1_b = Parameter(
        id_="test/test.todo.Test7",
        name="Test7",
        qname="test.todo.Test7",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.todo.Test8",
        name="Test8",
        qname="test.todo.Test8",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    parameterv2_b = Parameter(
        id_="test/test.todo.Test9",
        name="Test9",
        qname="test.todo.Test9",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "", ""),
    )
    mappings = ManyToManyMapping(1.0, [parameterv1_a, parameterv1_b], [parameterv2_a, parameterv2_b])
    annotationv1 = TodoAnnotation(
        target="test/test.todo.Test6",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="todo",
    )
    annotationv2_a = TodoAnnotation(
        target="test/test.todo.Test8",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Todo Annotation with the todo 'todo' from the "
                "previous version was at 'test/test.todo.Test6' and "
                'the possible alternatives in the new version of the '
                'api are: Test8, Test9',
    )
    annotationv2_b = TodoAnnotation(
        target="test/test.todo.Test9",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Todo Annotation with the todo 'todo' from the "
                "previous version was at 'test/test.todo.Test6' and "
                'the possible alternatives in the new version of the '
                'api are: Test8, Test9',
    )
    return (
        mappings,
        annotationv1,
        [annotationv2_a, annotationv2_b],
    )
