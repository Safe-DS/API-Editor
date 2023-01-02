from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    ExpertAnnotation,
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
def migrate_expert_annotation_data__function() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    functionv1 = Function(
        id="test/test.expert.test1.test/test",
        qname="test.expert.test1.test.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    functionv2 = Function(
        id="test/test.expert.test1.test/new_test",
        qname="test.expert.test1.test.new_test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    mapping = OneToOneMapping(1.0, functionv1, functionv2)

    annotationv1 = ExpertAnnotation(
        target="test/test.expert.test1.test/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    annotationv2 = ExpertAnnotation(
        target="test/test.expert.test1.test/new_test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    return mapping, annotationv1, [annotationv2]


# pylint: disable=duplicate-code
def migrate_expert_annotation_data__class() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    classv1 = Class(
        id_="test/test.expert.test2.test/ExpertTestClass",
        qname="test.expert.test2.test.ExpertTestClass",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="class ExpertTestClass:\n    pass",
        instance_attributes=[],
    )
    classv2 = Class(
        id_="test/test.expert.test2.test/NewExpertTestClass",
        qname="test.expert.test2.test.NewExpertTestClass",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="class NewExpertTestClass:\n    pass",
        instance_attributes=[],
    )
    functionv2 = Function(
        id="test/test.expert.test2.test/test",
        qname="test.expert.test2.test.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    mapping = OneToManyMapping(1.0, classv1, [classv2, functionv2])

    annotationv1 = ExpertAnnotation(
        target="test/test.expert.test2.test/ExpertTestClass",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    annotationv2 = ExpertAnnotation(
        target="test/test.expert.test2.test/NewExpertTestClass",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    annotationv2_function = TodoAnnotation(
        target="test/test.expert.test2.test/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(annotationv1, mapping, for_todo_annotation=True),
    )
    return mapping, annotationv1, [annotationv2, annotationv2_function]


def migrate_expert_annotation_data__parameter() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.expert/test3/testA",
        name="testA",
        qname="test.expert.test3.testA",
        default_value="'this is a string'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "this is a string", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.expert/test3/testB",
        name="testB",
        qname="test.expert.test3.testB",
        default_value="'test string'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test string'", ""),
    )
    mapping = OneToOneMapping(1.0, parameterv1, parameterv2)
    annotationv1 = ExpertAnnotation(
        target="test/test.expert/test3/testA",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    annotationv2 = ExpertAnnotation(
        target="test/test.expert/test3/testB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    return mapping, annotationv1, [annotationv2]


def migrate_expert_annotation_data_duplicated() -> Tuple[
    Mapping,
    list[AbstractAnnotation],
    list[AbstractAnnotation],
]:
    functionv1 = Function(
        id="test/test.expert.duplicate.test/test",
        qname="test.expert.duplicate.test.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv1_2 = Function(
        id="test/test.expert.duplicate.test/test_2",
        qname="test.expert.duplicate.test.test_2",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    functionv2 = Function(
        id="test/test.expert.duplicate.test/new_test",
        qname="test.expert.duplicate.test.new_test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    mapping = ManyToOneMapping(1.0, [functionv1, functionv1_2], functionv2)

    annotationv1 = ExpertAnnotation(
        target="test/test.expert.duplicate.test/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    annotationv1_2 = ExpertAnnotation(
        target="test/test.expert.duplicate.test/test_2",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    annotationv2 = ExpertAnnotation(
        target="test/test.expert.duplicate.test/new_test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    return mapping, [annotationv1, annotationv1_2], [annotationv2]
