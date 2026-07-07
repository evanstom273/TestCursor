import { Capacitor } from '@capacitor/core'

export function isNativeApp(): boolean {
	return Capacitor.isNativePlatform()
}

export function isMobileViewport(): boolean {
	return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
}
