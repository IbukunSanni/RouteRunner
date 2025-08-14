import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), 
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true, // Allow external connections
    open: false, // Don't auto-open browser (we'll handle this in our script)
    hmr: {
      overlay: true, // Show error overlay on HMR errors
    },
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:5088',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Optimize for faster builds during development
  build: {
    sourcemap: true,
  },
});
