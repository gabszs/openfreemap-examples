import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Exclude react-maplibre examples and tests from being served
      deny: ['**/react-maplibre/**']
    }
  },
  optimizeDeps: {
    // Exclude react-maplibre folder from dependency scanning
    exclude: ['react-maplibre']
  }
})
