from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    MoveAnnotation,
    TodoAnnotation,
)
from package_parser.processing.api.model import (
    Class,
    ClassDocumentation,
    Function,
    FunctionDocumentation,
)
from package_parser.processing.migration import (
    ManyToOneMapping,
    Mapping,
    OneToManyMapping,
    OneToOneMapping,
)
from package_parser.processing.migration.annotations import (
    get_migration_text,
    migration_author,
)


# pylint: disable=duplicate-code
def migrate_move_annotation_data_one_to_one_mapping__global_function() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    functionv1 = Function(
        id="test/test.move.test1.test/test",
        qname="test.move.test1.test.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    functionv2 = Function(
        id="test/test.move.test1.test/new_test",
        qname="test.move.test1.test.new_test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    mapping = OneToOneMapping(1.0, functionv1, functionv2)

    annotationv1 = MoveAnnotation(
        target="test/test.move.test1.test/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.move.test1.destination",
    )
    annotationv2 = MoveAnnotation(
        target="test/test.move.test1.test/new_test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.move.test1.destination",
    )
    return mapping, annotationv1, [annotationv2]


# pylint: disable=duplicate-code
def migrate_move_annotation_data_one_to_one_mapping__class() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    classv1 = Class(
        id_="test/test.move.test2.test/MoveTestClass",
        qname="test.move.test2.test.MoveTestClass",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="class MoveTestClass:\n    pass",
        instance_attributes=[],
    )
    classv2 = Class(
        id_="test/test.move.test2.test/NewMoveTestClass",
        qname="test.move.test2.test.NewMoveTestClass",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="class NewMoveTestClass:\n    pass",
        instance_attributes=[],
    )

    mapping = OneToOneMapping(1.0, classv1, classv2)

    annotationv1 = MoveAnnotation(
        target="test/test.move.test2.test/MoveTestClass",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.move.test2.destination",
    )
    annotationv2 = MoveAnnotation(
        target="test/test.move.test2.test/NewMoveTestClass",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.move.test2.destination",
    )
    return mapping, annotationv1, [annotationv2]


def migrate_move_annotation_data_one_to_many_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:

    functionv1 = Function(
        id="test/test.move.test3.test/test",
        qname="test.move.test3.test.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    functionv2_a = Function(
        id="test/test.move.test3.test/new_test_a",
        qname="test.move.test3.test.new_test_a",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    functionv2_b = Function(
        id="test/test.move.test3.test/TestClass/new_test_b",
        qname="test.move.test3.test.TestClass.new_test_b",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    mapping = OneToManyMapping(1.0, functionv1, [functionv2_a, functionv2_b])

    annotationv1 = MoveAnnotation(
        target="test/test.move.test3.test/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.move.test3.destination",
    )
    annotationv2_a = MoveAnnotation(
        target="test/test.move.test3.test/new_test_a",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.move.test3.destination",
    )
    annotationv2_b = TodoAnnotation(
        target="test/test.move.test3.test/TestClass/new_test_b",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(annotationv1, mapping, for_todo_annotation=True),
    )
    return mapping, annotationv1, [annotationv2_a, annotationv2_b]


def migrate_move_annotation_data_one_to_one_mapping_duplicated() -> Tuple[
    Mapping,
    list[AbstractAnnotation],
    list[AbstractAnnotation],
]:
    functionv1 = Function(
        id="test/test.move.duplicate.test/test",
        qname="test.move.duplicate.test.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv1_2 = Function(
        id="test/test.move.duplicate.test/test_2",
        qname="test.move.duplicate.test.test_2",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    functionv2 = Function(
        id="test/test.move.duplicate.test/new_test",
        qname="test.move.duplicate.test.new_test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    mapping = ManyToOneMapping(1.0, [functionv1, functionv1_2], functionv2)

    annotationv1 = MoveAnnotation(
        target="test/test.move.duplicate.test/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.move.duplicate.destination",
    )
    annotationv1_2 = MoveAnnotation(
        target="test/test.move.duplicate.test/test_2",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.move.duplicate.destination",
    )
    annotationv2 = MoveAnnotation(
        target="test/test.move.duplicate.test/new_test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.move.duplicate.destination",
    )
    return mapping, [annotationv1, annotationv1_2], [annotationv2]
