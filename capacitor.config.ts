import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
	appId: 'com.testcursor.app',
	appName: 'TestCursor',
	webDir: 'dist',
	server: {
		androidScheme: 'https',
	},
}

export default config
