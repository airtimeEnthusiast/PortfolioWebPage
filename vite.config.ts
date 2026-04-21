import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/

export default defineConfig({
  // Base path for deployment. With custom domain at austinbradlywright.com, use '/'.
  // For GitHub Pages project path, use '/PortfolioWebPage/'.
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: { open: true }
})
