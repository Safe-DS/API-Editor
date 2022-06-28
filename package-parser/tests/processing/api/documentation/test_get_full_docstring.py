import astroid
import pytest

# language=python
from package_parser.processing.api.documentation._AbstractDocumentationParsingStrategy import get_full_docstring

test_class_with_documentation = '''
class C:
    """Lorem ipsum."""
    pass
'''

# language=python
test_function_with_documentation = '''
def f():
    """Lorem ipsum."""
    pass
'''

test_class_without_documentation = '''
class C:
    pass
'''

# language=python
test_function_without_documentation = '''
def f():
    pass
'''


@pytest.mark.parametrize(
    "python_code, expected_docstring",
    [
        (test_class_with_documentation, "Lorem ipsum."),
        (test_function_with_documentation, "Lorem ipsum."),
        (test_class_without_documentation, ""),
        (test_function_without_documentation, ""),
    ]
)
def test_get_full_docstring(python_code: str, expected_docstring: str):
    node = astroid.extract_node(python_code)

    assert isinstance(node, astroid.ClassDef) or isinstance(node, astroid.FunctionDef)
    assert get_full_docstring(node) == expected_docstring
