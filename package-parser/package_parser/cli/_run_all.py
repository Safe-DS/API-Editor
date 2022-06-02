import multiprocessing
from functools import partial
from typing import Any

from package_parser.cli._run_annotations import _run_annotations
from package_parser.cli._run_api import _run_api_command
from package_parser.cli._run_usages import _run_usages_command
from package_parser.cli._shared_constants import _API_KEY, _USAGES_KEY


def _run_all_command(args):
    out = args.out
    tmp = args.out.joinpath("tmp")
    out_file_annotations = args.out.joinpath("annotations.json")
    results = _run_in_parallel(
        partial(_run_api_command, args.package, args.src, out),
        partial(_run_usages_command, args.package, args.client, tmp, out),
    )
    _run_annotations(results[_API_KEY], results[_USAGES_KEY], out_file_annotations)


def _run_in_parallel(*fns) -> dict:
    manager = multiprocessing.Manager()
    return_dict: dict[str, str] = manager.dict()
    proc = []
    for fn in fns:
        p = multiprocessing.Process(target=fn, args=(return_dict,))
        proc.append(p)
        p.start()

    for p in proc:
        p.join()

    return return_dict
