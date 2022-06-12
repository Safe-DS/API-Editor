import logging
from multiprocessing import Pool
from pathlib import Path
from typing import Optional

import astroid

from package_parser.utils import ASTWalker, list_files
from ._ast_visitor import _UsageFinder
from ...model.usages import UsageCountStore


def find_usages(package_name: str, src_dir: Path, n_processes: int) -> UsageCountStore:
    python_files = list_files(src_dir, ".py")
    aggregated_counts = UsageCountStore()

    with Pool(processes=n_processes) as pool:
        for counts_in_file in pool.starmap(
            __find_usages_in_single_file,
            [[package_name, it] for it in python_files],
        ):
            if counts_in_file is not None:
                aggregated_counts.merge_other_into_self(counts_in_file)
    pool.join()
    pool.close()

    return aggregated_counts


def __find_usages_in_single_file(
    package_name: str,
    python_file: str
) -> Optional[UsageCountStore]:
    logging.info(f"Working on {python_file}")

    # noinspection PyBroadException
    try:
        with open(python_file, "r") as f:
            source = f.read()

        if __is_relevant_python_file(package_name, source):
            usage_finder = _UsageFinder(package_name, python_file)
            ASTWalker(usage_finder).walk(astroid.parse(source))

            return usage_finder.usages
        else:
            logging.info(f"Skipping {python_file} (irrelevant file)")

    except UnicodeError:
        logging.warning(f"Skipping {python_file} (broken encoding)")
    except astroid.exceptions.AstroidSyntaxError:
        logging.warning(f"Skipping {python_file} (invalid syntax)")
    except RecursionError:
        logging.warning(f"Skipping {python_file} (infinite recursion)")
    except Exception:
        logging.error(f"Skipping {python_file} (unknown error)")

    return None


def __is_relevant_python_file(package_name: str, source_code: str) -> bool:
    return package_name in source_code
