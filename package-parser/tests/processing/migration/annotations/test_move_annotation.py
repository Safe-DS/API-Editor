from typing import Tuple

from package_parser.processing.annotations.model import AbstractAnnotation, MoveAnnotation, EnumReviewResult, \
    TodoAnnotation
from package_parser.processing.api.model import Function, FunctionDocumentation, Class, ClassDocumentation
from package_parser.processing.migration import Mapping, OneToOneMapping, OneToManyMapping
from package_parser.processing.migration.annotations import migration_author, get_migration_text


def migrate_move_annotation_data_one_to_one_mapping__global_function() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    functionv1 = Function(
        id="test/test.value.test1.test/test",
        qname="test.value.test1.test/test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    functionv2 = Function(
        id="test/test.value.test1.test/new_test",
        qname="test.value.test1.test/new_test",
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
        target="test/test.value.test1.test/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.value.test1.destination",
    )
    annotationv2 = MoveAnnotation(
        target="test/test.value.test1.test/new_test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.value.test1.destination",
    )
    return mapping, annotationv1, [annotationv2]


def migrate_move_annotation_data_one_to_one_mapping__class() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    classv1 = Class(
        id_="test/test.value.test2.test/MoveTestClass",
        qname="test.value.test2.test.TestClass",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="class MoveTestClass:\n    pass",
        instance_attributes=[],
    )
    classv2 = Class(
        id_="test/test.value.test2.test/newTestClass",
        qname="test.value.test2.test/newTestClass",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="",
        instance_attributes=[],
    )

    mapping = OneToOneMapping(1.0, classv1, classv2)

    annotationv1 = MoveAnnotation(
        target="test/test.value.test2.test/MoveTestClass",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.value.test2.destination",
    )
    annotationv2 = MoveAnnotation(
        target="test/test.value.test2.test/newTestClass",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.value.test2.destination",
    )
    return mapping, annotationv1, [annotationv2]


def migrate_move_annotation_data_one_to_many_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:

    functionv1 = Function(
        id="test/test.value.test3.test/test",
        qname="test.value.test3.test.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    functionv2_a = Function(
        id="test/test.value.test3.test/new_test_a",
        qname="test.value.test3.test.new_test_a",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    functionv2_b = Function(
        id="test/test.value.test3.test/TestClass/new_test_b",
        qname="test.value.test3.test.TestClass.new_test_b",
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
        target="test/test.value.test3.test/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.value.test3.destination",
    )
    annotationv2_a = MoveAnnotation(
        target="test/test.value.test3.test/new_test_a",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        destination="test.value.test3.destination",
    )
    annotationv2_b = TodoAnnotation(
        target="test/test.value.test3.test/TestClass/new_test_b",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo=get_migration_text(annotationv1, mapping)
    )
    return mapping, annotationv1, [annotationv2_a, annotationv2_b]
