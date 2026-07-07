import { Capacitor } from '@capacitor/core'
import type { Theme } from './settings'
import { isNativeApp } from './platform'

const STATUS_BAR_COLORS: Record<Theme, string> = {
	dark: '#0b1020',
	light: '#f3f4f8',
}

export async function configureNativeStatusBar(theme: Theme = 'dark'): Promise<void> {
	if (!isNativeApp()) {
		return
	}

	const { StatusBar, Style } = await import('@capacitor/status-bar')

	await StatusBar.setOverlaysWebView({ overlay: false })
	await StatusBar.setBackgroundColor({ color: STATUS_BAR_COLORS[theme] })
	await StatusBar.setStyle({ style: theme === 'light' ? Style.Light : Style.Dark })

	if (Capacitor.getPlatform() === 'android') {
		await StatusBar.show()
	}
}
