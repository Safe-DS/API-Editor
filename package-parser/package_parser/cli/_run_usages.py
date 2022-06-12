import json
from pathlib import Path
from typing import Optional

from package_parser.cli._shared_constants import _USAGES_KEY
from package_parser.processing.usages import find_usages
from package_parser.utils import ensure_file_exists


def _run_usages_command(
    package: str,
    client_dir_path: Path,
    out_dir_path: Path,
    n_processes: int,
    batch_size: int,
    result_dict: Optional[dict] = None,
) -> None:
    usages = find_usages(package, client_dir_path, n_processes, batch_size)

    out_file_usage_count = out_dir_path.joinpath(f"{package}__usage_counts.json")
    ensure_file_exists(out_file_usage_count)
    with out_file_usage_count.open("w") as f:
        json.dump(usages.to_json(), f, indent=2)

    if result_dict is not None:
        result_dict[_USAGES_KEY] = out_file_usage_count
