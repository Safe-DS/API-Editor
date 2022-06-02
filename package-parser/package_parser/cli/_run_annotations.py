import json
from pathlib import Path

from package_parser.commands.annotations import generate_annotations
from package_parser.model.api import API
from package_parser.model.usages import UsageCountStore
from package_parser.utils import ensure_file_exists


def _run_annotations(
    api_file_path: Path,
    usages_file_path: Path,
    output_file_path: Path
) -> None:
    """
    Generates an annotation file from the given API and UsageStore files, and writes it to the given output file.
    Annotations that are generated are: remove, constant, required, optional, enum and boundary.
    :param api_file_path: API file Path
    :param usages_file_path: UsageStore file Path
    :param output_file_path: Output file Path
    """

    api = _read_api_file(api_file_path)
    usages = _read_usages_file(usages_file_path)
    _write_annotations_file(api, usages, output_file_path)


def _read_api_file(api_file_path: Path) -> API:
    with open(api_file_path) as api_file:
        api_json = json.load(api_file)

    return API.from_json(api_json)


def _read_usages_file(usages_file_path: Path) -> UsageCountStore:
    with open(usages_file_path) as usages_file:
        usages_json = json.load(usages_file)

    return UsageCountStore.from_json(usages_json)


def _write_annotations_file(api: API, usages: UsageCountStore, output_file_path: Path) -> None:
    annotations = generate_annotations(api, usages)

    ensure_file_exists(output_file_path)
    with output_file_path.open("w") as f:
        json.dump(annotations.to_json(), f, indent=2)
