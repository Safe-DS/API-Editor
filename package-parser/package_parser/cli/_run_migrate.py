from pathlib import Path

from package_parser.processing.migration import migrate_annotations
from package_parser.processing.migration.model import APIMapping, SimpleDiffer

from ._read_and_write_file import (
    _read_annotations_file,
    _read_api_file,
    _write_annotations_file,
)


def _run_migrate_command(
    apiv1_file_path: Path,
    annotations_file_path: Path,
    apiv2_file_path: Path,
    out_dir_path: Path,
) -> None:
    apiv1 = _read_api_file(apiv1_file_path)
    apiv2 = _read_api_file(apiv2_file_path)
    annotationsv1 = _read_annotations_file(annotations_file_path)
    differ = SimpleDiffer()
    api_mapping = APIMapping(apiv1, apiv2, differ)
    mappings = api_mapping.map_api()
    annotationsv2 = migrate_annotations(annotationsv1, mappings)
    _write_annotations_file(annotationsv2, out_dir_path)
