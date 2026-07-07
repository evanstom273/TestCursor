import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
	{ to: '/home', label: 'Home', icon: '⌂' },
	{ to: '/boards', label: 'Boards', icon: '▦' },
	{ to: '/settings', label: 'Settings', icon: '⚙' },
] as const

export function BottomNav() {
	return (
		<nav className="bottom-nav" aria-label="Main navigation">
			{NAV_ITEMS.map((item) => (
				<NavLink
					key={item.to}
					to={item.to}
					className={({ isActive }) =>
						`bottom-nav__link${isActive ? ' bottom-nav__link--active' : ''}`
					}
					end={item.to === '/boards'}
				>
					<span className="bottom-nav__icon" aria-hidden="true">
						{item.icon}
					</span>
					<span className="bottom-nav__label">{item.label}</span>
				</NavLink>
			))}
		</nav>
	)
}
