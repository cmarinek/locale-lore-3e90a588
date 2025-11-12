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
      // Enforce single React instance
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    // Optimize React context resolution - prevent multiple React instances
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
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
            if (id.includes('mapbox')) {
              return 'map-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Only split non-React vendor code
            if (!id.includes('react')) {
              return 'vendor';
            }
          }
        }
      },
    },
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: [
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
      // CRITICAL: Exclude React to prevent multiple instances
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react-router-dom",
      "react-helmet-async",
      "next-themes"
    ],
  },
  ssr: {
    noExternal: ["framer-motion"],
  },
}));
