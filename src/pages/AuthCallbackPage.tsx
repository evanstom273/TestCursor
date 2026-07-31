import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function AuthCallbackPage() {
	const navigate = useNavigate()
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let mounted = true

		const completeSignIn = async () => {
			const queryParams = new URLSearchParams(window.location.search)
			const code = queryParams.get('code')
			const errorDescription =
				queryParams.get('error_description') ?? queryParams.get('error')

			if (errorDescription) {
				if (mounted) {
					setError(errorDescription)
				}
				return
			}

			if (code) {
				const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

				if (exchangeError) {
					if (mounted) {
						setError(exchangeError.message)
					}
					return
				}
			}

			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession()

			if (sessionError) {
				if (mounted) {
					setError(sessionError.message)
				}
				return
			}

			if (session) {
				navigate('/', { replace: true })
				return
			}

			if (mounted) {
				setError('Sign-in link expired or invalid. Please try again.')
			}
		}

		void completeSignIn()

		return () => {
			mounted = false
		}
	}, [navigate])

	if (error) {
		return (
			<main className="auth-callback">
				<h1>Sign-in failed</h1>
				<p className="auth-callback__error">{error}</p>
				<Link to="/" className="btn btn--primary">
					Back to home
				</Link>
			</main>
		)
	}

	return (
		<main className="auth-callback">
			<p>Signing you in…</p>
		</main>
	)
}
