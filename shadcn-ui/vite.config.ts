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
                  'A Netflix-inspired marketplace connecting buyers with verified vendors across Kenya',
                start_url: '/',
                scope: '/',
                theme_color: '#E50914',
                background_color: '#141414',
                display: 'standalone',
                orientation: 'portrait-primary',
                categories: ['shopping', 'business', 'marketplace'],
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
                  {
                    src: '/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                  {
                    src: '/icon-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                ],
              },
              workbox: {
                // Cache static assets with CacheFirst strategy
                globPatterns: [
                  '**/*.{js,css,html,ico,png,svg,woff2,webp,jpg,jpeg}',
                  '**/fonts/**/*.{woff,woff2,ttf,otf}',
                  '**/images/**/*.{png,jpg,jpeg,webp,svg}',
                ],
                
                // Cache static assets - CacheFirst (fast, offline-first for assets)
                navigationPreload: true,
                
                // Runtime caching strategies
                runtimeCaching: [
                  // Static assets (images, fonts) - CacheFirst
                  {
                    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|otf)$/i,
                    handler: 'CacheFirst',
                    options: {
                      cacheName: 'static-assets-cache',
                      expiration: {
                        maxEntries: 200,
                        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                  
                  // API calls - NetworkFirst with fallback
                  {
                    urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
                    handler: 'NetworkFirst',
                    options: {
                      cacheName: 'supabase-api-cache',
                      networkTimeoutSeconds: 3,
                      expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 60 * 60 * 24, // 24 hours
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                      // Fallback to cache if network fails
                      plugins: [
                        {
                          cacheKeyWillBeUsed: async ({ request }) => {
                            return request.url;
                          },
                        },
                      ],
                    },
                  },
                  
                  // External images (Unsplash, CDN) - StaleWhileRevalidate
                  {
                    urlPattern: /^https:\/\/(images\.unsplash\.com|.*\.cloudinary\.com|.*\.amazonaws\.com).*/i,
                    handler: 'StaleWhileRevalidate',
                    options: {
                      cacheName: 'external-images-cache',
                      expiration: {
                        maxEntries: 150,
                        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                  
                  // HTML pages - NetworkFirst for fresh content
                  {
                    urlPattern: /^https?:\/\/.*\/.*$/i,
                    handler: 'NetworkFirst',
                    options: {
                      cacheName: 'pages-cache',
                      networkTimeoutSeconds: 3,
                      expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 60 * 24, // 24 hours
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                ],
                
                // Skip waiting - update immediately
                skipWaiting: true,
                clientsClaim: true,
                
                // Source map handling
                sourcemap: false,
                
                // Cleanup old caches
                cleanupOutdatedCaches: true,
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
      host: true, // Listen on all network interfaces
      strictPort: false, // Allow port fallback
      allowedHosts: [
        '.trycloudflare.com',
        '.ngrok.io',
        'localhost',
        '127.0.0.1',
      ],
    },
  };
});