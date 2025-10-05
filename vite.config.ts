import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/v1': {
        target: 'https://fra.cloud.appwrite.io',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  // assetsInclude: ['**/*.html'],
})