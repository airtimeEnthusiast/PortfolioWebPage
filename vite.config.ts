import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/

export default defineConfig({
  // Base path for GitHub Pages (match the repository name).
  // If you rename the repo or deploy to a user/organization site, update this value accordingly.
  base: '/PortfolioWebPage/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: { open: true }
})
