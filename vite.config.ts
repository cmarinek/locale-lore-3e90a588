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
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('mapbox')) {
              return 'map-vendor';
            }
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
