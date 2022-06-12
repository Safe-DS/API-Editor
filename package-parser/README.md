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
   parse-package annotations -a out/scikit-learn__sklearn__1.0__api.json -u out/scikit-learn__sklearn__1.0__usages.json -o out/annotations.json
   ```
