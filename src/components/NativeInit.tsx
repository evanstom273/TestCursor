import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isNativeApp } from '../lib/platform'

export function NativeInit() {
	const navigate = useNavigate()

	useEffect(() => {
		if (!isNativeApp()) {
			return
		}

		const init = async () => {
			const { StatusBar, Style } = await import('@capacitor/status-bar')
			await StatusBar.setStyle({ style: Style.Dark })

			const { App } = await import('@capacitor/app')

			await App.addListener('appUrlOpen', (event) => {
				try {
					const incoming = new URL(event.url.replace('com.testcursor.app://', 'https://local.app/'))
					navigate(`${incoming.pathname}${incoming.search}`, { replace: true })
				} catch {
					// Ignore malformed deep links.
				}
			})
		}

		void init()
	}, [navigate])

	return null
}
