import { NavLink } from 'react-router-dom'
import { useSettings } from '../contexts/SettingsContext'

const NAV_ITEMS = [
	{ to: '/home', label: 'Home', icon: '⌂' },
	{ to: '/boards', label: 'Boards', icon: '▦' },
	{ to: '/settings', label: 'Settings', icon: '⚙' },
] as const

type SidebarProps = {
	mobileOpen?: boolean
	onNavigate?: () => void
}

export function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
	const { settings, toggleSidebarCollapsed } = useSettings()
	const collapsed = settings.sidebarCollapsed

	return (
		<aside
			className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}${mobileOpen ? ' sidebar--mobile-open' : ''}`}
		>
			<div className="sidebar__header">
				<span className="sidebar__brand">{collapsed ? 'TC' : 'TestCursor'}</span>
				<button
					type="button"
					className="btn btn--ghost btn--small sidebar__toggle"
					onClick={toggleSidebarCollapsed}
					aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				>
					{collapsed ? '»' : '«'}
				</button>
			</div>
			<nav className="sidebar__nav">
				{NAV_ITEMS.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							`sidebar__link${isActive ? ' sidebar__link--active' : ''}`
						}
						end={item.to === '/boards'}
						onClick={onNavigate}
					>
						<span className="sidebar__icon" aria-hidden="true">
							{item.icon}
						</span>
						<span className="sidebar__label">{item.label}</span>
					</NavLink>
				))}
			</nav>
		</aside>
	)
}
