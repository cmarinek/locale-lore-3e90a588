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
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // PWA disabled to prevent caching conflicts during development
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Avoid duplicate React instances across chunks and deps
    dedupe: ["react", "react-dom"],
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
        // Optimized code splitting
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('framer-motion')) {
              return 'ui-vendor';
            }
            if (id.includes('mapbox') || id.includes('supercluster')) {
              return 'map-vendor';
            }
            if (id.includes('i18next') || id.includes('date-fns')) {
              return 'i18n-vendor';
            }
            return 'vendor';
          }
          
          // Feature chunks
          if (id.includes('/pages/Admin') || id.includes('/components/admin/')) {
            return 'admin';
          }
          if (id.includes('/pages/Map') || id.includes('/components/map/')) {
            return 'map';
          }
          if (id.includes('/components/auth/') || id.includes('/pages/Auth')) {
            return 'auth';
          }
        }
      },
    },
    // Performance optimizations
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false, // Faster builds
  },
  optimizeDeps: {
    include: [
      "react", 
      "react-dom", 
      "react-router-dom", 
      "clsx",
      "tailwind-merge",
      "@supabase/supabase-js",
      "i18next",
      "react-i18next",
      "framer-motion",
      "lucide-react",
      "mapbox-gl"
    ],
    // Remove mapbox-gl from exclusions - it needs to be optimized
    exclude: [
      "@capacitor/core" // Mobile-specific
    ],
    force: true,
    esbuildOptions: {
      mainFields: ['module', 'main'],
      target: 'esnext'
    }
  },
  ssr: {
    noExternal: ["framer-motion"],
  },
}));
