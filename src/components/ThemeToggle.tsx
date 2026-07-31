import { useEffect, useState } from 'react'
import { applyTheme, getTheme, toggleTheme, type Theme } from '../lib/theme'

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>(() => getTheme())

	useEffect(() => {
		applyTheme(theme)
	}, [theme])

	return (
		<button
			type="button"
			className="theme-toggle"
			onClick={() => setTheme((current) => toggleTheme(current))}
			aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			{theme === 'dark' ? (
				<svg className="theme-toggle__icon" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="currentColor"
						d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0 2a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM11 1h2v3h-2V1Zm0 19h2v3h-2v-3ZM4.22 4.22l1.42 1.42-2.12 2.12-1.42-1.42 2.12-2.12Zm16.9 16.9 1.42 1.42-2.12 2.12-1.42-1.42 2.12-2.12ZM1 11h3v2H1v-2Zm19 0h3v2h-3v-2ZM4.22 19.78l2.12-2.12 1.42 1.42-2.12 2.12-1.42-1.42Zm16.9-16.9 2.12 2.12-1.42 1.42-2.12-2.12 1.42-1.42Z"
					/>
				</svg>
			) : (
				<svg className="theme-toggle__icon" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="currentColor"
						d="M21 14.5A7.5 7.5 0 0 1 9.5 3.2a7.5 7.5 0 1 0 11.5 11.3Z"
					/>
				</svg>
			)}
		</button>
	)
}
