import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './layouts/AppShell'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { BoardPage } from './pages/BoardPage'
import { BoardsPage } from './pages/BoardsPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SettingsPage } from './pages/SettingsPage'
import { WelcomePage } from './pages/WelcomePage'

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<WelcomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/auth/callback" element={<AuthCallbackPage />} />
			<Route element={<ProtectedRoute />}>
				<Route element={<AppShell />}>
					<Route path="/home" element={<HomePage />} />
					<Route path="/boards" element={<BoardsPage />} />
					<Route path="/boards/:boardId" element={<BoardPage />} />
					<Route path="/settings" element={<SettingsPage />} />
				</Route>
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}
