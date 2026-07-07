import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { NativeInit } from './components/NativeInit.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { SettingsProvider } from './contexts/SettingsContext.tsx'
import './index.css'
import './app.css'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
		},
	},
})

const rootElement = document.getElementById('root')

if (!rootElement) {
	throw new Error('Root element not found')
}

createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<SettingsProvider>
					<AuthProvider>
						<NativeInit />
						<App />
					</AuthProvider>
				</SettingsProvider>
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>,
)
