import { Capacitor } from '@capacitor/core'
import { isNativeApp } from './platform'

export function initNativeShell(): void {
	if (!isNativeApp()) {
		return
	}

	document.documentElement.dataset.nativeShell = 'true'
	document.documentElement.dataset.platform = Capacitor.getPlatform()
}
