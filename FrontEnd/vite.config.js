import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          charts: ['chart.js', 'react-chartjs-2'],
          qr: ['qrcode', 'qrcode.react', 'html5-qrcode'],
          pdf: ['jspdf', 'html2canvas']
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://campuspulse-1.onrender.com'
          : 'http://localhost:5000',
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  preview: {
    host: true,
    port: 4173
  }
})
