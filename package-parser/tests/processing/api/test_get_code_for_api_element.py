from inspect import cleandoc
from typing import Union

import astroid
import pytest
from package_parser.processing.api._ast_visitor import trim_code
from package_parser.processing.api.model import Class, Function, ClassDocumentation, FunctionDocumentation


@pytest.mark.parametrize(
    "code_to_parse,expected_code",
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
def test_trim_code(code_to_parse: str, expected_code: str):
    module = astroid.parse(code_to_parse)
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


@pytest.mark.parametrize(
    "code,expected_code",
    [
        (
                cleandoc("""
    
                def test():
                    i = 0
                    if i == 0:
                        i = i + 1
                    pass
    
                """),
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
                cleandoc("""
                # blank line
                def test():
                    \"\"\" test doumentation
                    sdf
                    sdf
                    dsf
                    sdf
                    \"\"\"
                    pass
    
                """),
                cleandoc(
                    """
                # blank line
                def test():
                    pass
                """
                ),
        ),
        (
                cleandoc("""
                def test():
                    \"\"\"
                    test doumentation
                    sdfsdf
                    \"\"\"
                    pass
    
                """),
                cleandoc(
                    """
                def test():
                    pass
                """
                ),
        ),
        (
            cleandoc("""
                def test():
                    \"\"\"test doumentation\"\"\"
                    pass
    
                """),
            cleandoc(
                """
            def test():
                pass
            """
            ),
    ),
        (
          cleandoc(
              """
              from dataclasses import dataclass
              
              
              @dataclass()
              class D:
                  \"\"\" todo 
                  dfhkdsklfh 
                  dfhkdsklfh 
                  dfhkdsklfh
                  \"\"\"
                  e: str
              """
          ),
          cleandoc(
              """
              from dataclasses import dataclass
              
              
              @dataclass()
              class D:
                  e: str
              """
          ),
        ),
    ],
)
def test_cut_documentation_from_code(code: str, expected_code: str):
    is_class = "\nclass" in code
    if is_class:
        api_element = Class(
            "test/test.test/Test",
            "test.test.Test",
            [],
            [],
            True,
            [],
            ClassDocumentation("this documentation string cannot be used", " because indentation was removed"),
            code,
            [],
        )
    else:
        api_element = Function(
            "test/test.test/Test.test",
            "test.test.Test.test",
            [],
            [],
            [],
            True,
            [],
            FunctionDocumentation("", ""),
            code,
        )
    assert api_element.get_formatted_code(cut_documentation=True) == expected_code+"\n"



