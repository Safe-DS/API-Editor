# How to prepare a release

1. Bump the version of the backend and desktop app in [build.gradle.kts][main-build-gradle]:
    ```kts
    subprojects {
        // ...
        version = "1.0.0"
        // ...
    }
    ```

2. Bump the version of the GUI in [package.json][vscode-package-json]:
    ```json5
    {
        // ...
        "version": "1.0.0",
        // ...
    }
    ```
3. Run this command to also update the associated `package-lock.json` file:
    ```sh
    cd api-editor/gui
    npm i
    ```
4. Bump the version of the package parser in [pyproject.toml][parser-pyproject-toml]:
    ```toml
    [tool.poetry]
    # ...
    version = "1.0.0"
    # ...
    ```
6. Commit the changes in a new branch.
7. Create a pull request.
8. Merge the pull request into main.
9. Add a tag starting with "v" followed by the new version number to the commit on main.
10. Push the tag to main (`git push --tags`).

[main-build-gradle]: ../../api-editor/build.gradle.kts

[vscode-package-json]: ../../api-editor/gui/package.json

[parser-pyproject-toml]: ../../package-parser/pyproject.toml
