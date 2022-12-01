from pathlib import Path

from package_parser.processing.annotations import generate_annotations

from ._read_and_write_file import (
    _read_api_file,
    _read_usages_file,
    _write_annotations_file,
)


def _run_annotations(
    api_file_path: Path, usages_file_path: Path, annotations_file_path: Path
) -> None:
    """
    Generates an annotation file from the given API and UsageStore files, and writes it to the given output file.
    Annotations that are generated are: remove, constant, required, optional, enum and boundary.
    :param api_file_path: API file Path
    :param usages_file_path: UsageStore file Path
    :param annotations_file_path: Output file Path
    """

    api = _read_api_file(api_file_path)
    usages = _read_usages_file(usages_file_path)
    annotations = generate_annotations(api, usages)
    _write_annotations_file(annotations, annotations_file_path)
