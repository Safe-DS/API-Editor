from typing import Tuple

from package_parser.processing.annotations.model import AbstractAnnotation, EnumAnnotation, EnumPair, EnumReviewResult, \
    TodoAnnotation
from package_parser.processing.api.model import Parameter, ParameterAssignment, ParameterDocumentation
from package_parser.processing.migration import Mapping, OneToOneMapping, OneToManyMapping
from package_parser.processing.migration.annotations import migration_author


def migrate_enum_annotation_data_one_to_one_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.enum.TestA",
        name="TestA",
        qname="test.enum.TestA",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    parameterv2 = Parameter(
        id_="test/test.enum.TestB",
        name="TestB",
        qname="test.enum.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    mapping = OneToOneMapping(1.0, parameterv1, parameterv2)
    enum_annotation = EnumAnnotation(
        target="test/test.enum.TestA",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("name", "name")]
    )
    migrated_enum_annotation = EnumAnnotation(
        target="test/test.enum.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("name", "name")]
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
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    parameterv2_a = Parameter(
        id_="test/test.enum.test2.TestA",
        name="TestA",
        qname="test.enum.test2.TestA",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    parameterv2_b = Parameter(
        id_="test/test.enum.test2.TestB",
        name="TestB",
        qname="test.enum.test2.TestB",
        default_value=None,
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
        pairs=[EnumPair("name", "name")]
    )
    migrated_enum_annotation = TodoAnnotation(
        target="test/test.enum.test2.TestA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="The @Enum Annotation with the new name 'EnumName "
                "(name, name)' from the previous version was at "
                "'test/test.enum.test2.Test' and the possible "
                'alternatives in the new version of the api are: '
                'TestA, TestB'
    )
    migrated_enum_annotation_2 = TodoAnnotation(
        target="test/test.enum.test2.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo="The @Enum Annotation with the new name 'EnumName "
                "(name, name)' from the previous version was at "
                "'test/test.enum.test2.Test' and the possible "
                'alternatives in the new version of the api are: '
                'TestA, TestB'
    )
    return mapping, enum_annotation, [migrated_enum_annotation, migrated_enum_annotation_2]


def migrate_enum_annotation_data_one_to_many_mapping__only_one_relevant_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.enum.test3.Test",
        name="Test",
        qname="test.enum.test3.Test",
        default_value=None,
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
        documentation=ParameterDocumentation("int", "value", "docstring"),
    )
    parameterv2_b = Parameter(
        id_="test/test.enum.test3.TestB",
        name="TestB",
        qname="test.enum.test3.TestB",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "value", "docstring"),
    )
    mapping = OneToManyMapping(1.0, parameterv1, [parameterv2_a, parameterv2_b])
    enum_annotation = EnumAnnotation(
        target="test/test.enum.test3.Test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        enumName="EnumName",
        pairs=[EnumPair("name", "name")],
    )
    migrated_enum_annotation = EnumAnnotation(
        target="test/test.enum.test3.TestB",
        authors=["testauthor", migration_author],
        reviewers=[],
        reviewResult=EnumReviewResult.NONE,
        comment="The @Enum Annotation with the new name 'EnumName "
                "(name, name)' from the previous version was at "
                "'test/test.enum.test3.Test' and the possible "
                'alternatives in the new version of the api are: '
                'TestA, TestB',
        enumName="EnumName",
        pairs=[EnumPair("name", "name")]
    )
    return mapping, enum_annotation, [migrated_enum_annotation]
