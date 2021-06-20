module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
    ],
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    rules: {
        "eol-last": [
            "warn",
            "always"
        ],
        "no-extra-semi": "warn",
        "semi": [
            "warn",
            "always"
        ],
        "@typescript-eslint/no-this-alias": [
            "error",
            {
                "allowedNames": ["current"]
            }
        ]
    },
    // See https://github.com/yannickcr/eslint-plugin-react#configuration
    "settings": {
        "react": {
            "version": "detect"
        },
        "propWrapperFunctions": [],
        "componentWrapperFunctions": [],
        "linkComponents": []
    }
};
