import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { BoardPage } from './pages/BoardPage'
import { BoardsPage } from './pages/BoardsPage'
import { LoginPage } from './pages/LoginPage'

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/auth/callback" element={<AuthCallbackPage />} />
			<Route element={<ProtectedRoute />}>
				<Route path="/boards" element={<BoardsPage />} />
				<Route path="/boards/:boardId" element={<BoardPage />} />
			</Route>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	)
}
