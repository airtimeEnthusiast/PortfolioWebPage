import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages (repo is "PortfolioWebPage").
  // If you rename the repo or deploy to a user/organization site, update this value accordingly.
  base: '/PortfolioWebPage/',
  plugins: [react()],
  server: { open: true }
})
