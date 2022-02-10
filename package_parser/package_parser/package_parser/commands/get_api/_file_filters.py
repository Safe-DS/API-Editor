def _is_init_file(path: str) -> bool:
    return path.endswith("__init__.py")


def _is_test_file(posix_path: str) -> bool:
    return "/test/" in posix_path or "/tests/" in posix_path
