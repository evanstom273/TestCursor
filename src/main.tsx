import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { NativeInit } from './components/NativeInit.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { SettingsProvider } from './contexts/SettingsContext.tsx'
import { applyTheme, loadSettings } from './lib/settings.ts'
import { initNativeShell } from './lib/nativeShell.ts'
import './index.css'
import './app.css'

initNativeShell()
applyTheme(loadSettings().theme)

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			retry: 2,
			refetchOnWindowFocus: true,
			refetchOnReconnect: true,
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
