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
)
from package_parser.processing.migration.model import (
    AbstractDiffer,
    OneToOneMapping,
    StrictDiffer,
)
from test_base_differ import differ_list


@pytest.mark.parametrize(
    "differ",
    differ_list,
)  # type: ignore
def test_similarity(differ: AbstractDiffer) -> None:
    apiv1 = API("test-distribution", "test-package", "1.0")
    apiv2 = API("test-distribution", "test-package", "2.0")
    code_a = cleandoc(
        """
    class Test:
        pass"""
    )
    class_id_a = "test/test/Test"
    attribute_a = Attribute("new_test_string", NamedType("str"), class_id=class_id_a)
    class_a = Class(
        class_id_a,
        "test.Test",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a test", "This is a test"),
        code_a,
        [attribute_a],
    )

    code_b = cleandoc(
        """
    class newTest:
        pass"""
    )
    class_id_b = "test/test/NewTest"
    attribute_b = Attribute("test_string", NamedType("str"), class_id=class_id_b)
    class_b = Class(
        class_id_b,
        "test.newTest",
        [],
        [],
        True,
        [],
        ClassDocumentation("This is a new test", "This is a new test"),
        code_b,
        [attribute_b],
    )
    apiv1.add_class(class_a)
    apiv2.add_class(class_b)

    function_id_a = class_id_a + "/test_function"
    parameter_a = Parameter(
        function_id_a + "/test_parameter",
        "test_parameter",
        "test.Test.test_function.test_parameter",
        "'test_str_a'",
        ParameterAssignment.POSITION_OR_NAME,
        True,
        ParameterDocumentation("'test_str_a'", "", ""),
    )
    result_a = Result("config", ResultDocstring("dict", ""), function_id=function_id_a)
    code_function_a = cleandoc(
        """
    def test(test_parameter: str):
        \"\"\"
        This test function is a work
        \"\"\"
        return "test"
    """
    )
    function_a = Function(
        function_id_a,
        "test.Test.test",
        [],
        [parameter_a],
        [result_a],
        True,
        [],
        FunctionDocumentation(
            "This test function is a for testing",
            "This test function is a for testing",
        ),
        code_function_a,
    )
    function_id_b = class_id_b + "/test_method"
    code_b = cleandoc(
        """
    def test_method(test_parameter: str):
        \"\"\"
        This test function is a concept.
        \"\"\"
        return "test"
    """
    )
    parameter_b = Parameter(
        function_id_b + "/test_parameter",
        "test_parameter",
        "test.Test.test_method.test_parameter",
        "'test_str_b'",
        ParameterAssignment.POSITION_OR_NAME,
        True,
        ParameterDocumentation("'test_str_b'", "", ""),
    )
    result_b = Result(
        "new_config",
        ResultDocstring("dict", "A dictionary that includes the new configuration"),
        function_id=function_id_b,
    )
    function_b = Function(
        function_id_b,
        "test.Test.test_method",
        [],
        [parameter_b],
        [result_b],
        True,
        [],
        FunctionDocumentation(
            "This test function is a test",
            "This test function is a test",
        ),
        code_b,
    )
    apiv1.add_function(function_a)
    apiv2.add_function(function_b)

    class_mapping = OneToOneMapping(1.0, class_a, class_b)
    function_mapping = OneToOneMapping(1.0, function_a, function_b)

    strict_differ = StrictDiffer(differ, [], apiv1, apiv2)
    assert strict_differ.compute_class_similarity(class_a, class_b) == 0
    assert strict_differ.compute_attribute_similarity(attribute_a, attribute_b) == 0
    assert strict_differ.compute_function_similarity(function_a, function_b) == 0
    assert strict_differ.compute_parameter_similarity(parameter_a, parameter_b) == 0
    assert strict_differ.compute_result_similarity(result_a, result_b) == 0

    strict_differ = StrictDiffer(differ, [class_mapping], apiv1, apiv2)
    assert strict_differ.compute_class_similarity(class_a, class_b) > 0
    strict_differ.notify_new_mapping([class_mapping])
    assert strict_differ.compute_attribute_similarity(attribute_a, attribute_b) > 0
    assert strict_differ.compute_function_similarity(function_a, function_b) > 0
    assert strict_differ.compute_parameter_similarity(parameter_a, parameter_b) == 0
    assert strict_differ.compute_result_similarity(result_a, result_b) == 0

    strict_differ_notify_all = StrictDiffer(
        differ,
        [
            class_mapping,
            OneToOneMapping(1.0, attribute_a, attribute_b),
            function_mapping,
            OneToOneMapping(1.0, parameter_a, parameter_b),
            OneToOneMapping(1.0, result_a, result_b),
        ],
        apiv1,
        apiv2,
    )
    assert strict_differ_notify_all.compute_class_similarity(class_a, class_b) > 0
    strict_differ_notify_all.notify_new_mapping([class_mapping])
    assert (
        strict_differ_notify_all.compute_attribute_similarity(attribute_a, attribute_b)
        > 0
    )
    assert (
        strict_differ_notify_all.compute_function_similarity(function_a, function_b) > 0
    )
    strict_differ_notify_all.notify_new_mapping([function_mapping])
    assert (
        strict_differ_notify_all.compute_parameter_similarity(parameter_a, parameter_b)
        > 0
    )
    assert strict_differ_notify_all.compute_result_similarity(result_a, result_b) > 0
