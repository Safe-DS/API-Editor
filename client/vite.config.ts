import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/api-editor/',
    plugins: [reactRefresh()],
    resolve: {
        alias: {
            'mdast-util-to-hast': 'mdast-util-to-hast-backport',
        },
    },
})
