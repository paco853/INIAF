import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import os from 'node:os';
import { URL } from 'node:url';

const pickLanIp = () => {
    const interfaces = os.networkInterfaces();
    for (const infos of Object.values(interfaces)) {
        if (!infos) continue;
        for (const info of infos) {
            if (info && info.family === 'IPv4' && !info.internal) {
                return info.address;
            }
        }
    }
    return undefined;
};

const resolveDefaultHost = (env) => {
    if (env.VITE_DEV_HOST) return env.VITE_DEV_HOST;

    if (env.APP_URL) {
        try {
            const parsed = new URL(env.APP_URL);
            if (parsed.hostname) return parsed.hostname;
        } catch (_) {}
    }
    return '0.0.0.0';
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const defaultHost = resolveDefaultHost(env);
    const host = defaultHost || true;
    const port = Number(env.VITE_DEV_PORT || 5173);

    const publicHost =
        env.VITE_DEV_PUBLIC_HOST ||
        (['0.0.0.0', '127.0.0.1', 'localhost'].includes(defaultHost)
            ? pickLanIp()
            : defaultHost);

    const explicitHmrHost = env.VITE_DEV_HMR_HOST || publicHost || undefined;
    const hmrPort = Number(env.VITE_DEV_HMR_PORT || port);
    const useHttps = /^true$/i.test(env.VITE_DEV_HTTPS || '');

    return {
        server: {
            host,
            port,
            https: useHttps,
            hmr: {
                ...(explicitHmrHost ? { host: explicitHmrHost } : {}),
                protocol: useHttps ? 'wss' : 'ws',
                port: hmrPort,
            },
        },

        build: {
            chunkSizeWarningLimit: 1200,
            rollupOptions: {
                output: {
                    manualChunks: {
                        react: ['react', 'react-dom'],
                        inertia: ['@inertiajs/react', '@inertiajs/progress'],
                        mui: ['@mui/joy', '@emotion/react', '@emotion/styled'],
                    },
                },
            },
        },
        plugins: [
            laravel({
                input: [
                    'resources/css/app.css',
                    'resources/css/pages/access-denied.css',
                    'resources/js/app.js',
                    'resources/js/inertia.jsx',
                ],
                refresh: true,
            }),
            tailwindcss(),
            react(),
        ],
    };
});
