import reactRefresh from '@vitejs/plugin-react-refresh'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [reactRefresh()],
    resolve: {
        alias: {
            'mdast-util-to-hast': 'mdast-util-to-hast-backport',
        },
    },
    server: {
        proxy: {
            '/api': 'http://localhost:4280',
        },
    },
})
