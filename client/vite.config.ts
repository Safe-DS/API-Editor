import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [reactRefresh()],

    // Necessary since shared-model use CommonJS instead of ES6 modules
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
