import importlib
from pathlib import Path
from typing import Optional

# pylint: disable=no-name-in-module
from importlib_metadata import packages_distributions, version
from package_parser.utils import list_files

from ._file_filters import _is_init_file


def package_files(root: Path) -> list[str]:
    files = list_files(root, ".py")
    return __move_init_files_to_front(files)


def package_root(package_name: str) -> Path:
    path_as_string = importlib.import_module(package_name).__file__
    if path_as_string is None:
        raise AssertionError(f"Cannot find package root for '{path_as_string}'.")
    return Path(path_as_string).parent


def __move_init_files_to_front(files: list[str]) -> list[str]:
    init_files = []
    other_files = []

    for file in files:
        if _is_init_file(file):
            init_files.append(file)
        else:
            other_files.append(file)

    return init_files + other_files


def distribution(package_name: str) -> Optional[str]:
    dist = packages_distributions().get(package_name)
    if dist is None or len(dist) == 0:
        return None

    return dist[0]


def distribution_version(dist: Optional[str]) -> Optional[str]:
    if dist is None:
        return None

    return version(dist)
