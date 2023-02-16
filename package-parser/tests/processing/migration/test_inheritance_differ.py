from inspect import cleandoc
from typing import Tuple, Union

import pytest
from package_parser.processing.api.model import (
    API,
    Attribute,
    Class,
    ClassDocumentation,
    Function,
    FunctionDocumentation,
    NamedType,
    Parameter,
    ParameterAssignment,
    ParameterDocumentation,
    Result,
    ResultDocstring,
)
from package_parser.processing.migration.model import (
    AbstractDiffer,
    InheritanceDiffer,
    ManyToManyMapping,
    Mapping,
    OneToOneMapping,
)
from test_base_differ import differ_list


def create_api_super() -> Tuple[
    API, Class, Class, Attribute, Function, Parameter, Result
]:
    apiv1 = API("test-distribution", "test-package-super", "1.0")
    code_a = cleandoc(
        """
    class SuperTest:
        pass"""
    )
    class_id_super = "test/test/SuperTest"
    attribute_super = Attribute(
        "new_test_int", NamedType("int"), class_id=class_id_super
    )
    class_super = Class(
        class_id_super,
        "test.SuperTest",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        code_a,
        [attribute_super],
    )
    class_sub = Class(
        "test/test/SubTest",
        "test.SubTest",
        [],
        ["SuperTest"],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        "",
        [],
    )
    function_id_super = class_id_super + "/test_function_super"
    parameter_super = Parameter(
        function_id_super + "/super_test_parameter",
        "test_parameter",
        "test.SuperTest.test_function_super.super_test_parameter",
        "'test_str_a'",
        ParameterAssignment.POSITION_OR_NAME,
        True,
        ParameterDocumentation("'test_str_a'", "", ""),
    )
    result_super = Result(
        "config", ResultDocstring("dict", ""), function_id=function_id_super
    )
    code_function_a = cleandoc(
        """
    def test_function_super(test_parameter: str):
        \"\"\"
        This test function is a work
        \"\"\"
        return "test"
    """
    )
    function_super = Function(
        function_id_super,
        "test.SuperTest.test_function_super",
        [],
        [parameter_super],
        [result_super],
        True,
        [],
        FunctionDocumentation(
            "This is a test function",
            "This is a test function",
        ),
        code_function_a,
    )
    apiv1.add_class(class_super)
    apiv1.add_class(class_sub)
    apiv1.add_function(function_super)
    return (
        apiv1,
        class_super,
        class_sub,
        attribute_super,
        function_super,
        parameter_super,
        result_super,
    )


def create_api_sub() -> Tuple[
    API, Class, Class, Attribute, Function, Parameter, Result
]:
    apiv1 = API("test-distribution", "test-package-sub", "1.0")
    code_a = cleandoc(
        """
    class SubTest:
        pass"""
    )
    class_id_sub = "test/test/SubTest"
    attribute_sub = Attribute("new_test_int", NamedType("int"), class_id=class_id_sub)
    class_sub = Class(
        class_id_sub,
        "test.SubTest",
        [],
        ["SuperTest"],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        code_a,
        [attribute_sub],
    )
    class_super = Class(
        "test/test/SuperTest",
        "test.SuperTest",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        "",
        [],
    )
    function_id_sub = class_id_sub + "/test_function_sub"
    parameter_sub = Parameter(
        function_id_sub + "/sub_test_parameter",
        "test_parameter",
        "test.SubTest.test_function_sub.super_test_parameter",
        "'test_str_a'",
        ParameterAssignment.POSITION_OR_NAME,
        True,
        ParameterDocumentation("'test_str_a'", "", ""),
    )
    result_sub = Result(
        "config", ResultDocstring("dict", ""), function_id=function_id_sub
    )
    code_function_a = cleandoc(
        """
    def test_function_sub(test_parameter: str):
        \"\"\"
        This test function is a work
        \"\"\"
        return "test"
    """
    )
    function_sub = Function(
        function_id_sub,
        "test.SubTest.test_function_sub",
        [],
        [parameter_sub],
        [result_sub],
        True,
        [],
        FunctionDocumentation(
            "This test function is only for testing",
            "This test function is only for testing",
        ),
        code_function_a,
    )
    apiv1.add_class(class_sub)
    apiv1.add_class(class_super)
    apiv1.add_function(function_sub)
    return (
        apiv1,
        class_super,
        class_sub,
        attribute_sub,
        function_sub,
        parameter_sub,
        result_sub,
    )


@pytest.mark.parametrize(
    "differ",
    differ_list,
)  # type: ignore
def test_inheritance_differ(differ: AbstractDiffer) -> None:
    for api, superclass, subclass, attribute, function, parameter, result in [
        create_api_super(),
        create_api_sub(),
    ]:
        for (
            apiv2,
            superclassv2,
            subclassv2,
            attributev2,
            functionv2,
            parameterv2,
            resultv2,
        ) in [create_api_super(), create_api_sub()]:
            idiffer = InheritanceDiffer(
                differ,
                [
                    OneToOneMapping(1.0, superclass, superclassv2),
                    OneToOneMapping(1.0, subclassv2, subclassv2),
                ],
                api,
                api,
                boost_value=0.0,
            )
            assert len(idiffer.inheritance.values()) == 2
            for inheritance_list in idiffer.inheritance.values():
                assert len(inheritance_list) == 2
            assert idiffer.compute_class_similarity(
                superclass, superclassv2
            ) == differ.compute_class_similarity(superclass, superclassv2)
            assert idiffer.compute_class_similarity(
                subclass, subclassv2
            ) == differ.compute_class_similarity(subclass, subclassv2)
            assert idiffer.compute_attribute_similarity(
                attributev2, attributev2
            ) == differ.compute_attribute_similarity(attribute, attributev2)
            assert idiffer.compute_function_similarity(
                function, functionv2
            ) == differ.compute_function_similarity(function, functionv2)
            assert idiffer.compute_parameter_similarity(parameter, parameterv2) == 0.0
            assert idiffer.compute_result_similarity(result, resultv2) == 0.0
            idiffer.notify_new_mapping([OneToOneMapping(1.0, function, functionv2)])
            assert idiffer.compute_parameter_similarity(
                parameter, parameterv2
            ) == differ.compute_parameter_similarity(parameter, parameterv2)
            assert idiffer.compute_result_similarity(
                result, resultv2
            ) == differ.compute_result_similarity(result, resultv2)
            idiffer = InheritanceDiffer(
                differ,
                [
                    OneToOneMapping(1.0, superclass, superclassv2),
                    OneToOneMapping(1.0, subclass, subclassv2),
                ],
                api,
                api,
                boost_value=1.0,
            )
            assert idiffer.compute_class_similarity(superclass, superclassv2) == 1
            assert idiffer.compute_class_similarity(subclass, subclassv2) == 1
            assert idiffer.compute_attribute_similarity(attribute, attributev2) == 1
            assert idiffer.compute_function_similarity(function, functionv2) == 1
            assert idiffer.compute_parameter_similarity(parameter, parameterv2) == 0.0
            assert idiffer.compute_result_similarity(result, resultv2) == 0.0
            idiffer.notify_new_mapping([OneToOneMapping(1.0, function, functionv2)])
            assert idiffer.compute_parameter_similarity(parameter, parameterv2) == 1
            assert idiffer.compute_result_similarity(result, resultv2) == 1
            previous_mapping: list[Mapping] = [
                ManyToManyMapping(-1.0, [result], [resultv2])
            ]
            assert (
                InheritanceDiffer(
                    differ, previous_mapping, api, api
                ).get_additional_mappings()
                == previous_mapping
            )
            related_mappings = InheritanceDiffer(
                differ, [], api, apiv2
            ).get_related_mappings()
            expected_related_mappings = [
                ManyToManyMapping(
                    -1.0, [superclass, subclass], [superclassv2, subclassv2]
                ),
                ManyToManyMapping(-1.0, [function], [functionv2]),
                ManyToManyMapping(-1.0, [attribute], [attributev2]),
                ManyToManyMapping(-1.0, [parameter], [parameterv2]),
                *previous_mapping,
            ]
            assert related_mappings is not None
            assert len(related_mappings) == 5

            def print_api_element(
                api_element: Union[Attribute, Class, Function, Parameter, Result]
            ) -> str:
                if isinstance(api_element, Result):
                    assert api_element.function_id is not None
                    return api_element.function_id + "/" + api_element.name
                if isinstance(api_element, Attribute):
                    return str(api_element.class_id) + "/" + api_element.name
                return "/".join(api_element.id.split("/")[1:])

            for i in range(5):
                related_mapping = related_mappings[i]
                assert sorted(
                    related_mapping.get_apiv1_elements(), key=print_api_element
                ) == sorted(
                    expected_related_mappings[i].get_apiv1_elements(),
                    key=print_api_element,
                )
                assert sorted(
                    related_mapping.get_apiv2_elements(), key=print_api_element
                ) == sorted(
                    expected_related_mappings[i].get_apiv2_elements(),
                    key=print_api_element,
                )
