# package-parser

A tool to analyze client and API code written in Python.

### Installation

1. Install Python 3.10.
2. Install [poetry](https://python-poetry.org/docs/master/#installation).
3. **Only the first time**, install dependencies:
    ```shell
    poetry install
    ```
4. Create a shell with poetry:
    ```shell
    poetry shell
    ```

### Example usage

1. Analyze an API:
    ```shell
    # Step 1:
    parse-package api -p sklearn -o out
    ```
2. Analyze client code of this API:
    ```shell
    parse-package usages -p sklearn -s "Kaggle Kernels" -o out
    ```
3. Generate annotations for the API:
    ```shell
    parse-package annotations -a data/api/sklearn__api.json -u data/usages/sklearn__usage_counts.json -o out/annotations.json
    ```
4. Migrate annotations for a new version of the API:
    ```shell
    parse-package migrate -a1 data/api/sklearn__api.json -a2 data/api/sklearn__apiv2.json -a data/annotations/annotations.json -o out
    ```
