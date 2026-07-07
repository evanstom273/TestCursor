import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function WelcomePage() {
	const { session, loading } = useAuth()

	if (loading) {
		return (
			<div className="loading-screen">
				<p>Loading…</p>
			</div>
		)
	}

	if (session) {
		return <Navigate to="/home" replace />
	}

	return (
		<div className="welcome-page">
			<div className="glow" aria-hidden="true" />
			<section className="welcome-card">
				<p className="eyebrow">TestCursor</p>
				<h1>Your personal boards, everywhere</h1>
				<p className="subtitle">
					Plan with Kanban lists, rich notes, checklists, and media attachments —
					synced across desktop, mobile web, and Android.
				</p>
				<div className="welcome-actions">
					<Link to="/login" className="btn btn--primary">
						Sign in
					</Link>
					<Link to="/login" className="btn btn--ghost">
						Create account
					</Link>
				</div>
			</section>
		</div>
	)
}
