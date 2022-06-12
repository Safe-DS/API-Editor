import logging
from multiprocessing import Pool
from pathlib import Path
from typing import TypeVar

import astroid

from package_parser.utils import ASTWalker, list_files
from ._ast_visitor import _UsageFinder
from ...model.usages import UsageCountStore


def find_usages(package_name: str, src_dir: Path, n_processes: int) -> UsageCountStore:
    python_files = list_files(src_dir, ".py")
    python_file_batches = _split_into_batches(python_files, 10)

    aggregated_counts = UsageCountStore()

    with Pool(processes=n_processes) as pool:
        for counts_in_file in pool.starmap(
            _find_usages_in_batch,
            [[package_name, it] for it in python_file_batches]
        ):
            aggregated_counts.merge_other_into_self(counts_in_file)
    pool.join()
    pool.close()

    return aggregated_counts


T = TypeVar('T')


def _split_into_batches(
    list_: list[T],
    batch_size: int
) -> list[list[T]]:
    """
    Splits a list into batches of size batch_size.
    """

    batches = []
    batch = []

    for python_file in list_:
        batch.append(python_file)
        if len(batch) >= batch_size:
            batches.append(batch)
            batch = []

    if len(batch) > 0:
        batches.append(batch)

    return batches


def _find_usages_in_batch(
    package_name: str,
    python_files: list[str]
) -> UsageCountStore:
    usage_finder = _UsageFinder(package_name)
    ast_walker = ASTWalker(usage_finder)

    for python_file in python_files:
        _find_usages_in_single_file(package_name, python_file, ast_walker)

    astroid.MANAGER.clear_cache()
    return usage_finder.usages


def _find_usages_in_single_file(
    package_name: str,
    python_file: str,
    ast_walker: ASTWalker,
) -> None:
    logging.info(f"Working on {python_file}")

    # noinspection PyBroadException
    try:
        with open(python_file, "r", encoding="UTF-8") as f:
            source = f.read()

        if __is_relevant_python_file(package_name, source):
            ast_walker.walk(astroid.parse(source))
        else:
            logging.info(f"Skipping {python_file} (irrelevant file)")

    except UnicodeError:
        logging.warning(f"Skipping {python_file} (broken encoding)")
    except astroid.exceptions.AstroidSyntaxError:
        logging.warning(f"Skipping {python_file} (invalid syntax)")
    except RecursionError:
        logging.warning(f"Skipping {python_file} (infinite recursion)")
    except Exception as e:
        logging.error(f"Skipping {python_file} (unknown error: {e})")


def __is_relevant_python_file(package_name: str, source_code: str) -> bool:
    return package_name in source_code
