import json
from pathlib import Path

from package_parser.cli._json_encoder import CustomEncoder
from package_parser.processing.annotations.model import AnnotationStore
from package_parser.processing.api.model import API
from package_parser.processing.usages.model import UsageCountStore
from package_parser.utils import ensure_file_exists


def _read_annotations_file(annotations_file_path: Path) -> AnnotationStore:
    with open(annotations_file_path, encoding="utf-8") as annotations_file:
        annotations_json = json.load(annotations_file)

    return AnnotationStore.from_json(annotations_json)


def _write_annotations_file(
    annotations: AnnotationStore, annotations_file_path: Path
) -> None:
    ensure_file_exists(annotations_file_path)
    with annotations_file_path.open("w", encoding="utf-8") as f:
        json.dump(annotations.to_json(), f, indent=2)


def _read_api_file(api_file_path: Path) -> API:
    with open(api_file_path, encoding="utf-8") as api_file:
        api_json = json.load(api_file)

    return API.from_json(api_json)


def _read_usages_file(usages_file_path: Path) -> UsageCountStore:
    with open(usages_file_path, encoding="utf-8") as usages_file:
        usages_json = json.load(usages_file)

    return UsageCountStore.from_json(usages_json)


def _write_api_file(api: API, out_dir_path: Path) -> Path:
    out_file_api = out_dir_path.joinpath(f"{api.package}__api.json")
    ensure_file_exists(out_file_api)
    with out_file_api.open("w", encoding="utf-8") as f:
        json.dump(api.to_json(), f, indent=2, cls=CustomEncoder)
    return out_file_api


def _write_api_dependency_file(api: API, api_dependencies, out):
    out_file_api_dependencies = out.joinpath(f"{api.package}__api_dependencies.json")
    ensure_file_exists(out_file_api_dependencies)
    with out_file_api_dependencies.open("w") as f:
        json.dump(api_dependencies.to_json(), f, indent=2, cls=CustomEncoder)
