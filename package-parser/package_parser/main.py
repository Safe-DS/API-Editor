import time

from package_parser.cli import cli


def main() -> None:
    start_time = time.time()

    cli()

    with open("output.txt", "a") as f:
        print("\n============================================================", file=f)
        print(f"Program ran in {time.time() - start_time}s", file=f)
    print("\n============================================================")
    print(f"Program ran in {time.time() - start_time}s")
