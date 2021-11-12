import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [reactRefresh()],
    server: {
        proxy: {
            '/api-editor': 'http://localhost:4280',
        },
    },
});
