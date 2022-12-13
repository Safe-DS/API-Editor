from typing import Tuple

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    ConstantAnnotation,
    EnumReviewResult,
    OmittedAnnotation,
    OptionalAnnotation,
    RequiredAnnotation,
    TodoAnnotation,
    ValueAnnotation,
)
from package_parser.processing.api.model import (
    Attribute,
    NamedType,
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


def migrate_constant_annotation_data_one_to_one_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.value.test1.testA",
        name="testA",
        qname="test.value.test1.testA",
        default_value="'this is a string'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "this is a string", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.value.test1.testB",
        name="testB",
        qname="test.value.test1.testB",
        default_value="'test string'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test string'", ""),
    )
    annotation = ConstantAnnotation(
        target="test/test.value.test1.testA",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.STRING,
        defaultValue="This is a string",
    )
    annotationv2 = ConstantAnnotation(
        target="test/test.value.test1.testB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.STRING,
        defaultValue="This is a string",
    )
    return OneToOneMapping(1.0, parameterv1, parameterv2), annotation, [annotationv2]


def migrate_omitted_annotation_data_one_to_one_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.value.test2.testA",
        name="testA",
        qname="test.value.test2.testA",
        default_value="True",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("bool", "True", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.value.test2.testB",
        name="testB",
        qname="test.value.test2.testB",
        default_value="True",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("bool", "True", ""),
    )
    annotation = OmittedAnnotation(
        target="test/test.value.test2.testA",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    annotationv2 = OmittedAnnotation(
        target="test/test.value.test2.testB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    return OneToOneMapping(1.0, parameterv1, parameterv2), annotation, [annotationv2]


def migrate_optional_annotation_data_one_to_one_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.value.test3.testA",
        name="testA",
        qname="test.value.test3.testA",
        default_value="True",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("bool", "True", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.value.test3.testB",
        name="testB",
        qname="test.value.test3.testB",
        default_value="False",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("bool", "False", ""),
    )
    annotation = OptionalAnnotation(
        target="test/test.value.test3.testA",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.BOOLEAN,
        defaultValue="True",
    )
    annotationv2 = OptionalAnnotation(
        target="test/test.value.test3.testB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.BOOLEAN,
        defaultValue="True",
    )
    return OneToOneMapping(1.0, parameterv1, parameterv2), annotation, [annotationv2]


def migrate_required_annotation_data_one_to_one_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.value.test4.testA",
        name="testA",
        qname="test.value.test4.testA",
        default_value="'test'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test'", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.value.test4.testB",
        name="testB",
        qname="test.value.test4.testB",
        default_value="'test_string'",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test_string'", ""),
    )
    annotation = RequiredAnnotation(
        target="test/test.value.test4.testA",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    annotationv2 = RequiredAnnotation(
        target="test/test.value.test4.testB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    return OneToOneMapping(1.0, parameterv1, parameterv2), annotation, [annotationv2]


def migrate_constant_annotation_data_one_to_many_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.value.test5.test",
        name="test",
        qname="test.value.test5.test",
        default_value="2.0",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("float", "2.0", ""),
    )

    parameterv2_a = Parameter(
        id_="test/test.value.test5.testA",
        name="testA",
        qname="test.value.test5.testA",
        default_value="5",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "5", "int in the range of (0, 10)"),
    )
    parameterv2_b = Parameter(
        id_="test/test.value.test5.testB",
        name="testB",
        qname="test.value.test5.testB",
        default_value="",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_c = Parameter(
        id_="test/test.value.test5.testC",
        name="testC",
        qname="test.value.test5.testC",
        default_value="test_value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "'test_string'", ""),
    )
    parameterv2_d = Parameter(
        id_="test/test.value.test5.testD",
        name="testD",
        qname="test.value.test5.testD",
        default_value="3.0",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("float", "3.0", ""),
    )
    attribute = Attribute("test_attribute", NamedType("str"))
    annotation = ConstantAnnotation(
        target="test/test.value.test5.test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.NUMBER,
        defaultValue="2.0",
    )
    annotationv2_a = TodoAnnotation(
        target="test/test.value.test5.testA",
        authors=["testauthor", "migration"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'constant' and "
        "the default Value '2.0 ( type: number )' from the "
        "previous version was at 'test/test.value.test5.test' "
        "and the possible alternatives in the new version of "
        "the api are: testA, testB, testC, testD, "
        "test_attribute",
    )
    annotationv2_b = ConstantAnnotation(
        target="test/test.value.test5.testB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="The @Value Annotation with the variant 'constant' "
        "and the default Value '2.0 ( type: number )' from "
        "the previous version was at "
        "'test/test.value.test5.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD, test_attribute",
        reviewResult=EnumReviewResult.UNSURE,
        defaultValueType=ValueAnnotation.DefaultValueType.NUMBER,
        defaultValue="2.0",
    )
    annotationv2_c = TodoAnnotation(
        target="test/test.value.test5.testC",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'constant' "
        "and the default Value '2.0 ( type: number )' from "
        "the previous version was at "
        "'test/test.value.test5.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD, test_attribute",
    )
    annotationv2_d = ConstantAnnotation(
        target="test/test.value.test5.testD",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.NUMBER,
        defaultValue="2.0",
    )

    return (
        OneToManyMapping(
            1.0,
            parameterv1,
            [parameterv2_a, parameterv2_b, parameterv2_c, parameterv2_d, attribute],
        ),
        annotation,
        [annotationv2_a, annotationv2_b, annotationv2_c, annotationv2_d],
    )


def migrate_optional_annotation_data_one_to_many_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.value.test6.test",
        name="test",
        qname="test.value.test6.test",
        default_value="2",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "2", ""),
    )

    parameterv2_a = Parameter(
        id_="test/test.value.test6.testA",
        name="testA",
        qname="test.value.test6.testA",
        default_value="5",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("float", "5.0", "float"),
    )
    parameterv2_b = Parameter(
        id_="test/test.value.test6.testB",
        name="testB",
        qname="test.value.test6.testB",
        default_value="",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_c = Parameter(
        id_="test/test.value.test6.testC",
        name="testC",
        qname="test.value.test6.testC",
        default_value="test_value",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "test_string", ""),
    )
    parameterv2_d = Parameter(
        id_="test/test.value.test6.testD",
        name="testD",
        qname="test.value.test6.testD",
        default_value="5",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "5", "int in the range of (0, 10)"),
    )
    annotation = OptionalAnnotation(
        target="test/test.value.test6.test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.NUMBER,
        defaultValue="2",
    )
    annotationv2_a = TodoAnnotation(
        target="test/test.value.test6.testA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        newTodo="The @Value Annotation with the variant 'optional' "
        "and the default Value '2 ( type: number )' from "
        "the previous version was at "
        "'test/test.value.test6.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD",
        reviewResult=EnumReviewResult.UNSURE,
    )
    annotationv2_b = OptionalAnnotation(
        target="test/test.value.test6.testB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="The @Value Annotation with the variant 'optional' "
        "and the default Value '2 ( type: number )' from "
        "the previous version was at "
        "'test/test.value.test6.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD",
        reviewResult=EnumReviewResult.UNSURE,
        defaultValueType=ValueAnnotation.DefaultValueType.NUMBER,
        defaultValue="2",
    )
    annotationv2_c = TodoAnnotation(
        target="test/test.value.test6.testC",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'optional' "
        "and the default Value '2 ( type: number )' from "
        "the previous version was at "
        "'test/test.value.test6.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD",
    )
    annotation_d = OptionalAnnotation(
        target="test/test.value.test6.testD",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.NUMBER,
        defaultValue="2",
    )
    return (
        OneToManyMapping(
            1.0,
            parameterv1,
            [parameterv2_a, parameterv2_b, parameterv2_c, parameterv2_d],
        ),
        annotation,
        [annotationv2_a, annotationv2_b, annotationv2_c, annotation_d],
    )


def migrate_required_annotation_data_one_to_many_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.value.test7.test",
        name="test",
        qname="test.value.test7.test",
        default_value="1.0",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("float", "1.0", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.value.test7.testA",
        name="testA",
        qname="test.value.test7.testA",
        default_value="2",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "2", ""),
    )

    parameterv2_b = Parameter(
        id_="test/test.value.test7.testB",
        name="testB",
        qname="test.value.test7.testB",
        default_value="2.0",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("float", "2.0", ""),
    )
    parameterv2_c = Parameter(
        id_="test/test.value.test7.testC",
        name="testC",
        qname="test.value.test7.testC",
        default_value='"value"',
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("string", '"value"', ""),
    )
    parameterv2_d = Parameter(
        id_="test/test.value.test7.testD",
        name="testD",
        qname="test.value.test7.testD",
        default_value="None",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "None", ""),
    )
    parameterv2_e = Parameter(
        id_="test/test.value.test7.testE",
        name="testE",
        qname="test.value.test7.testE",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )
    parameterv2_f = Parameter(
        id_="test/test.value.test7.testF",
        name="testF",
        qname="test.value.test7.testF",
        default_value="3.0",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("float", "3.0", ""),
    )

    annotation = RequiredAnnotation(
        target="test/test.value.test7.test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    annotationv2_a = TodoAnnotation(
        target="test/test.value.test7.testA",
        authors=["testauthor", "migration"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'required' "
        "from the previous version was at "
        "'test/test.value.test7.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD, testE, testF",
    )
    annotationv2_b = RequiredAnnotation(
        target="test/test.value.test7.testB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    annotationv2_c = TodoAnnotation(
        target="test/test.value.test7.testC",
        authors=["testauthor", "migration"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'required' "
        "from the previous version was at "
        "'test/test.value.test7.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD, testE, testF",
    )

    annotationv2_d = TodoAnnotation(
        target="test/test.value.test7.testD",
        authors=["testauthor", "migration"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'required' "
        "from the previous version was at "
        "'test/test.value.test7.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD, testE, testF",
    )
    annotationv2_e = TodoAnnotation(
        target="test/test.value.test7.testE",
        authors=["testauthor", "migration"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'required' from "
        "the previous version was at "
        "'test/test.value.test7.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD, testE, testF",
    )
    annotationv2_f = RequiredAnnotation(
        target="test/test.value.test7.testF",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    return (
        OneToManyMapping(
            1.0,
            parameterv1,
            [
                parameterv2_a,
                parameterv2_b,
                parameterv2_c,
                parameterv2_d,
                parameterv2_e,
                parameterv2_f,
            ],
        ),
        annotation,
        [
            annotationv2_a,
            annotationv2_b,
            annotationv2_c,
            annotationv2_d,
            annotationv2_e,
            annotationv2_f,
        ],
    )


def migrate_omitted_annotation_data_one_to_many_mapping() -> Tuple[
    Mapping,
    AbstractAnnotation,
    list[AbstractAnnotation],
]:
    parameterv1 = Parameter(
        id_="test/test.value.test8.test",
        name="test",
        qname="test.value.test8.test",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "1", ""),
    )
    parameterv2_a = Parameter(
        id_="test/test.value.test8.testA",
        name="testA",
        qname="test.value.test8.testA",
        default_value="2",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "2", ""),
    )

    parameterv2_b = Parameter(
        id_="test/test.value.test8.testB",
        name="testB",
        qname="test.value.test8.testB",
        default_value="2.0",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("float", "2.0", ""),
    )
    parameterv2_c = Parameter(
        id_="test/test.value.test8.testC",
        name="testC",
        qname="test.value.test8.testC",
        default_value='"value"',
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("string", '"value"', ""),
    )
    parameterv2_d = Parameter(
        id_="test/test.value.test8.testD",
        name="testD",
        qname="test.value.test8.testD",
        default_value="None",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "None", ""),
    )
    parameterv2_e = Parameter(
        id_="test/test.value.test8.testE",
        name="testE",
        qname="test.value.test8.testE",
        default_value=None,
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("", "", ""),
    )

    annotation = OmittedAnnotation(
        target="test/test.value.test8.test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
    )
    annotationv2_a = OmittedAnnotation(
        target="test/test.value.test8.testA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="The @Value Annotation with the variant 'omitted' "
        "from the previous version was at "
        "'test/test.value.test8.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD, testE",
        reviewResult=EnumReviewResult.UNSURE,
    )
    annotationv2_b = TodoAnnotation(
        target="test/test.value.test8.testB",
        authors=["testauthor", "migration"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'omitted' from "
        "the previous version was at "
        "'test/test.value.test8.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD, testE",
    )
    annotationv2_c = TodoAnnotation(
        target="test/test.value.test8.testC",
        authors=["testauthor", "migration"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'omitted' "
        "from the previous version was at "
        "'test/test.value.test8.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD, testE",
    )

    annotationv2_d = TodoAnnotation(
        target="test/test.value.test8.testD",
        authors=["testauthor", "migration"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'omitted' "
        "from the previous version was at "
        "'test/test.value.test8.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD, testE",
    )
    annotationv2_e = TodoAnnotation(
        target="test/test.value.test8.testE",
        authors=["testauthor", "migration"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'omitted' "
        "from the previous version was at "
        "'test/test.value.test8.test' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, testD, testE",
    )

    return (
        OneToManyMapping(
            1.0,
            parameterv1,
            [parameterv2_a, parameterv2_b, parameterv2_c, parameterv2_d, parameterv2_e],
        ),
        annotation,
        [
            annotationv2_a,
            annotationv2_b,
            annotationv2_c,
            annotationv2_d,
            annotationv2_e,
        ],
    )
