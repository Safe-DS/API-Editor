import textwrap

import astroid
from astroid.builder import AstroidBuilder


def parse_python_code(
    code: str,
    module_name: str = "",
    path: str = None,
    ast_builder: AstroidBuilder = None,
) -> astroid.Module:
    """Parses a source string in order to obtain an astroid AST from it

    :param str code: The code for the module.
    :param str module_name: The name for the module, if any
    :param str path: The path for the module
    :param ast_builder: The Astroid builder to use
    """

    if ast_builder is None:
        ast_builder = AstroidBuilder()

    code = textwrap.dedent(code)
    return ast_builder.string_build(code, modname=module_name, path=path)
