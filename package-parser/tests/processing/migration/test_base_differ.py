from inspect import cleandoc

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
    UnionType,
)
from package_parser.processing.migration.model import AbstractDiffer, SimpleDiffer
from package_parser.processing.migration.model._differ import (
    distance_elements_with_cost_function,
)

differ_list = [
    SimpleDiffer(
        None,
        [],
        API(
            "test-distribution",
            "test-package",
            "1.0.0",
        ),
        API(
            "test-distribution",
            "test-package",
            "1.0.1",
        ),
    ),
]


@pytest.mark.parametrize(
    "differ",
    differ_list,
)  # type: ignore
def test_attribute_similarity(differ: AbstractDiffer) -> None:
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
)  # type: ignore
def test_class_similarity(differ: AbstractDiffer) -> None:
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
)  # type: ignore
def test_function_similarity(differ: AbstractDiffer) -> None:
    parameters = [
        Parameter(
            "test/test.Test/test/test_parameter",
            "test_parameter",
            "test.Test.test.test_parameter",
            "'test_str'",
            ParameterAssignment.POSITION_OR_NAME,
            True,
            ParameterDocumentation("'test_str'", "", ""),
        )
    ]
    results: list[Result] = []
    code_a = cleandoc(
        """
    def test(test_parameter: str):
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
    def test_method(test_parameter: str):
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
            "'test_str'",
            ParameterAssignment.POSITION_OR_NAME,
            True,
            ParameterDocumentation("'test_str'", "", ""),
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
)  # type: ignore
def test_parameter_similarity(differ: AbstractDiffer) -> None:
    parameter_a = Parameter(
        "test/test.Test/test_method/test_parameter",
        "test_parameter",
        "test.Test.test_method.test_parameter",
        "'str'",
        ParameterAssignment.POSITION_OR_NAME,
        True,
        ParameterDocumentation("'str'", "", ""),
    )
    parameter_b = Parameter(
        "test/test.Test/test_method/test_parameter",
        "test_parameter",
        "test.Test.test_method.test_parameter",
        "5",
        ParameterAssignment.POSITION_OR_NAME,
        True,
        ParameterDocumentation("int", "", ""),
    )
    assert 0.45 < differ.compute_parameter_similarity(parameter_a, parameter_b) < 0.7

    parameter_a = Parameter(
        "test/test.Test/test_method/test_parameter_new_name",
        "test_parameter_new_name",
        "test.Test.test_method.test_parameter_new_name",
        "9",
        ParameterAssignment.POSITION_OR_NAME,
        True,
        ParameterDocumentation("int", "", ""),
    )
    assert 0.75 < differ.compute_parameter_similarity(parameter_a, parameter_b) < 0.9


@pytest.mark.parametrize(
    "differ",
    differ_list,
)  # type: ignore
def test_result_similarity(differ: AbstractDiffer) -> None:
    result_a = Result("config", ResultDocstring("dict", ""))
    assert differ.compute_result_similarity(result_a, result_a) == 1

    result_b = Result(
        "new_config",
        ResultDocstring("dict", "A dictionary that includes the new configuration"),
    )
    assert differ.compute_result_similarity(result_a, result_b) > 0.3


def test_simple_differ() -> None:
    simple_differ = SimpleDiffer(
        None,
        [],
        API(
            "test-distribution",
            "test-package",
            "1.0.0",
        ),
        API(
            "test-distribution",
            "test-package",
            "1.0.1",
        ),
    )
    for dict_ in simple_differ.assigned_by_look_up_similarity.values():
        for similarity in dict_.values():
            assert similarity >= 0


def test_wheighted_levenshtein_distance() -> None:
    def cost_function(iteration: int, max_iteration: int) -> float:
        return (max_iteration - iteration + 1) / max_iteration

    cost, max_iteration = distance_elements_with_cost_function(
        ["a", "b", "c"], ["x", "b", "c"], cost_function=cost_function
    )
    assert cost == 1 and max_iteration == 3

    cost, max_iteration = distance_elements_with_cost_function(
        ["a", "b", "c"], ["a", "b", "z"], cost_function=cost_function
    )
    assert cost == 1 / 3 and max_iteration == 3

    differ = SimpleDiffer(None, [], API("", "", ""), API("", "", ""))
    assert (
        differ._compute_id_similarity("api/test.test.text/a", "api/tests.tests.texts/b")
        == 0
    )
