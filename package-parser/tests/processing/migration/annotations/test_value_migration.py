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
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "this is a string", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.value.test1.testB",
        name="testB",
        qname="test.value.test1.testB",
        default_value="1",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("str", "test string", ""),
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
        default_value="6",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "6", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.value.test2.testB",
        name="testB",
        qname="test.value.test2.testB",
        default_value="6",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "6", ""),
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
        default_value="1.0",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("float", "1.0", ""),
    )
    parameterv2 = Parameter(
        id_="test/test.value.test4.testB",
        name="testB",
        qname="test.value.test4.testB",
        default_value="2.0",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("float", "2.0", ""),
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
        documentation=ParameterDocumentation("str", "test_string", ""),
    )
    attribute = Attribute("test_attribute", NamedType("str"))
    annotation = ConstantAnnotation(
        target="test/test.value.test5.test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.NUMBER,
        defaultValue="2",
    )
    annotationv2_a = ConstantAnnotation(
        target="test/test.value.test5.testA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.NUMBER,
        defaultValue="2",
    )
    annotationv2_b = ConstantAnnotation(
        target="test/test.value.test5.testB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="The @Value Annotation with the variant 'constant' "
        "and the default Value '2 ( type: number )' from "
        "the previous version was at "
        "'test/test.value.test5.testB' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, test_attribute",
        reviewResult=EnumReviewResult.UNSURE,
        defaultValueType=ValueAnnotation.DefaultValueType.NUMBER,
        defaultValue="2",
    )
    annotationv2_c = TodoAnnotation(
        target="test/test.value.test5.testC",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.UNSURE,
        newTodo="The @Value Annotation with the variant 'constant' "
        "and the default Value '2 ( type: number )' from "
        "the previous version was at "
        "'test/test.value.test5.testB' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC, test_attribute",
    )

    return (
        OneToManyMapping(
            1.0, parameterv1, [parameterv2_a, parameterv2_b, parameterv2_c, attribute]
        ),
        annotation,
        [annotationv2_a, annotationv2_b, annotationv2_c],
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
        default_value="2.0",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("float", "2.0", ""),
    )

    parameterv2_a = Parameter(
        id_="test/test.value.test6.testA",
        name="testA",
        qname="test.value.test6.testA",
        default_value="5",
        assigned_by=ParameterAssignment.POSITION_OR_NAME,
        is_public=True,
        documentation=ParameterDocumentation("int", "5", "int in the range of (0, 10)"),
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
    annotation = OptionalAnnotation(
        target="test/test.value.test6.test",
        authors=["testauthor"],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.NUMBER,
        defaultValue="2",
    )
    annotationv2_a = OptionalAnnotation(
        target="test/test.value.test6.testA",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="",
        reviewResult=EnumReviewResult.NONE,
        defaultValueType=ValueAnnotation.DefaultValueType.NUMBER,
        defaultValue="2",
    )
    annotationv2_b = OptionalAnnotation(
        target="test/test.value.test6.testB",
        authors=["testauthor", migration_author],
        reviewers=[],
        comment="The @Value Annotation with the variant 'optional' "
        "and the default Value '2 ( type: number )' from "
        "the previous version was at "
        "'test/test.value.test6.testB' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC",
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
        "'test/test.value.test6.testB' and the possible "
        "alternatives in the new version of the api are: "
        "testA, testB, testC",
    )
    return (
        OneToManyMapping(
            1.0, parameterv1, [parameterv2_a, parameterv2_b, parameterv2_c]
        ),
        annotation,
        [annotationv2_a, annotationv2_b, annotationv2_c],
    )
