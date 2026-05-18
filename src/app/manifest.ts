import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chá de Bebê - Admin',
    short_name: 'Chá Admin',
    description: 'Painel Administrativo do Chá de Bebê',
    start_url: '/admin',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#d4af37',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
