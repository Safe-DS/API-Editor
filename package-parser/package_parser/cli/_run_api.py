import json
from pathlib import Path
from typing import Optional

from package_parser.cli._json_encoder import CustomEncoder
from package_parser.cli._shared_constants import _API_KEY
from package_parser.commands.api import get_api
from package_parser.commands.dependencies import get_dependencies
from package_parser.utils import ensure_file_exists


def _run_api_command(
    package: str, src: Path, out: Path, result_dict: Optional[dict] = None
) -> None:
    public_api = get_api(package, src)
    public_api_dependencies = get_dependencies(public_api)
    out_file_api = out.joinpath(
        f"{public_api.distribution}__{public_api.package}__{public_api.version}__api.json"
    )
    out_file_api_dependencies = out.joinpath(
        f"{public_api.distribution}__{public_api.package}__{public_api.version}__api_dependencies.json"
    )
    ensure_file_exists(out_file_api)
    with out_file_api.open("w") as f:
        json.dump(public_api.to_json(), f, indent=2, cls=CustomEncoder)
    with out_file_api_dependencies.open("w") as f:
        json.dump(public_api_dependencies.to_json(), f, indent=2, cls=CustomEncoder)

    if result_dict is not None:
        result_dict[_API_KEY] = out_file_api
