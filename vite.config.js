import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/lupus-in-tabula\.vercel\.app\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'lupus-in-tabula-api',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 24 * 60 * 60
                            }
                        }
                    }
                ]
            },
            manifest: {
                name: 'Lupus in Tabula',
                short_name: 'LupusInTab',
                description: 'A digital version of the popular werewolf game',
                theme_color: '#0f172a',
                background_color: '#0f172a',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: '/icons/icon-192.webp',
                        sizes: '192x192',
                        type: 'image/webp',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/icons/icon-512.webp',
                        sizes: '512x512',
                        type: 'image/webp',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.spec.ts'],
        setupFiles: ['src/__tests__/setup.ts'],
    },
});


