import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const isCodespaces = Boolean(process.env.CODESPACES || process.env.GITHUB_CODESPACES);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Disable PWA in development and Codespaces to avoid caching issues
    mode === "production" && !isCodespaces &&
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
              type: "image/svg+xml",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
          navigateFallback: null, // Disable navigate fallback for large apps
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true, // Clear old caches
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
        // Ensure proper module loading order
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          // Core vendor (deduplicated React)
          vendor: ['react', 'react-dom'],
          'vendor-ui': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          'vendor-auth': ['@supabase/supabase-js'],
          'vendor-router': ['react-router-dom'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority']
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react", 
      "react-dom", 
      "react-router-dom", 
      "clsx",
      "tailwind-merge"
    ],
    force: true, // Force re-optimization to clear any cached issues
    esbuildOptions: {
      mainFields: ['module', 'main']
    }
  },
  ssr: {
    noExternal: ["framer-motion"],
  },
}));
