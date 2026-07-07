import { useEffect, useState } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'
import { useBoard } from '../hooks/useLists'

function getPageTitle(pathname: string, boardTitle?: string): string {
	if (pathname === '/home') {
		return 'Home'
	}

	if (pathname === '/boards') {
		return 'Your boards'
	}

	if (pathname.startsWith('/boards/') && boardTitle) {
		return boardTitle
	}

	if (pathname.startsWith('/boards/')) {
		return 'Board'
	}

	if (pathname === '/settings') {
		return 'Settings'
	}

	return 'TestCursor'
}

export function AppShell() {
	const { user, signOut } = useAuth()
	const location = useLocation()
	const { boardId } = useParams()
	const { data: board } = useBoard(boardId)
	const title = getPageTitle(location.pathname, board?.title)
	const [mobileNavOpen, setMobileNavOpen] = useState(false)

	useEffect(() => {
		setMobileNavOpen(false)
	}, [location.pathname])

	return (
		<div className="app-shell">
			{mobileNavOpen ? (
				<button
					type="button"
					className="sidebar-backdrop"
					aria-label="Close menu"
					onClick={() => setMobileNavOpen(false)}
				/>
			) : null}
			<Sidebar
				mobileOpen={mobileNavOpen}
				onNavigate={() => setMobileNavOpen(false)}
			/>
			<div className="app-shell__main">
				<header className="app-header">
					<div className="app-header__left">
						<button
							type="button"
							className="btn btn--ghost btn--small app-header__menu"
							aria-label="Open menu"
							onClick={() => setMobileNavOpen(true)}
						>
							☰
						</button>
						<h1 className="app-header__title">{title}</h1>
					</div>
					<div className="app-header__right">
						<span className="app-header__email">{user?.email}</span>
						<button type="button" className="btn btn--ghost btn--small" onClick={() => void signOut()}>
							Sign out
						</button>
					</div>
				</header>
				<main className="app-main app-main--shell">
					<Outlet context={{ boardId }} />
				</main>
			</div>
		</div>
	)
}
