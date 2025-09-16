import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                skipWaiting: true,
                clientsClaim: true,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/lupus-in-tabula\.vercel\.app\/version\.json$/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'version-cache',
                            expiration: {
                                maxEntries: 1,
                                maxAgeSeconds: 60 // Very short cache for version.json
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/lupus-in-tabula\.vercel\.app\/.*/i,
                        handler: 'StaleWhileRevalidate',
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
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
            },
            mangle: {
                toplevel: true,
                safari10: true
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['vue', 'vue-router', 'pinia'],
                    capacitor: ['@capacitor/core', '@capacitor/app']
                }
            }
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.spec.ts'],
        setupFiles: ['src/__tests__/setup.ts'],
    },
});


