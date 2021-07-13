## Pull Requests

### Title

The title must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) convention.

All **types** from [Commitizen](https://github.com/commitizen/conventional-commit-types/blob/master/index.json) are allowed. Pick the one that fits best:
| Type | Meaning |
|------|---------|
| `feat` | A new feature. |
| `fix` | A bug fix. |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc). |
| `refactor` | A code change that neither fixes a bug nor adds a feature. |
| `perf` | A code change that improves performance. |
| `test` | Adding missing tests or correcting existing tests |
| `build` | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm). |
| `ci` | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs). |
| `chore` | Other changes that don't modify src or test files. |
| `revert` | Reverts a previous commit. |

Possible **scopes** are:

| Scope | Meaning |
|------|---------|
| `devcontainer` | [VS Code development container](https://code.visualstudio.com/docs/remote/containers). |
| `detailsView` | Details about the currently selected declaration |
| `dialog` | (Modal) dialogs |
| `menuBar` | Menu bar at the top |
| `treeView` | Visualization of the declarations in the current package as a tree |

### Description

Use the [provided template](./pull_request_template.md). It should be suggested automatically.
