from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    CalledAfterAnnotation,
    EnumReviewResult,
    TodoAnnotation,
)
from package_parser.processing.api.model import Function, FunctionDocumentation
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
def migrate_called_after_annotation_data_one_to_one_mapping() -> Tuple[
    list[Mapping],
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    functionv1_after = Function(
        id="test/test.called_after.test1.test/OldClass/test_after",
        qname="test.called_after.test1.test.OldClass.test_after",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv1_before = Function(
        id="test/test.called_after.test1.test/OldClass/test_before",
        qname="test.called_after.test1.test.OldClass.test_before",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_after = Function(
        id="test/test.called_after.test1.test/NewClass/new_test_after",
        qname="test.called_after.test1.test.NewClass.new_test_after",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_before = Function(
        id="test/test.called_after.test1.test/NewClass/new_test_before",
        qname="test.called_after.test1.test.NewClass.new_test_before",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    mapping_after = OneToOneMapping(1.0, functionv1_after, functionv2_after)
    mapping_before = OneToOneMapping(1.0, functionv1_before, functionv2_before)
    annotationv1 = CalledAfterAnnotation(
        target="test/test.called_after.test1.test/OldClass/test_after",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="test_before",
    )
    annotationv2 = CalledAfterAnnotation(
        target="test/test.called_after.test1.test/NewClass/new_test_after",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="new_test_before",
    )
    return [mapping_after, mapping_before], annotationv1, [annotationv2]


def migrate_called_after_annotation_data_one_to_many_mapping() -> Tuple[
    list[Mapping],
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    functionv1_after = Function(
        id="test/test.called_after.test2.test/OldClass/test_after",
        qname="test.called_after.test2.test.OldClass.test_after",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv1_before = Function(
        id="test/test.called_after.test2.test/OldClass/test_before",
        qname="test.called_after.test2.test.OldClass.test_before",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_after_a = Function(
        id="test/test.called_after.test2.test/NewClass/new_test_after_a",
        qname="test.called_after.test2.test.NewClass.new_test_after_a",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_after_b = Function(
        id="test/test.called_after.test2.test/NewClass/new_test_after_b",
        qname="test.called_after.test2.test.NewClass.new_test_after_b",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_before = Function(
        id="test/test.called_after.test2.test/NewClass/new_test_before",
        qname="test.called_after.test2.test.NewClass.new_test_before",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    mapping_after = OneToManyMapping(
        1.0, functionv1_after, [functionv2_after_a, functionv2_after_b]
    )
    mapping_before = OneToOneMapping(1.0, functionv1_before, functionv2_before)
    annotationv1 = CalledAfterAnnotation(
        target="test/test.called_after.test2.test/OldClass/test_after",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="test_before",
    )
    annotationv2_a = CalledAfterAnnotation(
        target="test/test.called_after.test2.test/NewClass/new_test_after_a",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="new_test_before",
    )
    annotationv2_b = CalledAfterAnnotation(
        target="test/test.called_after.test2.test/NewClass/new_test_after_b",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="new_test_before",
    )
    return (
        [mapping_after, mapping_before],
        annotationv1,
        [annotationv2_a, annotationv2_b],
    )


def migrate_called_after_annotation_data_one_to_one_mapping__no_mapping_found() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    functionv1_after = Function(
        id="test/test.called_after.test3.test/OldClass/test_after",
        qname="test.called_after.test3.test.OldClass.test_after",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_after = Function(
        id="test/test.called_after.test3.test/NewClass/new_test_after",
        qname="test.called_after.test3.test.NewClass.new_test_after",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    mapping_after = OneToOneMapping(1.0, functionv1_after, functionv2_after)
    annotationv1 = CalledAfterAnnotation(
        target="test/test.called_after.test3.test/OldClass/test_after",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="test_before",
    )
    annotationv2 = CalledAfterAnnotation(
        target="test/test.called_after.test3.test/NewClass/new_test_after",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment=get_migration_text(annotationv1, mapping_after),
        reviewResult=EnumReviewResult.UNSURE,
        calledAfterName="test_before",
    )
    return mapping_after, annotationv1, [annotationv2]


def migrate_called_after_annotation_data_one_to_one_mapping__before_splits() -> Tuple[
    list[Mapping],
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    functionv1_after = Function(
        id="test/test.called_after.test4.test/OldClass/test_after",
        qname="test.called_after.test4.test.OldClass.test_after",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv1_before = Function(
        id="test/test.called_after.test4.test/OldClass/test_before",
        qname="test.called_after.test4.test.OldClass.test_before",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_after = Function(
        id="test/test.called_after.test4.test/NewClass/new_test_after",
        qname="test.called_after.test4.test.NewClass.new_test_after",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_before_a = Function(
        id="test/test.called_after.test4.test/NewClass/new_test_before_a",
        qname="test.called_after.test4.test.NewClass.new_test_before_a",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_before_b = Function(
        id="test/test.called_after.test4.test/NewClass/new_test_before_b",
        qname="test.called_after.test4.test.NewClass.new_test_before_b",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    mapping_after = OneToOneMapping(1.0, functionv1_after, functionv2_after)
    mapping_before = OneToManyMapping(
        1.0, functionv1_before, [functionv2_before_a, functionv2_before_b]
    )
    annotationv1 = CalledAfterAnnotation(
        target="test/test.called_after.test4.test/OldClass/test_after",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="test_before",
    )
    annotationv2 = TodoAnnotation(
        target="test/test.called_after.test4.test/NewClass/new_test_after",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(
            annotationv1,
            mapping_after,
            additional_information=[functionv2_before_a, functionv2_before_b],
        ),
    )
    return [mapping_after, mapping_before], annotationv1, [annotationv2]


def migrate_called_after_annotation_data_one_to_many_mapping__two_classes() -> Tuple[
    list[Mapping],
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    functionv1_after = Function(
        id="test/test.called_after.test5.test/OldClass/test_after",
        qname="test.called_after.test5.test.OldClass.test_after",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv1_before = Function(
        id="test/test.called_after.test5.test/OldClass/test_before",
        qname="test.called_after.test5.test.OldClass.test_before",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_after_a = Function(
        id="test/test.called_after.test5.test/NewClass/new_test_after_a",
        qname="test.called_after.test5.test.NewClass.new_test_after_a",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_after_b = Function(
        id="test/test.called_after.test5.test/NewClass2/new_test_after_b",
        qname="test.called_after.test5.test.NewClass2.new_test_after_b",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_before_a = Function(
        id="test/test.called_after.test5.test/NewClass/new_test_before_a",
        qname="test.called_after.test5.test.NewClass.new_test_before_a",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_before_b = Function(
        id="test/test.called_after.test5.test/NewClass2/new_test_before_b",
        qname="test.called_after.test5.test.NewClass2.new_test_before_b",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    mapping_after = OneToManyMapping(
        1.0, functionv1_after, [functionv2_after_a, functionv2_after_b]
    )
    mapping_before = OneToManyMapping(
        1.0, functionv1_before, [functionv2_before_a, functionv2_before_b]
    )
    annotationv1 = CalledAfterAnnotation(
        target="test/test.called_after.test5.test/OldClass/test_after",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="test_before",
    )
    annotationv2_a = CalledAfterAnnotation(
        target="test/test.called_after.test5.test/NewClass/new_test_after_a",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="new_test_before_a",
    )
    annotationv2_b = CalledAfterAnnotation(
        target="test/test.called_after.test5.test/NewClass2/new_test_after_b",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="new_test_before_b",
    )
    return (
        [mapping_after, mapping_before],
        annotationv1,
        [annotationv2_a, annotationv2_b],
    )


def migrate_called_after_annotation_data_duplicated() -> Tuple[
    list[Mapping],
    list[AbstractAnnotation],
    list[AbstractAnnotation],
]:
    functionv1_after = Function(
        id="test/test.called_after.duplicate.test/OldClass/test_after",
        qname="test.called_after.duplicate.test.OldClass.test_after",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv1_after_2 = Function(
        id="test/test.called_after.duplicate.test/OldClass/test_after_2",
        qname="test.called_after.duplicate.test.OldClass.test_after_2",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv1_before = Function(
        id="test/test.called_after.duplicate.test/OldClass/test_before",
        qname="test.called_after.duplicate.test.OldClass.test_before",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_after = Function(
        id="test/test.called_after.duplicate.test/NewClass/new_test_after",
        qname="test.called_after.duplicate.test.NewClass.new_test_after",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_before = Function(
        id="test/test.called_after.duplicate.test/NewClass/new_test_before",
        qname="test.called_after.duplicate.test.NewClass.new_test_before",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    mapping_after = ManyToOneMapping(
        1.0, [functionv1_after, functionv1_after_2], functionv2_after
    )
    mapping_before = OneToManyMapping(1.0, functionv1_before, [functionv2_before])
    annotationv1 = CalledAfterAnnotation(
        target="test/test.called_after.duplicate.test/OldClass/test_after",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="test_before",
    )
    annotationv1_2 = CalledAfterAnnotation(
        target="test/test.called_after.duplicate.test/OldClass/test_after_2",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="test_before",
    )
    annotationv2 = CalledAfterAnnotation(
        target="test/test.called_after.duplicate.test/NewClass/new_test_after",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        calledAfterName="new_test_before",
    )
    return (
        [mapping_after, mapping_before],
        [annotationv1, annotationv1_2],
        [annotationv2],
    )
