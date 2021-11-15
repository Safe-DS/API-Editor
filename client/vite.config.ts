// @ts-ignore
import path from 'path';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [reactRefresh()],
    optimizeDeps: {
        include: ['shared-model'],
    },
    server: {
        proxy: {
            '/api-editor': {
                target: 'http://127.0.0.1:4280',
                changeOrigin: true,
            },
        },
    },
});
