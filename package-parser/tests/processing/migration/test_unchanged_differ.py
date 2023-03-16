from copy import deepcopy
from inspect import cleandoc

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
from package_parser.processing.migration.model import OneToOneMapping, UnchangedDiffer


def test_similarity() -> None:
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

    class_c = deepcopy(class_a)
    class_c.instance_attributes = []
    class_c.id = "test/test.changed.implementation/Class_"
    class_d = deepcopy(class_c)
    class_d.code = "test_code"
    class_d.id = "test/test.changed.implementation/Class_"
    apiv1.add_class(class_c)
    apiv2.add_class(class_d)

    class_mapping = OneToOneMapping(1.0, class_a, class_a)
    function_mapping = OneToOneMapping(1.0, function_a, function_a)
    attribute_mapping = OneToOneMapping(1.0, attribute_a, attribute_a)
    parameter_mapping = OneToOneMapping(1.0, parameter_a, parameter_a)
    result_mapping = OneToOneMapping(1.0, result_a, result_a)
    class_mapping_changed_code = OneToOneMapping(1.0, class_c, class_d)

    unchanged_differ = UnchangedDiffer(None, [], apiv1, apiv2)
    assert unchanged_differ.get_additional_mappings() == [class_mapping_changed_code]
    apiv1.classes.pop(class_c.id)
    apiv2.classes.pop(class_d.id)
    unchanged_differ = UnchangedDiffer(None, [], apiv1, apiv1)
    expected_mappings = [
        class_mapping,
        function_mapping,
        parameter_mapping,
        attribute_mapping,
        result_mapping,
    ]
    assert unchanged_differ.get_additional_mappings() == expected_mappings
