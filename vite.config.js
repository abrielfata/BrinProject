import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['recharts'],
            icons: ['lucide-react']
          }
        }
      }
    },

    server: {
      proxy: {
        // Proxy API calls to external sentiment API (untuk ML model)
        '/sentiment-api': {
          target: 'https://sentiment-api1.onrender.com/',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/sentiment-api/, ''),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('Sentiment API Proxy error:', err);
            });
          },
        },
        // Proxy to backend - development vs production
        '/api': {
          target: mode === 'development' 
            ? 'http://localhost:3001'  // Local backend untuk development
            : 'https://brinproject.onrender.com', // Production backend dengan Supabase
          changeOrigin: true,
          secure: mode !== 'development',
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('Database API Proxy error:', err);
            });
            if (mode === 'development') {
              proxy.on('proxyReq', (proxyReq, req) => {
                console.log('Proxying to local backend:', req.method, req.url);
              });
            }
          },
        }
      }
    },

    preview: {
      port: 3000,
      host: true
    },

    // Environment variables configuration
    define: {
      __APP_ENV__: JSON.stringify(mode),
    }
  }
})
