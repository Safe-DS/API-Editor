import reactRefresh from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [reactRefresh()],
    server: {
        proxy: {
            '/api-editor': {
                target: 'http://127.0.0.1:4280',
                changeOrigin: true,
            },
        },
    },
});
