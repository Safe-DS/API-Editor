<img src="img/logo_with_text.svg" alt="logo" height="75">

[![Main](https://github.com/lars-reimann/api-editor/actions/workflows/main.yml/badge.svg)](https://github.com/lars-reimann/api-editor/actions/workflows/main.yml)

The `api-editor` is a tool to improve the API of a Python library in a semi-automated manner. Several improvements are suggested automatically and the user can add further improvements manually in a user-friendly GUI. These improvements are implemented automatically by the tool as [_wrappers_][adapter-pattern] that provide the desired API while internally using the existing Python library. Moreover, stubs for the [_Safe-DS_][safe-ds] DSL can be created automatically, as well. This allows users to call the created wrappers in a type-safe manner from that DSL.

The automation described above relies on structured information about the existing Python library. This information can be computed automatically by the [package-parser][package-parser].

## For Users

1. Install [OpenJDK 17](https://adoptium.net/).
2. Download the file `api-editor-<version>.jar` from the [latest release](https://github.com/lars-reimann/api-editor/releases/latest) (listed under "Assets").
3. Run the program:
    ```shell
    java -jar api-editor-<version>.jar
    ```

## For Developers

### Installation

1. Install [OpenJDK 17](https://adoptium.net/).
2. Install [Node.js 16.x](https://nodejs.org/en/).
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
3. Open [localhost:3000](http://localhost:3000) in your browser.

[package-parser]: ./package-parser

[safe-ds]: https://github.com/lars-reimann/safe-data-science
[adapter-pattern]: https://en.wikipedia.org/wiki/Adapter_pattern
