# api-editor

[![Master](https://github.com/lars-reimann/api-editor/actions/workflows/master.yml/badge.svg?branch=master)](https://github.com/lars-reimann/api-editor/actions/workflows/master.yml)

This project on Github Pages: https://lars-reimann.github.io/api-editor/

## Installation for Developers

### Option 1: VS Code Devcontainer

1. Install [Docker](https://docs.docker.com/get-docker/).
1. Install [VS Code](https://code.visualstudio.com/).
1. Install
   the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) VS
   Code Extension.
1. Clone this repository.
1. Open the repository in VS Code.
1. Press F1 and type "Remote-Containers: Reopen in Container".

### Option 1a: VS Code Devcontainer (advanced)

Note: This solution requires that Git itself can clone this private repository from GitHub. **If you
only used GUIs for Git before it's likely this solution will not work right away.** You need to
either [configure SSH](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh), use a
credentials manager like the [Git Credentials Manager](https://github.com/microsoft/Git-Credential-Manager-Core) or
revert to _Option 1_.

1. Install [Docker](https://docs.docker.com/get-docker/).
2. Install [VS Code](https://code.visualstudio.com/).
3. Install
   the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) VS
   Code Extension.
4. Open VS Code.
5. Press F1 and type "Remote-Containers: Remote-Containers: Clone Repository in Container Volume...".
6. Select "GitHub".
7. Type "lars-reimann/api-editor".

### Option 2: Custom Installation

1. Install the latest version of Node.js from https://nodejs.org/en/.
2. Install [pnpm](https://pnpm.io/):
   ```shell
   npm i -g pnpm
   ```
3. Install the dependencies of the client (starting from the root of the repository):
   ```shell
   cd client
   pnpm install
   ```
4. Setup Git hooks (still within the client directory):
   ```shell
   pnpm run prepare
   ```

## Starting the Development Server

1. Run the following command (starting from the root of the repository):
   ```shell
   cd client
   pnpm run dev
   ```
