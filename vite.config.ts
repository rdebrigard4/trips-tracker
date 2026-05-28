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
        manifest: {
          name: 'Trips & Plans',
          short_name: 'Plans',
          description: 'Track trips and obligations together',
          theme_color: '#1e293b',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: base,
          scope: base,
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
  }
})
