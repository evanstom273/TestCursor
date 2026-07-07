import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type AppLayoutProps = {
	title: string
	backTo?: string
	children: React.ReactNode
}

export function AppLayout({ title, backTo, children }: AppLayoutProps) {
	const { user, signOut } = useAuth()

	return (
		<div className="app-shell">
			<header className="app-header">
				<div className="app-header__left">
					{backTo ? (
						<Link to={backTo} className="btn btn--ghost">
							← Boards
						</Link>
					) : (
						<Link to="/boards" className="app-header__brand">
							TestCursor
						</Link>
					)}
					<h1 className="app-header__title">{title}</h1>
				</div>
				<div className="app-header__right">
					<span className="app-header__email">{user?.email}</span>
					<button type="button" className="btn btn--ghost" onClick={() => void signOut()}>
						Sign out
					</button>
				</div>
			</header>
			<main className="app-main">{children}</main>
		</div>
	)
}
