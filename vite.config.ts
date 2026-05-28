import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Trips & Plans',
        short_name: 'Plans',
        description: 'Track trips and obligations together',
        theme_color: '#1e293b',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        scope: '/',
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
