# package-parser

A tool to analyze client and API code written in Python.

## Usage

```text
usage: parse-package [-h] {api,usages,improve,annotations,all} ...

Analyze Python code.

positional arguments:
  {api,usages,improve,annotations,all}
    api                 List the API of a package.
    usages              Find usages of API elements.
    improve             Suggest how to improve an existing API.
    annotations         Generate Annotations automatically.
    all                 Run api and usages command in parallel and then run annotations command.

optional arguments:
  -h, --help            show this help message and exit
```

### api command

```text
usage: parse-package api [-h] -p PACKAGE [-s SRC] -o OUT

optional arguments:
  -h, --help            show this help message and exit
  -p PACKAGE, --package PACKAGE
                        The name of the package.
  -s SRC, --src SRC     Directory containing the Python code of the package. If this is omitted, we try to locate the package with the given name in the current Python interpreter.
  -o OUT, --out OUT     Output directory.
```

### usages command

```text
usage: parse-package usages [-h] -p PACKAGE -c CLIENT -t TMP -o OUT

optional arguments:
  -h, --help            show this help message and exit
  -p PACKAGE, --package PACKAGE
                        The name of the package. It must be installed in the current interpreter.
  -c CLIENT, --client CLIENT
                        Directory containing Python code that uses the package.
  -t TMP, --tmp TMP     Directory where temporary files can be stored (to save progress in case the program crashes).
  -o OUT, --out OUT     Output directory.
```

### annotations command

```text
usage: parse-package annotations [-h] -a API -u USAGES -o OUT

optional arguments:
  -h, --help            show this help message and exit
  -a API, --api API     File created by the 'api' command.
  -u USAGES, --usages USAGES
                        File created by the 'usages' command that contains usage counts.
  -o OUT, --out OUT     Output directory.
```

### all command

```text
usage: parse-package all [-h] -p PACKAGE [-s SRC] -c CLIENT -o OUT

optional arguments:
  -h, --help            show this help message and exit
  -p PACKAGE, --package PACKAGE
                        The name of the package.
  -s SRC, --src SRC     Directory containing the Python code of the package. If this is omitted, we try to locate the package with the given name in the current Python interpreter.
  -c CLIENT, --client CLIENT
                        Directory containing Python code that uses the package.
  -o OUT, --out OUT     Output directory.
```

### Example usage

1. Install Python 3.9.
1. Install [poetry](https://python-poetry.org/docs/master/#installation).
1. **Only the first time**, install dependencies:
    ```shell
    poetry install
    ```
1. Create a shell with poetry:
    ```shell
    poetry shell
    ```
1. Run the commands described above:
    ```shell
    # Step 1:
    parse-package api -p sklearn -o out

    # Step 2:
    parse-package usages -p sklearn -s "Kaggle Kernels" -t tmp -o out

    # Step 3:
    parse-package annotations -a "out/scikit-learn__sklearn__1.0__api.json" -u "out/scikit-learn__sklearn__1.0__usages.json" -o out/annotations.json
    ```
