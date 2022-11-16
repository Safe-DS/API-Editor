from inspect import cleandoc

import astroid
import pytest
from package_parser.processing.api._ast_visitor import trim_code


@pytest.mark.parametrize(
    "code_to_pare,expected_code",
    [
        (
            """

            def test():
                i = 0
                if i == 0:
                    i = i + 1
                pass

            """,
            cleandoc(
                """
            def test():
                i = 0
                if i == 0:
                    i = i + 1
                pass
            """
            ),
        ),
        (
            """
            # blank line
            def test():
                # do nothing
                pass
            def this_line_should_not_be_included():
                pass

            """,
            cleandoc(
                """
            def test():
                # do nothing
                pass
            """
            ),
        ),
        (
            """
            # blank line
            class Test:
                def test():
                    # do nothing
                    pass
                def test2() -> int:
                    return 42
                    # test line should not included
            def this_line_should_not_be_included():
                pass

            """,
            cleandoc(
                """
            class Test:
                def test():
                    # do nothing
                    pass
                def test2() -> int:
                    return 42
            """
            ),
        ),
    ],
)
def test_trim_code(code_to_pare: str, expected_code: str):
    module = astroid.parse(code_to_pare)
    assert len(module.body) != 0
    assert (
        trim_code(
            module.file_bytes,
            module.body[0].fromlineno,
            module.body[0].tolineno,
            module.file_encoding,
        )
        == expected_code
    )
