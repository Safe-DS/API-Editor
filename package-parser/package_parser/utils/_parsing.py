import textwrap

import astroid
from astroid import nodes, rebuilder
from astroid.builder import AstroidBuilder


def parse_python_code(
    code: str,
    module_name: str = "",
    path: str = None,
    ast_builder: AstroidBuilder = None
) -> astroid.Module:
    """Parses a source string in order to obtain an astroid AST from it

    :param str code: The code for the module.
    :param str module_name: The name for the module, if any
    :param str path: The path for the module
    :param ast_builder: The Astroid builder to use
    """

    if ast_builder is None:
        ast_builder = NonCachingAstBuilder()

    code = textwrap.dedent(code)
    return ast_builder.string_build(code, modname=module_name, path=path)


class NonCachingAstBuilder(AstroidBuilder):
    def _post_build(
        self,
        module: nodes.Module,
        builder: rebuilder.TreeRebuilder,
        encoding: str
    ) -> nodes.Module:
        """Handles encoding and delayed nodes after a module has been built"""
        module.file_encoding = encoding
        # self._manager.cache_module(module)
        # post tree building steps after we stored the module in the cache:
        for from_node in builder._import_from_nodes:
            if from_node.modname == "__future__":
                for symbol, _ in from_node.names:
                    module.future_imports.add(symbol)
            self.add_from_names_to_locals(from_node)
        # handle delayed assattr nodes
        for delayed in builder._delayed_assattr:
            self.delayed_assattr(delayed)  # memory leak

        # Visit the transforms
        if self._apply_transforms:
            module = self._manager.visit_transforms(module)
        return module
