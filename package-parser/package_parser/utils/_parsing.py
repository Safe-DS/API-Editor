import textwrap

from astroid import nodes, rebuilder
from astroid.builder import AstroidBuilder
from astroid.manager import AstroidManager


def parse_without_caching(code: str, module_name: str = "", path=None, apply_transforms=True):
    """Parses a source string in order to obtain an astroid AST from it

    :param str code: The code for the module.
    :param str module_name: The name for the module, if any
    :param str path: The path for the module
    :param bool apply_transforms:
        Apply the transforms for the give code. Use it if you
        don't want the default transforms to be applied.
    """
    code = textwrap.dedent(code)
    builder = AstroidBuilder(
        manager=AstroidManager(), apply_transforms=apply_transforms
    )
    return builder.string_build(code, modname=module_name, path=path)  # causes memory leak


class MyAstroidBuild(AstroidBuilder):
    def string_build(self, data: str, modname: str = "", path: str = None):
        """Build astroid from source code string."""
        module, builder = self._data_build(data, modname, path)
        module.file_bytes = data.encode("utf-8")
        return self._post_build(module, builder, "utf-8")

    def _post_build(
        self, module: nodes.Module, builder: rebuilder.TreeRebuilder, encoding: str
    ) -> nodes.Module:
        """Handles encoding and delayed nodes after a module has been built"""
        module.file_encoding = encoding
        # post tree building steps after we stored the module in the cache:
        for from_node in builder._import_from_nodes:
            if from_node.modname == "__future__":
                for symbol, _ in from_node.names:
                    module.future_imports.add(symbol)
            self.add_from_names_to_locals(from_node)
        # handle delayed assattr nodes
        for delayed in builder._delayed_assattr:
            self.delayed_assattr(delayed)

        # Visit the transforms
        if self._apply_transforms:
            module = self._manager.visit_transforms(module)
        return module
