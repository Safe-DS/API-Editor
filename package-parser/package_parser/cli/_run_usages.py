import json
from pathlib import Path
from typing import Optional

from package_parser.cli._shared_constants import _USAGES_KEY
from package_parser.commands.api import distribution, distribution_version
from package_parser.commands.usages import find_usages
from package_parser.utils import ensure_file_exists


def _run_usages_command(
    package: str, client: Path, tmp: Path, out: Path, result_dict: Optional[dict] = None
) -> None:
    usages = find_usages(package, client, tmp)
    dist = distribution(package)

    counted_usages = usages.to_json()
    out_file_usage_count = out.joinpath(
        f"{dist}__{package}__{distribution_version(dist)}__usages_counted.json"
    )
    ensure_file_exists(out_file_usage_count)
    with out_file_usage_count.open("w") as f:
        json.dump(counted_usages, f, indent=2)

    if result_dict is not None:
        result_dict[_USAGES_KEY] = out_file_usage_count
