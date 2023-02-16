from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumAnnotation,
    EnumPair,
    EnumReviewResult,
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
    ManyToOneMapping,
    Mapping,
    OneToManyMapping,
    OneToOneMapping,
)


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


# pylint: disable=duplicate-code
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
        default_value=None,
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
    migrated_enum_annotation_b = EnumAnnotation(
        target="test/test.enum.test3.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        reviewResult=EnumReviewResult.NONE,
        comment="",
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    migrated_enum_annotation_a = EnumAnnotation(
        target="test/test.enum.test3.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        reviewResult=EnumReviewResult.UNSURE,
        comment=get_migration_text(enum_annotation, mapping),
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    return (
        mapping,
        enum_annotation,
        [migrated_enum_annotation_b, migrated_enum_annotation_a],
    )


def migrate_enum_annotation_data_duplicated() -> Tuple[
    Mapping,
    list[AbstractAnnotation],
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.enum.duplicate.TestA",
        name="TestA",
        qname="test.enum.duplicate.TestA",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    parameterv1_2 = Parameter(
        id_="test/test.enum.duplicate.TestA_2",
        name="TestA_2",
        qname="test.enum.duplicate.TestA_2",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    parameterv2 = Parameter(
        id_="test/test.enum.duplicate.TestB",
        name="TestB",
        qname="test.enum.duplicate.TestB",
        default_value="value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    mapping = ManyToOneMapping(1.0, [parameterv1, parameterv1_2], parameterv2)
    enum_annotation = EnumAnnotation(
        target="test/test.enum.duplicate.TestA",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    enum_annotation_2 = EnumAnnotation(
        target="test/test.enum.duplicate.TestA_2",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    migrated_enum_annotation = EnumAnnotation(
        target="test/test.enum.duplicate.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("value", "name")],
    )
    return mapping, [enum_annotation, enum_annotation_2], [migrated_enum_annotation]
