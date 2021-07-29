# api-editor

[![Master](https://github.com/lars-reimann/api-editor/actions/workflows/master.yml/badge.svg?branch=master)](https://github.com/lars-reimann/api-editor/actions/workflows/master.yml)

This project on Github Pages: https://lars-reimann.github.io/api-editor/.

## Installation for Developers

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
