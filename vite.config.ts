import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_RAILWAY = 'https://gridalpha-v2-production.up.railway.app'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = (
    env.VITE_BACKEND_URL ||
    env.VITE_NEWS_API_URL ||
    DEFAULT_RAILWAY
  ).replace(/\/$/, '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': { target, changeOrigin: true, secure: true },
      },
    },
  }
})
