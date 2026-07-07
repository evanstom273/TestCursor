import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
	appId: 'com.testcursor.app',
	appName: 'TestCursor',
	webDir: 'dist',
	server: {
		androidScheme: 'https',
	},
	plugins: {
		StatusBar: {
			overlaysWebView: false,
			backgroundColor: '#0b1020',
			style: 'DARK',
		},
	},
}

export default config
