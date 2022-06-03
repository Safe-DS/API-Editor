from package_parser.processing.dependencies._preprocess_docstring import (
    preprocess_docstring,
)


def test_preprocess_docstring_removes_quotations():
    docstring = '"parameter" is "one"'
    processed_docstring = preprocess_docstring(docstring)
    assert processed_docstring == "parameter is one"


def test_preprocess_docstring_substitutes_equals_sign():
    docstring = "parameter = one == two"
    processed_docstring = preprocess_docstring(docstring)
    assert processed_docstring == "parameter equals one equals two"


def test_preprocess_docstring_separates_equals_sign():
    docstring = "parameter=one==two"
    processed_docstring = preprocess_docstring(docstring)
    assert processed_docstring == "parameter equals one equals two"


def test_preprocess_docstring_substitutes_not_equals_sign():
    docstring = "parameter!=one!=two"
    processed_docstring = preprocess_docstring(docstring)
    assert processed_docstring == "parameter does not equal one does not equal two"
