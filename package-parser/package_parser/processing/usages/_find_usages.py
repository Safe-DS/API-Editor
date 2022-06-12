import logging
from pathlib import Path
from typing import Optional

import astroid

from package_parser.utils import ASTWalker, list_files
from ._ast_visitor import _UsageFinder
from ...model.usages import UsageCountStore


def find_usages(package_name: str, src_dir: Path) -> UsageCountStore:
    python_files = list_files(src_dir, ".py")

    aggregated_counts = UsageCountStore()
    for python_file in python_files:
        counts_in_file = __find_usages_in_single_file(package_name, python_file)
        if counts_in_file is not None:
            aggregated_counts.merge_other_into_self(counts_in_file)

    return aggregated_counts


def __find_usages_in_single_file(
    package_name: str,
    python_file: str
) -> Optional[UsageCountStore]:
    logging.info(f"Working on {python_file}")

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

    return None


def __is_relevant_python_file(package_name: str, source_code: str) -> bool:
    return package_name in source_code
