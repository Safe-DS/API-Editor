import argparse
import json
import multiprocessing
from argparse import _SubParsersAction
from functools import partial
from pathlib import Path
from typing import Any, Optional

from .commands.find_usages import find_usages
from .commands.generate_annotations.generate_annotations import generate_annotations
from .commands.get_api import distribution, distribution_version, get_api
from .commands.get_dependencies import get_dependencies
from .utils import ensure_file_exists

API_INDEX = "api"
USAGES_INDEX = "usages"

__API_COMMAND = "api"
__USAGES_COMMAND = "usages"
__IMPROVE_COMMAND = "improve"
__ANNOTATIONS_COMMAND = "annotations"
__ALL_COMMAND = "all"


class CustomEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o, set):
            return list(o)
        return super().default(o)


def cli() -> None:
    args = __get_args()
    if args.command == __API_COMMAND:
        __run_api_command(args.package, args.src, args.out)

    elif args.command == __USAGES_COMMAND:
        __run_usages_command(args.package, args.client, args.tmp, args.out)

    elif args.command == __ANNOTATIONS_COMMAND:
        generate_annotations(args.api, args.usages, args.out)

    elif args.command == __ALL_COMMAND:
        out = args.out
        tmp = args.out.joinpath("tmp")
        out_file_annotations = args.out.joinpath("annotations.json")

        results = __run_in_parallel(
            partial(__run_api_command, args.package, args.src, out),
            partial(__run_usages_command, args.package, args.client, tmp, out),
        )

        generate_annotations(
            results[API_INDEX], results[USAGES_INDEX], out_file_annotations
        )


def __run_in_parallel(*fns) -> dict:
    manager = multiprocessing.Manager()
    return_dict: dict[Any, Any] = manager.dict()
    proc = []
    for fn in fns:
        p = multiprocessing.Process(target=fn, args=(return_dict,))
        proc.append(p)
        p.start()

    for p in proc:
        p.join()

    return return_dict


def __run_usages_command(
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
        result_dict[USAGES_INDEX] = out_file_usage_count


def __run_api_command(
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
        result_dict[API_INDEX] = out_file_api


def __get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Analyze Python code.")

    # Commands
    subparsers = parser.add_subparsers(dest="command")
    __add_api_subparser(subparsers)
    __add_usages_subparser(subparsers)
    __add_annotations_subparser(subparsers)
    __add_all_subparser(subparsers)

    return parser.parse_args()


def __add_api_subparser(subparsers: _SubParsersAction) -> None:
    api_parser = subparsers.add_parser(__API_COMMAND, help="List the API of a package.")
    api_parser.add_argument(
        "-p",
        "--package",
        help="The name of the package.",
        type=str,
        required=True,
    )
    api_parser.add_argument(
        "-s",
        "--src",
        help="Directory containing the Python code of the package. If this is omitted, we try to locate the package "
        "with the given name in the current Python interpreter.",
        type=Path,
        required=False,
        default=None,
    )
    api_parser.add_argument(
        "-o", "--out", help="Output directory.", type=Path, required=True
    )


def __add_usages_subparser(subparsers: _SubParsersAction) -> None:
    usages_parser = subparsers.add_parser(
        __USAGES_COMMAND, help="Find usages of API elements."
    )
    usages_parser.add_argument(
        "-p",
        "--package",
        help="The name of the package. It must be installed in the current interpreter.",
        type=str,
        required=True,
    )
    usages_parser.add_argument(
        "-c",
        "--client",
        help="Directory containing Python code that uses the package.",
        type=Path,
        required=True,
    )
    usages_parser.add_argument(
        "-t",
        "--tmp",
        help="Directory where temporary files can be stored (to save progress in case the program crashes).",
        type=Path,
        required=True,
    )
    usages_parser.add_argument(
        "-o", "--out", help="Output directory.", type=Path, required=True
    )


def __add_annotations_subparser(subparsers):
    generate_parser = subparsers.add_parser(
        __ANNOTATIONS_COMMAND, help="Generate Annotations automatically."
    )
    generate_parser.add_argument(
        "-a",
        "--api",
        help="File created by the 'api' command.",
        type=Path,
        required=True,
    )
    generate_parser.add_argument(
        "-u",
        "--usages",
        help="File created by the 'usages' command that contains usage counts.",
        type=Path,
        required=True,
    )
    generate_parser.add_argument(
        "-o", "--out", help="Output directory.", type=Path, required=True
    )


def __add_all_subparser(subparsers: _SubParsersAction) -> None:
    all_parser = subparsers.add_parser(
        __ALL_COMMAND,
        help="Run api and usages command in parallel and then run annotations command.",
    )
    all_parser.add_argument(
        "-p",
        "--package",
        help="The name of the package.",
        type=str,
        required=True,
    )
    all_parser.add_argument(
        "-s",
        "--src",
        help="Directory containing the Python code of the package. If this is omitted, we try to locate the package "
        "with the given name in the current Python interpreter.",
        type=Path,
        required=False,
        default=None,
    )
    all_parser.add_argument(
        "-c",
        "--client",
        help="Directory containing Python code that uses the package.",
        type=Path,
        required=True,
    )
    all_parser.add_argument(
        "-o", "--out", help="Output directory.", type=Path, required=True
    )
