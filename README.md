<img src="img/logo_with_text.svg" alt="logo" height="75">

[![Main](https://github.com/lars-reimann/api-editor/actions/workflows/main.yml/badge.svg)](https://github.com/lars-reimann/api-editor/actions/workflows/main.yml)

The `api-editor` is a tool to improve the API of a Python library in a semi-automated manner. Several improvements are suggested automatically and the user can add further improvements manually in a user-friendly GUI. These improvements are implemented automatically by the tool as [_wrappers_][adapter-pattern] that provide the desired API while internally using the existing Python library.

The automation described above relies on structured information about the existing Python library. This information can be computed automatically by the [package-parser][package-parser].

## For Users

1. Install [OpenJDK 17](https://adoptium.net/).
2. Download the file `API-Editor (<version>)` from the [latest release](https://github.com/lars-reimann/api-editor/releases/latest) (listed under "Assets").
3. Run the program:
    ```shell
    java -jar api-editor-<version>.jar
    ```
4. Open [localhost:4280](http://localhost:4280) in your browser.
5. In the window that opens, enter your username in the bottom right field. 
6. Download the contents of the [`data`](data) folder of this project. Alternatively, compute the required data for another Python API using the [package-parser][package-parser].
7. Open `File > Import > API Data` and upload the API data that you stored locally.
8. Open `File > Import > Usages` and upload the usage data that you stored locally.
9. Open `File > Import > Annotations` and upload the annotation data that you stored locally (from the repository or your own prior usages of the tool).

Now you are ready to explore the API and review existing annotations.  

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
3. Open [localhost:5173](http://localhost:5173) in your browser.

[package-parser]: ./package-parser

[safe-ds]: https://github.com/lars-reimann/safe-data-science
[adapter-pattern]: https://en.wikipedia.org/wiki/Adapter_pattern
