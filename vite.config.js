import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['cilantro.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Cilantro',
        short_name: 'Cilantro',
        description: 'A calming yes/no reflection app to help you find yourself',
        // Greenhouse herb home-base canvas (--c-bg light). The installed-app
        // splash and chrome should open on the theme, not v3's stone.
        theme_color: '#f2f6ee',
        background_color: '#f2f6ee',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // SPA: serve index.html for all navigations when offline
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
})
