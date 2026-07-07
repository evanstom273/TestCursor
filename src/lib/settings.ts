export type Theme = 'dark' | 'light'

export type AppSettings = {
	theme: Theme
	defaultListColumns: string[]
	sidebarCollapsed: boolean
}

export const APP_VERSION =
	typeof import.meta.env.VITE_APP_VERSION === 'string' && import.meta.env.VITE_APP_VERSION.length > 0
		? import.meta.env.VITE_APP_VERSION
		: '0.1.0'

export const DEFAULT_LIST_COLUMNS = ['To Do', 'Doing', 'Done']

const STORAGE_KEY = 'testcursor-settings'

const DEFAULT_SETTINGS: AppSettings = {
	theme: 'dark',
	defaultListColumns: DEFAULT_LIST_COLUMNS,
	sidebarCollapsed: false,
}

export function loadSettings(): AppSettings {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)

		if (!raw) {
			return DEFAULT_SETTINGS
		}

		const parsed = JSON.parse(raw) as Partial<AppSettings>

		return {
			theme: parsed.theme === 'light' ? 'light' : 'dark',
			defaultListColumns:
				Array.isArray(parsed.defaultListColumns) && parsed.defaultListColumns.length > 0
					? parsed.defaultListColumns.filter((item) => typeof item === 'string')
					: DEFAULT_LIST_COLUMNS,
			sidebarCollapsed: Boolean(parsed.sidebarCollapsed),
		}
	} catch {
		return DEFAULT_SETTINGS
	}
}

export function saveSettings(settings: AppSettings): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function applyTheme(theme: Theme): void {
	document.documentElement.dataset.theme = theme
}
