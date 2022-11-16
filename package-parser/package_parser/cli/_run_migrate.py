import json
from pathlib import Path

from package_parser.processing.annotations.model import AnnotationStore
from package_parser.processing.api.model import API


def _run_migrate_command(
    apiv1_file_path: Path,
    annotations_file_path: Path,
    apiv2_file_path: Path,
    out_dir_path: Path,
) -> None:
    # pylint: disable=unused-argument
    _read_api_file(apiv1_file_path)
    _read_api_file(apiv2_file_path)
    _read_annotations_file(annotations_file_path)


def _read_annotations_file(annotations_file_path: Path) -> AnnotationStore:
    with open(annotations_file_path, encoding="utf-8") as annotations_file:
        annotations_json = json.load(annotations_file)

    return AnnotationStore.from_json(annotations_json)


def _read_api_file(api_file_path: Path) -> API:
    with open(api_file_path, encoding="utf-8") as api_file:
        api_json = json.load(api_file)

    return API.from_json(api_json)
