from pathlib import Path

import astroid
from package_parser.utils import ASTWalker

from ._ast_visitor import _AstVisitor
from ._file_filters import _is_test_file
from ._model import API
from ._package_metadata import (
    distribution,
    distribution_version,
    package_files,
    package_root,
)


def get_api(package_name: str) -> API:
    root = package_root(package_name)
    dist = distribution(package_name) or ""
    dist_version = distribution_version(dist) or ""
    files = package_files(package_name)

    api = API(dist, package_name, dist_version)
    callable_visitor = _AstVisitor(api)
    walker = ASTWalker(callable_visitor)

    for file in files:
        posix_path = Path(file).as_posix()
        print(f"Working on file {posix_path}")

        if _is_test_file(posix_path):
            print("Skipping test file")
            continue

        with open(file, "r", encoding="utf-8") as f:
            source = f.read()
            walker.walk(
                astroid.parse(
                    source, module_name=__module_name(root, Path(file)), path=file
                )
            )

    return callable_visitor.api


def __module_name(root: Path, file: Path) -> str:
    relative_path = file.relative_to(root.parent).as_posix()
    return str(relative_path).replace(".py", "").replace("/", ".")
