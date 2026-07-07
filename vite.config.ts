import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.svg'],
			manifest: {
				name: 'TestCursor',
				short_name: 'TestCursor',
				description: 'Personal Kanban boards with cloud sync',
				theme_color: '#0b1020',
				background_color: '#0b1020',
				display: 'standalone',
				start_url: '/',
				icons: [
					{
						src: 'favicon.svg',
						sizes: '512x512',
						type: 'image/svg+xml',
						purpose: 'any',
					},
				],
			},
		}),
	],
})
