import { useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContext'
import { APP_VERSION, DEFAULT_LIST_COLUMNS } from '../lib/settings'
import { isNativeApp } from '../lib/platform'

const LIMITS = [
	{ label: 'Images', value: '5 MB' },
	{ label: 'Documents', value: '10 MB' },
	{ label: 'Audio', value: '20 MB' },
	{ label: 'Video', value: '50 MB' },
]

export function SettingsPage() {
	const { user, signOut } = useAuth()
	const { settings, setTheme, setDefaultListColumns } = useSettings()
	const [columnsText, setColumnsText] = useState(settings.defaultListColumns.join('\n'))
	const [savedMessage, setSavedMessage] = useState<string | null>(null)

	const handleSaveColumns = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const columns = columnsText
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)

		if (columns.length === 0) {
			setDefaultListColumns(DEFAULT_LIST_COLUMNS)
			setColumnsText(DEFAULT_LIST_COLUMNS.join('\n'))
		} else {
			setDefaultListColumns(columns)
		}

		setSavedMessage('Default columns saved for new boards.')
	}

	return (
		<section className="settings-page">
			<div className="settings-section">
				<h2>Account</h2>
				<p className="muted">{user?.email ?? 'Not signed in'}</p>
				<button type="button" className="btn btn--ghost" onClick={() => void signOut()}>
					Sign out
				</button>
			</div>

			<div className="settings-section">
				<h2>Appearance</h2>
				<div className="settings-toggle">
					<button
						type="button"
						className={`btn btn--small${settings.theme === 'dark' ? ' btn--primary' : ' btn--ghost'}`}
						onClick={() => setTheme('dark')}
					>
						Dark
					</button>
					<button
						type="button"
						className={`btn btn--small${settings.theme === 'light' ? ' btn--primary' : ' btn--ghost'}`}
						onClick={() => setTheme('light')}
					>
						Light
					</button>
				</div>
			</div>

			<form className="settings-section" onSubmit={handleSaveColumns}>
				<h2>Default board columns</h2>
				<p className="muted">One column name per line. Used when creating new boards.</p>
				<label className="field">
					<span>Column names</span>
					<textarea
						value={columnsText}
						onChange={(event) => setColumnsText(event.target.value)}
						rows={4}
					/>
				</label>
				<button type="submit" className="btn btn--primary btn--small">
					Save columns
				</button>
				{savedMessage ? <p className="form-message">{savedMessage}</p> : null}
			</form>

			<div className="settings-section">
				<h2>Upload limits</h2>
				<ul className="settings-list">
					{LIMITS.map((limit) => (
						<li key={limit.label}>
							<strong>{limit.label}:</strong> {limit.value}
						</li>
					))}
				</ul>
			</div>

			<div className="settings-section">
				<h2>Install app</h2>
				<p className="muted">
					<strong>PWA (mobile browser):</strong> use your browser menu → Add to Home Screen.
				</p>
				<p className="muted">
					<strong>Android APK:</strong> build with Capacitor in Android Studio (see README).
				</p>
				{isNativeApp() ? <p className="form-message">Running as a native Android app.</p> : null}
			</div>

			<div className="settings-section">
				<h2>About</h2>
				<p className="muted">TestCursor v{APP_VERSION}</p>
			</div>
		</section>
	)
}
