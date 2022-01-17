import argparse
import json
from argparse import _SubParsersAction
from pathlib import Path
from typing import Any

from .commands.get_api import get_api
from .commands.get_dependencies import get_dependencies
from .utils import ensure_file_exists

__API_COMMAND = "api"


class CustomEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o, set):
            return list(o)
        return super().default(o)


def cli() -> None:
    args = __get_args()

    if args.command == __API_COMMAND:
        public_api = get_api(args.package)
        get_dependencies(public_api)

        out_dir: Path = args.out
        out_file = out_dir.joinpath(
            f"{public_api.distribution}__{public_api.package}__{public_api.version}__api.json"
        )
        ensure_file_exists(out_file)
        with out_file.open("w") as f:
            json.dump(public_api.to_json(), f, indent=2, cls=CustomEncoder)


def __get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Analyze Python code.")

    # Commands
    subparsers = parser.add_subparsers(dest="command")
    __add_api_subparser(subparsers)

    return parser.parse_args()


def __add_api_subparser(subparsers: _SubParsersAction) -> None:
    api_parser = subparsers.add_parser(__API_COMMAND, help="List the API of a package.")
    api_parser.add_argument(
        "-p",
        "--package",
        help="The name of the package. It must be installed in the current interpreter.",
        type=str,
        required=True,
    )
    api_parser.add_argument(
        "-o", "--out", help="Output directory.", type=Path, required=True
    )
