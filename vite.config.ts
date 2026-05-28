import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const REPO = 'trips-tracker'

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? `/${REPO}/` : '/'
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['apple-touch-icon.png'],
        manifest: {
          name: 'Trips & Plans',
          short_name: 'Plans',
          description: 'Track trips and obligations together',
          theme_color: '#1e293b',
          background_color: '#0b1220',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
  }
})
