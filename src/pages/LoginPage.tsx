import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabaseClient'

type AuthMode = 'password' | 'magic-link'

export function LoginPage() {
	const { session, signInWithEmail, signInWithPassword, signUpWithPassword } = useAuth()
	const [mode, setMode] = useState<AuthMode>('password')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	if (session) {
		return <Navigate to="/boards" replace />
	}

	const handlePasswordSignIn = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setSubmitting(true)
		setError(null)
		setMessage(null)

		const result = await signInWithPassword(email.trim(), password)

		if (result.error) {
			setError(result.error)
		}

		setSubmitting(false)
	}

	const handlePasswordSignUp = async () => {
		setSubmitting(true)
		setError(null)
		setMessage(null)

		const result = await signUpWithPassword(email.trim(), password)

		if (result.error) {
			setError(result.error)
		} else {
			setMessage('Account created. You should be signed in now.')
		}

		setSubmitting(false)
	}

	const handleMagicLink = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setSubmitting(true)
		setError(null)
		setMessage(null)

		const result = await signInWithEmail(email.trim())

		if (result.error) {
			setError(result.error)
		} else {
			setMessage('Check your email for a magic login link.')
		}

		setSubmitting(false)
	}

	return (
		<div className="auth-page">
			<div className="glow" aria-hidden="true" />
			<section className="auth-card">
				<p className="eyebrow">TestCursor</p>
				<h1>Personal boards</h1>
				<p className="subtitle">
					{mode === 'password'
						? 'Sign in with email and password — no email sent.'
						: 'Sign in with a magic link sent to your email.'}
				</p>

				{!isSupabaseConfigured ? (
					<p className="form-error">
						Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
						to .env.local.
					</p>
				) : null}

				{mode === 'password' ? (
					<form className="auth-form" onSubmit={(event) => void handlePasswordSignIn(event)}>
						<label className="field">
							<span>Email</span>
							<input
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="you@example.com"
								required
								autoComplete="email"
							/>
						</label>
						<label className="field">
							<span>Password</span>
							<input
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								placeholder="At least 6 characters"
								required
								minLength={6}
								autoComplete="current-password"
							/>
						</label>
						<div className="auth-actions">
							<button type="submit" className="btn btn--primary" disabled={submitting}>
								{submitting ? 'Signing in…' : 'Sign in'}
							</button>
							<button
								type="button"
								className="btn btn--ghost"
								disabled={submitting}
								onClick={() => void handlePasswordSignUp()}
							>
								Create account
							</button>
						</div>
					</form>
				) : (
					<form className="auth-form" onSubmit={(event) => void handleMagicLink(event)}>
						<label className="field">
							<span>Email</span>
							<input
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="you@example.com"
								required
								autoComplete="email"
							/>
						</label>
						<button type="submit" className="btn btn--primary" disabled={submitting}>
							{submitting ? 'Sending…' : 'Send magic link'}
						</button>
					</form>
				)}

				<button
					type="button"
					className="btn btn--ghost auth-mode-toggle"
					onClick={() => {
						setMode(mode === 'password' ? 'magic-link' : 'password')
						setError(null)
						setMessage(null)
					}}
				>
					{mode === 'password' ? 'Use magic link instead' : 'Use password instead'}
				</button>

				{mode === 'password' ? (
					<div className="auth-recovery">
						<p className="auth-recovery__title">Stuck? Reset in Supabase (30 seconds)</p>
						<ol className="auth-recovery__steps">
							<li>
								<strong>Authentication → Providers → Email</strong> — turn off{' '}
								<strong>Confirm email</strong>
							</li>
							<li>
								<strong>Authentication → Users</strong> — delete your email if it is
								listed
							</li>
							<li>Come back here and click <strong>Create account</strong></li>
						</ol>
					</div>
				) : null}

				{message ? <p className="form-message">{message}</p> : null}
				{error ? <p className="form-error">{error}</p> : null}
			</section>
		</div>
	)
}
