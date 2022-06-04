const path = require('path')

module.exports = {
    root: true,
    parserOptions: {
        tsconfigRootDir: path.join(__dirname, 'api-editor', 'gui'),
        project: 'tsconfig.eslint.json',
    },
    settings: {
        jest: {
            version: 27,
        },
    },
    extends: '@lars-reimann',
};
