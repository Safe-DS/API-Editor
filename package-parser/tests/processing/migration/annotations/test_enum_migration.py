from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumAnnotation,
    EnumPair,
    EnumReviewResult,
    TodoAnnotation,
)
from package_parser.processing.api.model import (
    Parameter,
    ParameterAssignment,
    ParameterDocumentation,
)
from package_parser.processing.migration import (
    Mapping,
    OneToManyMapping,
    OneToOneMapping,
)
from package_parser.processing.migration.annotations import migration_author


def migrate_enum_annotation_data_one_to_one_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.enum.test1.TestA",
        name="TestA",
        qname="test.enum.test1.TestA",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    parameterv2 = Parameter(
        id_="test/test.enum.test1.TestB",
        name="TestB",
        qname="test.enum.test1.TestB",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    mapping = OneToOneMapping(1.0, parameterv1, parameterv2)
    enum_annotation = EnumAnnotation(
        target="test/test.enum.test1.TestA",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    migrated_enum_annotation = EnumAnnotation(
        target="test/test.enum.test1.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    return mapping, enum_annotation, [migrated_enum_annotation]


def migrate_enum_annotation_data_one_to_many_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.enum.test2.Test",
        name="Test",
        qname="test.enum.test2.Test",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    parameterv2_a = Parameter(
        id_="test/test.enum.test2.TestA",
        name="TestA",
        qname="test.enum.test2.TestA",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    parameterv2_b = Parameter(
        id_="test/test.enum.test2.TestB",
        name="TestB",
        qname="test.enum.test2.TestB",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    mapping = OneToManyMapping(1.0, parameterv1, [parameterv2_a, parameterv2_b])
    enum_annotation = EnumAnnotation(
        target="test/test.enum.test2.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    migrated_enum_annotation = EnumAnnotation(
        target="test/test.enum.test2.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    migrated_enum_annotation_2 = EnumAnnotation(
        target="test/test.enum.test2.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    return (
        mapping,
        enum_annotation,
        [migrated_enum_annotation, migrated_enum_annotation_2],
    )


def migrate_enum_annotation_data_one_to_many_mapping__only_one_relevant_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.enum.test3.Test",
        name="Test",
        qname="test.enum.test3.Test",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    parameterv2_a = Parameter(
        id_="test/test.enum.test3.TestA",
        name="TestA",
        qname="test.enum.test3.TestA",
        default_value="",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_b = Parameter(
        id_="test/test.enum.test3.TestB",
        name="TestB",
        qname="test.enum.test3.TestB",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    parameterv2_c = Parameter(
        id_="test/test.enum.test3.TestC",
        name="TestC",
        qname="test.enum.test3.TestC",
        default_value="0",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "0", "docstring"),
    )
    mapping = OneToManyMapping(
        1.0, parameterv1, [parameterv2_a, parameterv2_b, parameterv2_c]
    )
    enum_annotation = EnumAnnotation(
        target="test/test.enum.test3.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    migrated_enum_annotation = EnumAnnotation(
        target="test/test.enum.test3.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        reviewResult=EnumReviewResult.NONE,
        comment="",
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    migrated_todo_annotation = TodoAnnotation(
        target="test/test.enum.test3.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        reviewResult=EnumReviewResult.UNSURE,
        comment="",
        newTodo="The @Enum Annotation with the new name 'EnumName "
        "(value, name)' from the previous version was at "
        "'test/test.enum.test3.Test' and the possible "
        "alternatives in the new version of the api are: "
        "TestA, TestB, TestC",
    )
    return (
        mapping,
        enum_annotation,
        [migrated_enum_annotation, migrated_todo_annotation],
    )
