import json
from pathlib import Path

from package_parser.processing.annotations.model import AnnotationStore
from package_parser.processing.api.model import API
from package_parser.processing.migration import (
    APIMapping,
    SimpleDiffer,
    migrate_annotations,
)
from package_parser.utils import ensure_file_exists


def _run_migrate_command(
    apiv1_file_path: Path,
    annotations_file_path: Path,
    apiv2_file_path: Path,
    out_dir_path: Path,
) -> None:
    # pylint: disable=unused-argument
    apiv1 = _read_api_file(apiv1_file_path)
    apiv2 = _read_api_file(apiv2_file_path)
    annotationsv1 = _read_annotations_file(annotations_file_path)
    differ = SimpleDiffer()
    api_mapping = APIMapping(apiv1, apiv2, differ)
    mappings = api_mapping.map_api()
    annotationsv2 = migrate_annotations(annotationsv1, mappings)
    _write_annotations_file(annotationsv2, out_dir_path)


def _read_annotations_file(annotations_file_path: Path) -> AnnotationStore:
    with open(annotations_file_path, encoding="utf-8") as annotations_file:
        annotations_json = json.load(annotations_file)

    return AnnotationStore.from_json(annotations_json)


def _write_annotations_file(
    annotations: AnnotationStore, annotations_file_path: Path
) -> None:
    ensure_file_exists(annotations_file_path)
    with annotations_file_path.open("w") as f:
        json.dump(annotations.to_json(), f, indent=2)


def _read_api_file(api_file_path: Path) -> API:
    with open(api_file_path, encoding="utf-8") as api_file:
        api_json = json.load(api_file)

    return API.from_json(api_json)
