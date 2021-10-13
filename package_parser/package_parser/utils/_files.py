import os
from pathlib import Path
from typing import TextIO


def list_files(root_dir: Path, extension: str = "") -> list[str]:
    """
    :param root_dir: The directory containing the files.
    :param extension: The extension the files should have.
    :return: A list with absolute paths to the files.
    """

    result: list[str] = []

    for root, _, files in os.walk(root_dir):
        for filename in files:
            if filename.endswith(extension):
                result.append(str(os.path.join(root, filename)))

    return result


def ensure_file_exists(file: Path) -> None:
    """
    Creates a file and all parent directories if they don't exist already.

    :param file: The file path.
    """

    file.parent.mkdir(parents=True, exist_ok=True)
    file.touch(exist_ok=True)


def initialize_and_read_exclude_file(exclude_file: Path) -> list[str]:
    exclude_file.parent.mkdir(parents=True, exist_ok=True)
    try:
        with exclude_file.open("r") as f:
            return __read_lines(f)
    except FileNotFoundError:
        return []


def __read_lines(f: TextIO) -> list[str]:
    return [it.strip() for it in f.readlines() if it != ""]


def __write_lines(f: TextIO, lines: list[str]) -> None:
    f.writelines(f"{it}\n" for it in lines)
