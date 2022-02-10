<img src="img/logo_with_text.svg" alt="logo" height="75">

[![Main](https://github.com/lars-reimann/api-editor/actions/workflows/main.yml/badge.svg)](https://github.com/lars-reimann/api-editor/actions/workflows/main.yml)

## For users

1. Install [OpenJDK 11](https://adoptopenjdk.net/).
2. Grab the [latest release](https://github.com/lars-reimann/api-editor/releases).
3. Run the Jar:
    ```shell
    java -jar path/to/jar
    ```
4. Open [localhost:4280](http://localhost:4280) in your browser.

## For developers

### Installation

1. Install [OpenJDK 11](https://adoptopenjdk.net/).
2. Install [Node.js 16.x](https://nodejs.org/en/).
3. Install linter & formatter:
    ```shell
    npm install
    ```
4. Build everything:
    ```shell
    ./gradlew build
    ```

### During development

1. Run the backend server:
    ```shell
    ./gradlew run --continuous
    ```
2. Run the development server (keep the backend server running):
    ```shell
    cd client
    npm run dev
    ```
3. Open [localhost:3000](http://localhost:3000) in your browser.
