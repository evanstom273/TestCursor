import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export function LoginPage() {
	const { session, signInWithEmail } = useAuth()
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	if (session) {
		return <Navigate to="/boards" replace />
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
				<p className="subtitle">Sign in with a magic link sent to your email.</p>

				{!isSupabaseConfigured ? (
					<p className="form-error">
						Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
						to .env.local.
					</p>
				) : null}

				<form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
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

				{message ? <p className="form-message">{message}</p> : null}
				{error ? <p className="form-error">{error}</p> : null}
			</section>
		</div>
	)
}
