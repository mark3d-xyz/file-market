import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    target: 'esnext' // you can also use 'es2020' here
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext' // you can also use 'es2020' here
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    proxy: {
      '/api': {
        target: 'https://dev.filemarket.xyz/',
        changeOrigin: true
      },
      '/static': {
        target: 'https://dev.filemarket.xyz/',
        changeOrigin: true
      },
      '/ws': {
        target: 'wss://dev.filemarket.xyz/',
        secure: false,
        changeOrigin: true,
        ws: true
      }
    }
  }
})
