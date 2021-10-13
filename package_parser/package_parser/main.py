import time

from .cli import cli


def main() -> None:
    start_time = time.time()

    cli()

    print("\n====================================================================================================")
    print(f"Program ran in {time.time() - start_time}s")
