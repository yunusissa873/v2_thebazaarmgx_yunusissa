import path from 'path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';
  // Enable PWA ONLY for published builds by setting VITE_ENABLE_PWA=true
  const enablePWA = isBuild && mode === 'production' && process.env.VITE_ENABLE_PWA === 'true';

  return {
    plugins: [
      react(),
      ...(enablePWA
        ? [
            VitePWA({
              registerType: 'autoUpdate',
              includeAssets: ['favicon.svg', 'robots.txt'],
              manifest: {
                name: 'The Bazaar - Marketplace',
                short_name: 'The Bazaar',
                description:
                  'A Netflix-inspired marketplace connecting buyers with verified vendors',
                theme_color: '#141414',
                background_color: '#141414',
                display: 'standalone',
                icons: [
                  {
                    src: '/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any maskable',
                  },
                  {
                    src: '/icon-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable',
                  },
                ],
              },
              workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                  {
                    urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
                    handler: 'NetworkFirst',
                    options: {
                      cacheName: 'supabase-cache',
                      expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 60 * 24, // 24 hours
                      },
                    },
                  },
                ],
              },
              devOptions: {
                enabled: false, // ensure no SW in dev server
              },
            }),
          ]
        : []),
    ],
    define: {
      'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
      'import.meta.env.VITE_SHOW_BADGE': JSON.stringify(process.env.VITE_SHOW_BADGE ?? 'true'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
    },
  };
});