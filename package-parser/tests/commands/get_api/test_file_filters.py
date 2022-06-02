from package_parser.processing.api._file_filters import _is_init_file, _is_test_file


def test_is_init_file_positive():
    assert _is_init_file("path/to/file/__init__.py")
    assert _is_init_file("__init__.py")


def test_is_init_file_negative():
    assert not _is_init_file("path/to/file/_init_.py")
    assert not _is_init_file("init.py")


def test_is_test_file_positive():
    assert _is_test_file("path/to/test/file/script.py")
    assert _is_test_file("path/to/tests/script.py")


def test_is_test_file_negative():
    assert not _is_test_file("path/to/file/test.py")
    assert not _is_test_file("path/to/file/tests.py")
