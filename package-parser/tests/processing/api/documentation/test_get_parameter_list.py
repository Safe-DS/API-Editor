import astroid
import pytest

from package_parser.processing.api import get_parameter_list
from package_parser.processing.api.documentation import DefaultDocumentationParser

# language=Python
empty_parameter_list = """
def f():
    pass
"""


@pytest.mark.parametrize(
    "python_code, expected_parameter_list",
    [
        (empty_parameter_list, []),
    ]
)
def test_get_parameter_list(python_code: str, expected_parameter_list: list):
    node = astroid.extract_node(python_code)
    assert isinstance(node, astroid.FunctionDef)
    assert get_parameter_list(DefaultDocumentationParser(), node, "", "", True) == expected_parameter_list
