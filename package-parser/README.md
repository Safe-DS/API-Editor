# package-parser

A tool to analyze client and API code written in Python.

## Usage

```text
usage: parse-package [-h] {api,usages,improve} ...

Analyze Python code.

positional arguments:
  {api,usages,improve}
    api                 List the API of a package.
    usages              Find usages of API elements.
    improve             Suggest how to improve an existing API.

optional arguments:
  -h, --help            show this help message and exit
```

### api command

```text
usage: parse-package api [-h] -p PACKAGE -o OUT

optional arguments:
  -h, --help            show this help message and exit
  -p PACKAGE, --package PACKAGE
                        The name of the package. It must be installed in the current interpreter.
  -o OUT, --out OUT     Output directory.
```

### usages command

```text
usage: parse-package usages [-h] -p PACKAGE -c CLIENT -t TMP -o OUT

options:
  -h, --help            show this help message and exit
  -p PACKAGE, --package PACKAGE
                        The name of the package. It must be installed in the current interpreter.
  -c CLIENT, --client CLIENT
                        Directory containing Python code that uses the package.
  -t TMP, --tmp TMP     Directory where temporary files can be stored (to save progress in case the program crashes).
  -o OUT, --out OUT     Output directory.

```

### improve command

```text
usage: parse-package improve [-h] -a API -u USAGES -o OUT [-m MIN]

optional arguments:
  -h, --help            show this help message and exit
  -a API, --api API     File created by the 'api' command.
  -u USAGES, --usages USAGES
                        File created by the 'usages' command.
  -o OUT, --out OUT     Output directory.
  -m MIN, --min MIN     Minimum number of usages required to keep an API element.
```

### annotations command

```text
usage: parse-package annotations [-h] -a API -u USAGES -o OUT

options:
  -h, --help            show this help message and exit
  -a API, --api API     File created by the 'api' command.
  -u USAGES, --usages USAGES
                        File created by the 'usages' command that contains usage counts.
  -o OUT, --out OUT     Output directory.

```

### all command

```text
usage: parse-package all [-h] -p PACKAGE -c CLIENT -o OUT

options:
  -h, --help            show this help message and exit
  -p PACKAGE, --package PACKAGE
                        The name of the package. It must be installed in the current interpreter.
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
    parse-package improve -a "out/scikit-learn__sklearn__1.0__api.json" -u "out/scikit-learn__sklearn__1.0__usages.json" -o out
    ```
