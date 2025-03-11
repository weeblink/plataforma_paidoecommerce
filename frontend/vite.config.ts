import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const env = loadEnv('', process.cwd(), '')

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': env,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
