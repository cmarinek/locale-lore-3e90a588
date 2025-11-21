import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";


const isCodespaces = Boolean(process.env.CODESPACES || process.env.GITHUB_CODESPACES);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // PWA disabled to prevent caching conflicts during development
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Enforce single React instance and scheduler
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "scheduler": path.resolve(__dirname, "./node_modules/scheduler"),
    },
    // Optimize React context resolution - prevent multiple React instances
    dedupe: ["react", "react-dom", "react/jsx-runtime", "scheduler"],
    // Ensure contexts are resolved consistently
    conditions: ['import', 'module', 'browser', 'default'],
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Don't manually chunk React - keep it in main bundle to prevent initialization errors
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Keep React, scheduler, and React-dependent libraries in main bundle
            if (id.includes('react') || id.includes('scheduler') || id.includes('@radix-ui')) {
              // Don't chunk these - they need to be in the same bundle
              return undefined;
            }

            if (id.includes('mapbox')) {
              return 'map-vendor';
            }

            // Large independent libraries that don't depend on React internals
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }

            // Other vendor code
            return 'vendor';
          }
        }
      },
    },
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "scheduler",
      "scheduler/tracing",
      "@tanstack/react-query",
      "clsx",
      "tailwind-merge",
      "@supabase/supabase-js",
      "i18next",
      "react-i18next",
      "framer-motion",
      "lucide-react",
      "mapbox-gl",
    ],
    exclude: [
      "@capacitor/core",
    ],
  },
  ssr: {
    noExternal: ["framer-motion"],
  },
}));
