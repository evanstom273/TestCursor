import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string }

export default defineConfig({
	base: './',
	define: {
		'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
	},
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
				start_url: './home',
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
