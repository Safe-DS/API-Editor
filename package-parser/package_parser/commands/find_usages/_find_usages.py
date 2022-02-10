import json
import multiprocessing
from multiprocessing import synchronize
from pathlib import Path
from typing import Optional

import astroid
from package_parser.utils import ASTWalker, initialize_and_read_exclude_file, list_files

from ._ast_visitor import _UsageFinder
from ._model import UsageStore

__N_PROCESSES = 12


def find_usages(package_name: str, src_dir: Path, tmp_dir: Path):
    candidate_python_files = list_files(src_dir, ".py")

    exclude_file = tmp_dir.joinpath("$$$$$exclude$$$$$.txt")
    excluded_python_files = set(initialize_and_read_exclude_file(exclude_file))

    python_files = [
        it for it in candidate_python_files if it not in excluded_python_files
    ]

    tmp_dir.mkdir(parents=True, exist_ok=True)

    lock = multiprocessing.Lock()
    with multiprocessing.Pool(
        processes=__N_PROCESSES,
        initializer=__initialize_process_environment,
        initargs=(lock,),
    ) as pool:
        pool.starmap(
            __find_usages_in_single_file,
            [[package_name, it, exclude_file, tmp_dir] for it in python_files],
        )
    pool.join()
    pool.close()

    return _merge_results(tmp_dir)


_lock: synchronize.Lock = multiprocessing.Lock()


def __initialize_process_environment(lock: synchronize.Lock):
    global _lock
    _lock = lock


def __find_usages_in_single_file(
    package_name: str,
    python_file: str,
    exclude_file: Path,
    tmp_dir: Path,
):
    print(f"Working on {python_file}")

    try:
        with open(python_file, "r") as f:
            source = f.read()

        if __is_relevant_python_file(package_name, source):
            usage_finder = _UsageFinder(package_name, python_file)
            ASTWalker(usage_finder).walk(astroid.parse(source))

            tmp_file = tmp_dir.joinpath(
                python_file.replace("/", "__")
                .replace("\\", "__")
                .replace(".py", ".json")
            )
            with tmp_file.open("w") as f:
                json.dump(usage_finder.usages.to_json(), f, indent=2)
        else:
            print(f"Skipping {python_file} (irrelevant file)")

    except UnicodeError:
        print(f"Skipping {python_file} (broken encoding)")
    except astroid.exceptions.AstroidSyntaxError:
        print(f"Skipping {python_file} (invalid syntax)")
    except RecursionError:
        print(f"Skipping {python_file} (infinite recursion)")

    with _lock:
        with exclude_file.open("a") as f:
            f.write(f"{python_file}\n")


def __is_relevant_python_file(package_name: str, source_code: str) -> bool:
    return package_name in source_code


def _merge_results(tmp_dir: Path) -> UsageStore:
    result = UsageStore()

    files = list_files(tmp_dir, ".json")
    for index, file in enumerate(files):
        print(f"Merging {file} ({index + 1}/{len(files)})")

        with open(file, "r") as f:
            other_usage_store = UsageStore.from_json(json.load(f))
            result.merge_other_into_self(other_usage_store)

    return result
