import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls to external sentiment API
      '/sentiment-api': {
        target: `https://sentiment-api1.onrender.com/`,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/sentiment-api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('Sentiment API Proxy error:', err);
          });
        },
      },
      // Proxy to local database backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('Database API Proxy error:', err);
          });
        },
      }
    }
  }

})