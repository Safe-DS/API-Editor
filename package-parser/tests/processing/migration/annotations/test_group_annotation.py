from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    GroupAnnotation,
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
    Mapping,
    OneToManyMapping,
    OneToOneMapping, ManyToManyMapping,
)
from package_parser.processing.migration.annotations import (
    get_migration_text,
    migration_author,
)


def migrate_group_annotation_data_one_to_many_mapping() -> Tuple[
    list[Mapping],
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1_a = Parameter(
        id_="test/test.group.test1.test/TestClass/test/parameter_a",
        name="parameter_a",
        qname="test.group.test1.test.TestClass.test.parameter_a",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "1", "int in the range of (0, 10)"),
    )
    parameterv1_b = Parameter(
        id_="test/test.group.test1.test/TestClass/test/parameter_b",
        name="parameter_b",
        qname="test.group.test1.test.TestClass.test.parameter_b",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )
    functionv1 = Function(
        id="test/test.group.test1.test/TestClass/test",
        qname="test.group.test1.test.TestClass.test",
        decorators=[],
        parameters=[parameterv1_a, parameterv1_b],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    parameterv2_a = Parameter(
        id_="test/test.group.test1.test/NewTestClass/test/new_parameter_a",
        name="new_parameter_a",
        qname="test.group.test1.test.NewTestClass.test.new_parameter_a",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "1", "int in the range of (0, 10)"),
    )
    parameterv2_b = Parameter(
        id_="test/test.group.test1.test/NewTestClass/test/new_parameter_b",
        name="new_parameter_b",
        qname="test.group.test1.test.NewTestClass.test.new_parameter_b",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )
    functionv2 = Function(
        id="test/test.group.test1.test/NewTestClass/test",
        qname="test.group.test1.test.NewTestClass.test",
        decorators=[],
        parameters=[parameterv2_a, parameterv2_b],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    parameterv2_2_a = Parameter(
        id_="test/test.group.test2.test/NewTestClass/test/new_parameter_a",
        name="new_parameter_a",
        qname="test.group.test2.test.NewTestClass.test.new_parameter_a",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "1", "int in the range of (0, 10)"),
    )
    functionv2_2 = Function(
        id="test/test.group.test2.test/NewTestClass/test",
        qname="test.group.test2.test.NewTestClass.test",
        decorators=[],
        parameters=[parameterv2_2_a],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    parameterv2_3_b = Parameter(
        id_="test/test.group.test3.test/NewTestClass/test/new_parameter_b",
        name="new_parameter_b",
        qname="test.group.test3.test.NewTestClass.test.new_parameter_b",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )
    functionv2_3 = Function(
        id="test/test.group.test3.test/NewTestClass/test",
        qname="test.group.test3.test.NewTestClass.test",
        decorators=[],
        parameters=[parameterv2_3_b],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_4 = Function(
        id="test/test.group.test4.test/NewTestClass/test",
        qname="test.group.test4.test.NewTestClass.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    classv2_5 = Class(
        id_="test/test.group.test5.test/NewClass",
        qname="test.remove.test5.test.NewClass",
        decorators=[],
        superclasses=[],
        is_public=True,
        reexported_by=[],
        documentation=ClassDocumentation("", ""),
        code="class NewClass:\n    pass",
        instance_attributes=[],
    )

    mapping_function = OneToManyMapping(
        1.0,
        functionv1,
        [functionv2, functionv2_2, functionv2_3, functionv2_4, classv2_5],
    )
    mapping_parameter_a = OneToManyMapping(
        1.0, parameterv1_a, [parameterv2_a, parameterv2_a, parameterv2_2_a]
    )
    mapping_parameter_b = OneToManyMapping(
        1.0, parameterv1_b, [parameterv2_b, parameterv2_b, parameterv2_3_b]
    )
    annotation = GroupAnnotation(
        target="test/test.group.test1.test/TestClass/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        groupName="GroupName",
        parameters=["parameter_a", "parameter_b"],
    )
    migrated_annotation_1 = GroupAnnotation(
        target="test/test.group.test1.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        groupName="GroupName",
        parameters=["new_parameter_a", "new_parameter_b"],
    )
    migrated_annotation_2 = GroupAnnotation(
        target="test/test.group.test2.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment=get_migration_text(annotation, mapping_function),
        reviewResult=EnumReviewResult.UNSURE,
        groupName="GroupName1",
        parameters=["new_parameter_a"],
    )
    migrated_annotation_3 = GroupAnnotation(
        target="test/test.group.test3.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment=get_migration_text(annotation, mapping_function),
        reviewResult=EnumReviewResult.UNSURE,
        groupName="GroupName2",
        parameters=["new_parameter_b"],
    )
    migrated_annotation_4 = TodoAnnotation(
        target="test/test.group.test4.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(annotation, mapping_function),
    )
    migrated_annotation_5 = TodoAnnotation(
        target="test/test.group.test5.test/NewClass",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(annotation, mapping_function),
    )
    return (
        [mapping_function, mapping_parameter_a, mapping_parameter_b],
        annotation,
        [
            migrated_annotation_1,
            migrated_annotation_2,
            migrated_annotation_3,
            migrated_annotation_4,
            migrated_annotation_5,
        ],
    )


def migrate_group_annotation_data_one_to_one_mapping() -> Tuple[
    list[Mapping],
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    functionv1 = Function(
        id="test/test.group.test6.test/TestClass/test",
        qname="test.group.test6.test.TestClass.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    parameterv1_a = Parameter(
        id_="test/test.group.test6.test/TestClass/test/parameter_a",
        name="parameter_a",
        qname="test.group.test6.test.TestClass.test.parameter_a",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "1", "int in the range of (0, 10)"),
    )
    parameterv1_b = Parameter(
        id_="test/test.group.test6.test/TestClass/test/parameter_b",
        name="parameter_b",
        qname="test.group.test6.test.TestClass.test.parameter_b",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )

    functionv2 = Function(
        id="test/test.group.test6.test/NewTestClass/test",
        qname="test.group.test6.test.NewTestClass.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    parameterv2_a = Parameter(
        id_="test/test.group.test6.test/NewTestClass/test/new_parameter_a",
        name="new_parameter_a",
        qname="test.group.test6.test.NewTestClass.test.new_parameter_a",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "1", "int in the range of (0, 10)"),
    )
    parameterv2_b = Parameter(
        id_="test/test.group.test6.test/NewTestClass/test/new_parameter_b",
        name="new_parameter_b",
        qname="test.group.test6.test.NewTestClass.test.new_parameter_b",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )

    mapping_function = OneToOneMapping(1.0, functionv1, functionv2)
    mapping_parameter_a = OneToOneMapping(1.0, parameterv1_a, parameterv2_a)
    mapping_parameter_b = OneToOneMapping(1.0, parameterv1_b, parameterv2_b)
    annotation = GroupAnnotation(
        target="test/test.group.test6.test/TestClass/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        groupName="GroupName",
        parameters=["parameter_a", "parameter_b"],
    )
    migrated_annotation = GroupAnnotation(
        target="test/test.group.test6.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        groupName="GroupName",
        parameters=["new_parameter_a", "new_parameter_b"],
    )
    return (
        [mapping_function, mapping_parameter_a, mapping_parameter_b],
        annotation,
        [migrated_annotation],
    )


def migrate_group_annotation_data_one_to_one_mapping() -> Tuple[
    list[Mapping],
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    functionv1 = Function(
        id="test/test.group.test7.test/TestClass/test",
        qname="test.group.test7.test.TestClass.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    parameterv1_a = Parameter(
        id_="test/test.group.test7.test/TestClass/test/parameter_a",
        name="parameter_a",
        qname="test.group.test7.test.TestClass.test.parameter_a",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "1", "int in the range of (0, 10)"),
    )
    parameterv1_b = Parameter(
        id_="test/test.group.test7.test/TestClass/test/parameter_b",
        name="parameter_b",
        qname="test.group.test7.test.TestClass.test.parameter_b",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )

    functionv2 = Function(
        id="test/test.group.test7.test/NewTestClass/test",
        qname="test.group.test7.test.NewTestClass.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    parameterv2_a = Parameter(
        id_="test/test.group.test7.test/NewTestClass/test/new_parameter_a",
        name="new_parameter_a",
        qname="test.group.test7.test.NewTestClass.test.new_parameter_a",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "1", "int in the range of (0, 10)"),
    )
    parameterv2_b = Parameter(
        id_="test/test.group.test7.test/NewTestClass/test/new_parameter_b",
        name="new_parameter_b",
        qname="test.group.test6.test.NewTestClass.test.new_parameter_b",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )

    mapping_function = OneToOneMapping(1.0, functionv1, functionv2)
    mapping_parameters = ManyToManyMapping(1.0, [parameterv1_a, parameterv1_b], [parameterv2_a, parameterv2_b])
    annotation = GroupAnnotation(
        target="test/test.group.test7.test/TestClass/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        groupName="GroupName",
        parameters=["parameter_a", "parameter_b"],
    )
    migrated_annotation = GroupAnnotation(
        target="test/test.group.test7.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        groupName="GroupName",
        parameters=["new_parameter_a", "new_parameter_b"],
    )
    return (
        [mapping_function, mapping_parameters],
        annotation,
        [migrated_annotation],
    )
