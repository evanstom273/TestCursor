import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { BoardPage } from './pages/BoardPage'
import { BoardsPage } from './pages/BoardsPage'
import { LoginPage } from './pages/LoginPage'

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route element={<ProtectedRoute />}>
				<Route path="/boards" element={<BoardsPage />} />
				<Route path="/boards/:boardId" element={<BoardPage />} />
			</Route>
			<Route path="/" element={<Navigate to="/boards" replace />} />
			<Route path="*" element={<Navigate to="/boards" replace />} />
		</Routes>
	)
}
