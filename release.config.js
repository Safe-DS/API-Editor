module.exports = {
    branches: ['main'],
    plugins: [
        ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
        ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
        [
            '@semantic-release/github',
            {
                assets: [
                    {
                        path: 'api-editor/backend/build/libs/*-all.jar',
                        name: 'api-editor-${nextRelease.gitTag}.jar',
                        label: 'API-Editor (${nextRelease.gitTag})',
                    },
                ],
            },
        ],
    ],
};
