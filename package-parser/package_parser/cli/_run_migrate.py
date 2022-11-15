import json
from pathlib import Path

from package_parser.processing.api.model import API


def _run_migrate_command(
    apiv1_file_path: Path,
    annotations_file_path: Path,
    apiv2_file_path: Path,
    out_dir_path: Path,
) -> None:
    pass


def _read_api_file(api_file_path: Path) -> API:
    with open(api_file_path) as api_file:
        api_json = json.load(api_file)

    return API.from_json(api_json)
