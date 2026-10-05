import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    // The 3D stack is most of the bundle and rarely changes: give it its own chunk so app edits do not re-download it.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'three-vendor', test: /node_modules[\/](three|@react-three|three-stdlib)[\/]/ }],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      }
    }
  }
})
