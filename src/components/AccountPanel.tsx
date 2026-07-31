import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function AccountPanel() {
	const { user, profile, loading, isConfigured, signInWithGoogle, signOut } = useAuth()
	const [error, setError] = useState<string | null>(null)
	const [isSigningIn, setIsSigningIn] = useState(false)

	if (!isConfigured) {
		return (
			<div className="account-panel account-panel--notice">
				<p>
					Add your Supabase credentials to <code>.env.local</code> to enable Google
					sign-in.
				</p>
			</div>
		)
	}

	if (loading) {
		return (
			<div className="account-panel account-panel--loading">
				<p>Checking your account…</p>
			</div>
		)
	}

	if (user) {
		const displayName =
			profile?.full_name ?? user.user_metadata.full_name ?? user.email ?? 'Account'
		const avatarUrl = profile?.avatar_url ?? user.user_metadata.avatar_url ?? null

		return (
			<div className="account-panel account-panel--signed-in">
				<div className="account-panel__user">
					{avatarUrl ? (
						<img
							className="account-panel__avatar"
							src={avatarUrl}
							alt=""
							width={40}
							height={40}
						/>
					) : (
						<div className="account-panel__avatar account-panel__avatar--fallback" aria-hidden="true">
							{displayName.charAt(0).toUpperCase()}
						</div>
					)}
					<div>
						<p className="account-panel__label">Signed in</p>
						<p className="account-panel__name">{displayName}</p>
					</div>
				</div>
				<p className="account-panel__hint">
					Your account is ready. Future features will sync across devices.
				</p>
				<button type="button" className="btn btn--ghost" onClick={() => void signOut()}>
					Sign out
				</button>
			</div>
		)
	}

	const handleSignIn = async () => {
		setError(null)
		setIsSigningIn(true)

		const result = await signInWithGoogle()

		if (result.error) {
			setError(result.error)
			setIsSigningIn(false)
		}
	}

	return (
		<div className="account-panel">
			<p className="account-panel__hint">
				Sign in with Google to save your data across devices.
			</p>
			<button
				type="button"
				className="btn btn--google"
				onClick={() => void handleSignIn()}
				disabled={isSigningIn}
			>
				<svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="#4285F4"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="#34A853"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="#FBBC05"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
					/>
					<path
						fill="#EA4335"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				{isSigningIn ? 'Redirecting…' : 'Continue with Google'}
			</button>
			{error ? <p className="account-panel__error">{error}</p> : null}
		</div>
	)
}
