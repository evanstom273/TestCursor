import { AccountPanel } from '../components/AccountPanel'
import { ThemeToggle } from '../components/ThemeToggle'
import '../App.css'

export function ComingSoonPage() {
	return (
		<main className="landing">
			<div className="landing__glow" aria-hidden="true" />

			<header className="landing__header">
				<span className="landing__logo">TestCursor</span>
				<ThemeToggle />
			</header>

			<section className="landing__hero">
				<p className="landing__eyebrow">Something new is on the way</p>
				<h1 className="landing__title">Coming Soon</h1>
				<p className="landing__subtitle">
					We&apos;re building something worth the wait. Sign in now so your account is
					ready when we launch.
				</p>
				<AccountPanel />
			</section>

			<footer className="landing__footer">
				<p>&copy; {new Date().getFullYear()} TestCursor</p>
			</footer>
		</main>
	)
}
