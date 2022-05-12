<img src="img/logo_with_text.svg" alt="logo" height="75">

[![Main](https://github.com/lars-reimann/api-editor/actions/workflows/main.yml/badge.svg)](https://github.com/lars-reimann/api-editor/actions/workflows/main.yml)

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
    ./gradlew run
    ```
2. Run the development server (keep the backend server running):
    ```shell
    cd backend
    npm run dev
    ```
3. Open [localhost:3000](http://localhost:3000) in your browser.
