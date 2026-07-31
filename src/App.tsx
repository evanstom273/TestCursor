import { Route, Routes } from 'react-router-dom'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { ComingSoonPage } from './pages/ComingSoonPage'

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<ComingSoonPage />} />
			<Route path="/auth/callback" element={<AuthCallbackPage />} />
		</Routes>
	)
}
