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
    // Optimize React context resolution
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
        // Optimized code splitting for contexts
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react/jsx-runtime')) {
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
          
          // Context and provider chunks (keep together for better context resolution)
          if (id.includes('/contexts/') || id.includes('/providers/')) {
            return 'contexts';
          }
          
          // Feature chunks
          if (id.includes('/pages/Admin') || id.includes('/components/admin/')) {
            return 'admin';
          }
          if (id.includes('/pages/Map') || id.includes('/components/map/')) {
            return 'map';
          }
          if (id.includes('/pages/Auth') || id.includes('/components/auth/')) {
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
      "react/jsx-runtime",
      "react-router-dom", 
      "clsx",
      "tailwind-merge",
      "@supabase/supabase-js",
      "i18next",
      "react-i18next",
      "framer-motion",
      "lucide-react",
      "mapbox-gl",
      // Context-related dependencies
      "react-helmet-async",
      "next-themes"
    ],
    exclude: [
      "@capacitor/core" // Mobile-specific
    ],
    esbuildOptions: {
      mainFields: ['module', 'main'],
      target: 'esnext',
      loader: {
        '.js': 'jsx',
      },
      // Optimize React context creation
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      }
    }
  },
  ssr: {
    noExternal: ["framer-motion"],
  },
}));
