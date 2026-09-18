import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5176,
    // Fail loudly if 5176 is taken instead of silently moving to another port
    // (which would break the Laravel CORS/Sanctum origin allowlist).
    strictPort: true,
  },
})
