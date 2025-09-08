import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "React TypeScript PWA",
        short_name: "React PWA",
        description: "A modern React TypeScript PWA with iOS-inspired design",
        theme_color: "#007AFF",
        background_color: "#FFFFFF",
        display: "standalone",
        icons: [
          {
            src: "/placeholder.svg",
            sizes: "192x192",
            type: "image/svg+xml"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        navigateFallback: null, // Disable navigate fallback for large apps
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.mapbox\.com\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "mapbox-api",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    sourcemap: mode === "development",
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Vendor libraries
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'vendor-react';
                }
                if (id.includes('mapbox-gl')) {
                  return 'vendor-mapbox';
                }
                if (id.includes('@radix-ui')) {
                  return 'vendor-ui';
                }
                if (id.includes('@supabase')) {
                  return 'vendor-supabase';
                }
                if (id.includes('framer-motion') || id.includes('lucide-react')) {
                  return 'vendor-animations';
                }
                if (id.includes('i18next') || id.includes('react-i18next')) {
                  return 'vendor-i18n';
                }
                return 'vendor-misc';
              }
              
              // Application chunks
              if (id.includes('/pages/')) {
                return 'pages';
              }
              if (id.includes('/admin/')) {
                return 'admin';
              }
              if (id.includes('/components/')) {
                if (id.includes('/ui/')) {
                  return 'components-ui';
                }
                if (id.includes('/discovery/') || id.includes('/search/')) {
                  return 'components-discovery';
                }
                if (id.includes('/social/') || id.includes('/gamification/')) {
                  return 'components-social';
                }
                return 'components-misc';
              }
              if (id.includes('/hooks/')) {
                return 'hooks';
              }
              if (id.includes('/utils/')) {
                return 'utils';
              }
            },
          },
        },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "framer-motion"],
  },
  ssr: {
    noExternal: ["framer-motion"],
  },
}));
