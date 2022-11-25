from inspect import cleandoc

import pytest
from package_parser.processing.api.model import (
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
    UnionType,
)
from package_parser.processing.migration import AbstractDiffer, SimpleDiffer

differ_list = [
    SimpleDiffer(),
]


@pytest.mark.parametrize(
    "differ",
    differ_list,
)
def test_attribute_similarity(differ: AbstractDiffer):
    attribute_a = Attribute("test_string", NamedType("str"))
    assert differ.compute_attribute_similarity(attribute_a, attribute_a) == 1

    attribute_b = Attribute("new_test_string", NamedType("str"))
    assert differ.compute_attribute_similarity(attribute_a, attribute_b) >= 0.5

    attribute_a = Attribute("value", UnionType([NamedType("str"), NamedType("int")]))
    attribute_b = Attribute("value", UnionType([NamedType("str"), NamedType("bool")]))
    assert differ.compute_attribute_similarity(attribute_a, attribute_b) >= 0.5


@pytest.mark.parametrize(
    "differ",
    differ_list,
)
def test_class_similarity(differ: AbstractDiffer):
    code_a = cleandoc(
        """
    class Test:
        pass"""
    )
    class_a = Class(
        "test/test.Test",
        "Test",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        code_a,
        [],
    )
    assert differ.compute_class_similarity(class_a, class_a) == 1

    code_b = cleandoc(
        """
    class newTest:
        pass"""
    )
    class_b = Class(
        "test/test.newTest",
        "newTest",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a new test", "This is a new test"),
        code_b,
        [],
    )
    assert differ.compute_class_similarity(class_a, class_b) > 0.6


@pytest.mark.parametrize(
    "differ",
    differ_list,
)
def test_function_similarity(differ: AbstractDiffer):
    parameters = [
        Parameter(
            "test/test.Test/test/test_parameter",
            "test_parameter",
            "test.Test.test.test_parameter",
            "str",
            ParameterAssignment.POSITION_OR_NAME,
            True,
            ParameterDocumentation("str", "", ""),
        )
    ]
    results: list[Result] = []
    code_a = cleandoc(
        """
    det test(test_parameter: str):
        \"\"\"
        This test function is a work
        \"\"\"
        return "test"
    """
    )
    function_a = Function(
        "test/test.Test/test",
        "test.Test.test",
        [],
        parameters,
        results,
        True,
        [],
        FunctionDocumentation(
            "This test function is a proof of work",
            "This test function is a proof of work",
        ),
        code_a,
    )
    assert differ.compute_function_similarity(function_a, function_a) == 1

    code_b = cleandoc(
        """
    det test_method(test_parameter: str):
        \"\"\"
        This test function is a concept.
        \"\"\"
        return "test"
    """
    )
    parameters = [
        Parameter(
            "test/test.Test/test_method/test_parameter",
            "test_parameter",
            "test.Test.test_method.test_parameter",
            "str",
            ParameterAssignment.POSITION_OR_NAME,
            True,
            ParameterDocumentation("str", "", ""),
        )
    ]
    function_b = Function(
        "test/test.Test/test_method",
        "test.Test.test_method",
        [],
        parameters,
        results,
        True,
        [],
        FunctionDocumentation(
            "This test function is a proof of concept.",
            "This test function is a proof of concept.",
        ),
        code_b,
    )
    assert differ.compute_function_similarity(function_a, function_b) > 0.5


@pytest.mark.parametrize(
    "differ",
    differ_list,
)
def test_parameter_similarity(differ: AbstractDiffer):
    parameter_a = Parameter(
        "test/test.Test/test_method/test_parameter",
        "test_parameter",
        "test.Test.test_method.test_parameter",
        "str",
        ParameterAssignment.POSITION_OR_NAME,
        True,
        ParameterDocumentation("str", "", ""),
    )
    parameter_b = Parameter(
        "test/test.Test/test_method/test_parameter",
        "test_parameter",
        "test.Test.test_method.test_parameter",
        "int",
        ParameterAssignment.POSITION_OR_NAME,
        True,
        ParameterDocumentation("int", "", ""),
    )
    assert differ.compute_parameter_similarity(parameter_a, parameter_b) > 0.5

    parameter_a = Parameter(
        "test/test.Test/test_method/test_parameter_new_name",
        "test_parameter_new_name",
        "test.Test.test_method.test_parameter_new_name",
        "int",
        ParameterAssignment.POSITION_OR_NAME,
        True,
        ParameterDocumentation("int", "", ""),
    )
    assert differ.compute_parameter_similarity(parameter_a, parameter_b) > 0.8


@pytest.mark.parametrize(
    "differ",
    differ_list,
)
def test_result_similarity(differ: AbstractDiffer):
    result_a = Result("config", ResultDocstring("dict", ""))
    assert differ.compute_result_similarity(result_a, result_a) == 1

    result_b = Result(
        "new_config",
        ResultDocstring("dict", "A dictionary that includes the new configuration"),
    )
    assert differ.compute_result_similarity(result_a, result_b) > 0.3
