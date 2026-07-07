import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react'
import {
	applyTheme,
	loadSettings,
	saveSettings,
	type AppSettings,
	type Theme,
} from '../lib/settings'

type SettingsContextValue = {
	settings: AppSettings
	setTheme: (theme: Theme) => void
	setDefaultListColumns: (columns: string[]) => void
	setSidebarCollapsed: (collapsed: boolean) => void
	toggleSidebarCollapsed: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<AppSettings>(() => loadSettings())

	useEffect(() => {
		applyTheme(settings.theme)
		saveSettings(settings)
	}, [settings])

	const value = useMemo<SettingsContextValue>(
		() => ({
			settings,
			setTheme: (theme) => {
				setSettings((current) => ({ ...current, theme }))
			},
			setDefaultListColumns: (defaultListColumns) => {
				setSettings((current) => ({ ...current, defaultListColumns }))
			},
			setSidebarCollapsed: (sidebarCollapsed) => {
				setSettings((current) => ({ ...current, sidebarCollapsed }))
			},
			toggleSidebarCollapsed: () => {
				setSettings((current) => ({
					...current,
					sidebarCollapsed: !current.sidebarCollapsed,
				}))
			},
		}),
		[settings],
	)

	return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
	const context = useContext(SettingsContext)

	if (!context) {
		throw new Error('useSettings must be used within SettingsProvider')
	}

	return context
}
