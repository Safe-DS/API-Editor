# API-Editor

**Project status:** The development of a proof-of-concept implementation is done. We are currently focussing our attention on other projects.

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/safe-ds/api-editor)](https://github.com/lars-reimann/api-editor/releases/latest)
[![Main](https://github.com/lars-reimann/api-editor/actions/workflows/main.yml/badge.svg)](https://github.com/lars-reimann/api-editor/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/Safe-DS/API-Editor/branch/main/graph/badge.svg?token=xGW2Qs4zXS)](https://codecov.io/gh/Safe-DS/API-Editor)
[![Documentation Status](https://readthedocs.org/projects/api-editor/badge/?version=stable)](https://api-editor.safeds.com)
[![DOI](https://zenodo.org/badge/365253624.svg)](https://zenodo.org/badge/latestdoi/365253624)

The `api-editor` is a tool to improve the API of a Python library in a semi-automated manner. Several improvements are suggested automatically and the user can add further improvements manually in a user-friendly GUI. These improvements are implemented automatically by the tool as [_wrappers_][adapter-pattern] that provide the desired API while internally using the existing Python library.

The automation described above relies on structured information about the existing Python library. This information can be computed automatically by the [library-analyzer][library-analyzer].

You can find the full documentation [here](https://api-editor.safeds.com).

## For Users

1. Install [OpenJDK 17](https://adoptium.net/).
2. Download the file `API-Editor (<version>)` from the [latest release](https://github.com/lars-reimann/api-editor/releases/latest) (listed under "Assets").
3. Run the program:
    ```shell
    java -jar api-editor-<version>.jar
    ```
4. Open [localhost:4280](http://localhost:4280) in your browser.
5. In the window that opens, enter your username in the bottom right field.
6. Download the contents of the [`data`][data] folder of this project. Alternatively, compute the required data for another Python API using the [library-analyzer][library-analyzer].
7. Open `File > Import > API Data` and upload the API data that you stored locally.
8. Open `File > Import > Usages` and upload the usage data that you stored locally.
9. Open `File > Import > Annotations` and upload the annotation data that you stored locally (from the repository or your own prior usages of the tool).

Now you are ready to explore the API and review existing annotations.

## For Developers

### Installation

1. Install [OpenJDK 17](https://adoptium.net/).
2. Install [Node.js 18.x](https://nodejs.org/en/).
3. Build everything:
    ```shell
    ./gradlew build
    ```

### During development

1. Run the backend server:
    ```shell
    ./gradlew :backend:run
    ```
2. Run the development server (keep the backend server running):
    ```shell
    cd gui
    npm run dev
    ```
3. Open [localhost:5173](http://localhost:5173) in your browser.

## Contributing

We welcome contributions from everyone. As a starting point, check the following resources:

* [Contributing page](https://github.com/Safe-DS/API-Editor/contribute)

If you need further help, please [use our discussion forum][forum].

[adapter-pattern]: https://en.wikipedia.org/wiki/Adapter_pattern
[library-analyzer]: https://github.com/Safe-DS/Library-Analyzer
[data]: https://github.com/Safe-DS/API-Editor/tree/main/data
[forum]: https://github.com/orgs/Safe-DS/discussions
