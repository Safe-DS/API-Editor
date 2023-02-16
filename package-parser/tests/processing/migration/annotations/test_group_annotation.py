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
from package_parser.processing.migration.annotations import (
    get_migration_text,
    migration_author,
)
from package_parser.processing.migration.model import (
    ManyToManyMapping,
    ManyToOneMapping,
    Mapping,
    OneToManyMapping,
    OneToOneMapping,
)


# pylint: disable=duplicate-code
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
    parameterv1_c = Parameter(
        id_="test/test.group.test1.test/TestClass/test/parameter_c",
        name="parameter_c",
        qname="test.group.test1.test.TestClass.test.parameter_c",
        default_value="'test_c'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test_c'", "str"),
    )
    functionv1 = Function(
        id="test/test.group.test1.test/TestClass/test",
        qname="test.group.test1.test.TestClass.test",
        decorators=[],
        parameters=[parameterv1_a, parameterv1_b, parameterv1_c],
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
    parameterv2_c = Parameter(
        id_="test/test.group.test1.test/NewTestClass/test/new_parameter_c",
        name="new_parameter_c",
        qname="test.group.test1.test.NewTestClass.test.new_parameter_c",
        default_value="'test_c'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test_c'", "str"),
    )
    functionv2 = Function(
        id="test/test.group.test1.test/NewTestClass/test",
        qname="test.group.test1.test.NewTestClass.test",
        decorators=[],
        parameters=[parameterv2_a, parameterv2_b, parameterv2_c],
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
    parameterv2_2_c = Parameter(
        id_="test/test.group.test2.test/NewTestClass/test/new_parameter_c",
        name="new_parameter_c",
        qname="test.group.test2.test.NewTestClass.test.new_parameter_c",
        default_value="test",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "test_c", "str"),
    )
    functionv2_2 = Function(
        id="test/test.group.test2.test/NewTestClass/test",
        qname="test.group.test2.test.NewTestClass.test",
        decorators=[],
        parameters=[parameterv2_2_a, parameterv2_2_c],
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
    parameterv2_3_c = Parameter(
        id_="test/test.group.test3.test/NewTestClass/test/new_parameter_c",
        name="new_parameter_c",
        qname="test.group.test3.test.NewTestClass.test.new_parameter_c",
        default_value="test",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "test_c", "str"),
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
    parameterv2_4_b = Parameter(
        id_="test/test.group.test4.test/NewTestClass/test/new_parameter_b",
        name="new_parameter_b",
        qname="test.group.test4.test.NewTestClass.test.new_parameter_b",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )
    functionv2_4 = Function(
        id="test/test.group.test4.test/NewTestClass/test",
        qname="test.group.test4.test.NewTestClass.test",
        decorators=[],
        parameters=[parameterv2_3_b],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv2_5 = Function(
        id="test/test.group.test5.test/NewTestClass/test",
        qname="test.group.test5.test.NewTestClass.test",
        decorators=[],
        parameters=[],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    classv2_6 = Class(
        id_="test/test.group.test6.test/NewClass",
        qname="test.group.test6.test.NewClass",
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
        [functionv2, functionv2_2, functionv2_3, functionv2_4, functionv2_5, classv2_6],
    )
    mapping_parameter_a = OneToManyMapping(
        1.0, parameterv1_a, [parameterv2_a, parameterv2_2_a]
    )
    mapping_parameter_b = OneToManyMapping(
        1.0, parameterv1_b, [parameterv2_b, parameterv2_3_b, parameterv2_4_b]
    )
    mapping_parameter_c = OneToManyMapping(
        1.0, parameterv1_c, [parameterv2_c, parameterv2_2_c, parameterv2_3_c]
    )
    annotation = GroupAnnotation(
        target="test/test.group.test1.test/TestClass/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        groupName="GroupName",
        parameters=["parameter_a", "parameter_b", "parameter_c"],
    )
    migrated_annotation_1 = GroupAnnotation(
        target="test/test.group.test1.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        groupName="GroupName",
        parameters=["new_parameter_a", "new_parameter_b", "new_parameter_c"],
    )
    migrated_annotation_2 = GroupAnnotation(
        target="test/test.group.test2.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment=get_migration_text(
            annotation,
            mapping_function,
            additional_information=[parameterv2_2_a, parameterv2_2_c],
        ),
        reviewResult=EnumReviewResult.UNSURE,
        groupName="GroupName5",
        parameters=["new_parameter_a", "new_parameter_c"],
    )
    migrated_annotation_3 = GroupAnnotation(
        target="test/test.group.test3.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment=get_migration_text(
            annotation,
            mapping_function,
            additional_information=[parameterv2_3_b, parameterv2_3_c],
        ),
        reviewResult=EnumReviewResult.UNSURE,
        groupName="GroupName6",
        parameters=["new_parameter_b", "new_parameter_c"],
    )
    migrated_annotation_4 = TodoAnnotation(
        target="test/test.group.test4.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(
            annotation,
            mapping_function,
            for_todo_annotation=True,
            additional_information=[parameterv2_4_b],
        ),
    )
    migrated_annotation_5 = TodoAnnotation(
        target="test/test.group.test5.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(
            annotation, mapping_function, for_todo_annotation=True
        ),
    )
    migrated_annotation_6 = TodoAnnotation(
        target="test/test.group.test6.test/NewClass",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        newTodo=get_migration_text(
            annotation, mapping_function, for_todo_annotation=True
        ),
    )
    return (
        [
            mapping_function,
            mapping_parameter_a,
            mapping_parameter_b,
            mapping_parameter_c,
        ],
        annotation,
        [
            migrated_annotation_1,
            migrated_annotation_2,
            migrated_annotation_3,
            migrated_annotation_4,
            migrated_annotation_5,
            migrated_annotation_6,
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


def migrate_group_annotation_data_one_to_one_mapping__one_mapping_for_parameters() -> Tuple[
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
        qname="test.group.test7.test.NewTestClass.test.new_parameter_b",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )

    mapping_function = OneToOneMapping(1.0, functionv1, functionv2)
    mapping_parameters = ManyToManyMapping(
        1.0, [parameterv1_a, parameterv1_b], [parameterv2_a, parameterv2_b]
    )
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


def migrate_group_annotation_data_duplicated() -> Tuple[
    list[Mapping],
    list[AbstractAnnotation],
    list[AbstractAnnotation],
]:
    parameterv1_a = Parameter(
        id_="test/test.group.duplicate.test/TestClass/test/parameter_a",
        name="parameter_a",
        qname="test.group.duplicate.test.TestClass.test.parameter_a",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "1", "int in the range of (0, 10)"),
    )
    parameterv1_b = Parameter(
        id_="test/test.group.duplicate.test/TestClass/test/parameter_b",
        name="parameter_b",
        qname="test.group.duplicate.test.TestClass.test.parameter_b",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )
    parameterv1_c = Parameter(
        id_="test/test.group.duplicate.test/TestClass/test/parameter_c",
        name="parameter_c",
        qname="test.group.duplicate.test.TestClass.test.parameter_c",
        default_value="'test_c'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test_c'", "str"),
    )
    parameterv1_a_2 = Parameter(
        id_="test/test.group.duplicate.test/TestClass/test_2/parameter_a_2",
        name="parameter_a_2",
        qname="test.group.duplicate.test.TestClass.test_2.parameter_a_2",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "1", "int in the range of (0, 10)"),
    )
    parameterv1_b_2 = Parameter(
        id_="test/test.group.duplicate.test/TestClass/test_2/parameter_b_2",
        name="parameter_b_2",
        qname="test.group.duplicate.test.TestClass.test_2.parameter_b_2",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )
    parameterv1_c_2 = Parameter(
        id_="test/test.group.duplicate.test/TestClass/test_2/parameter_c_2",
        name="parameter_c_2",
        qname="test.group.duplicate.test.TestClass.test_2.parameter_c_2",
        default_value="'test_c'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test_c'", "str"),
    )
    functionv1 = Function(
        id="test/test.group.duplicate.test/TestClass/test",
        qname="test.group.duplicate.test.TestClass.test",
        decorators=[],
        parameters=[parameterv1_a, parameterv1_b, parameterv1_c],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )
    functionv1_2 = Function(
        id="test/test.group.duplicate.test/TestClass/test_2",
        qname="test.group.duplicate.test.TestClass.test_2",
        decorators=[],
        parameters=[parameterv1_a_2, parameterv1_b_2, parameterv1_c_2],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    parameterv2_a = Parameter(
        id_="test/test.group.duplicate.test/NewTestClass/test/new_parameter_a",
        name="new_parameter_a",
        qname="test.group.duplicate.test.NewTestClass.test.new_parameter_a",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "1", "int in the range of (0, 10)"),
    )
    parameterv2_b = Parameter(
        id_="test/test.group.duplicate.test/NewTestClass/test/new_parameter_b",
        name="new_parameter_b",
        qname="test.group.duplicate.test.NewTestClass.test.new_parameter_b",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", "str"),
    )
    parameterv2_c = Parameter(
        id_="test/test.group.duplicate.test/NewTestClass/test/new_parameter_c",
        name="new_parameter_c",
        qname="test.group.duplicate.test.NewTestClass.test.new_parameter_c",
        default_value="'test_c'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test_c'", "str"),
    )
    functionv2 = Function(
        id="test/test.group.duplicate.test/NewTestClass/test",
        qname="test.group.duplicate.test.NewTestClass.test",
        decorators=[],
        parameters=[parameterv2_a, parameterv2_b, parameterv2_c],
        results=[],
        is_public=True,
        reexported_by=[],
        documentation=FunctionDocumentation("", ""),
        code="",
    )

    mapping_function = ManyToOneMapping(
        1.0,
        [functionv1, functionv1_2],
        functionv2,
    )
    mapping_parameter_a = ManyToOneMapping(
        1.0, [parameterv1_a, parameterv1_a_2], parameterv2_a
    )
    mapping_parameter_b = ManyToOneMapping(
        1.0, [parameterv1_b, parameterv1_b_2], parameterv2_b
    )
    mapping_parameter_c = ManyToOneMapping(
        1.0, [parameterv1_c, parameterv1_c_2], parameterv2_c
    )
    annotation = GroupAnnotation(
        target="test/test.group.duplicate.test/TestClass/test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        groupName="GroupName",
        parameters=["parameter_a", "parameter_b", "parameter_c"],
    )
    annotation_2 = GroupAnnotation(
        target="test/test.group.duplicate.test/TestClass/test_2",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        groupName="GroupName",
        parameters=["parameter_a_2", "parameter_b_2", "parameter_c_2"],
    )
    migrated_annotation_1 = GroupAnnotation(
        target="test/test.group.duplicate.test/NewTestClass/test",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        groupName="GroupName",
        parameters=["new_parameter_a", "new_parameter_b", "new_parameter_c"],
    )
    return (
        [
            mapping_function,
            mapping_parameter_a,
            mapping_parameter_b,
            mapping_parameter_c,
        ],
        [annotation, annotation_2],
        [migrated_annotation_1],
    )
