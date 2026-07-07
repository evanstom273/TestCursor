import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
	children: ReactNode
	fallback: ReactNode | ((error: Error, retry: () => void) => ReactNode)
}

type ErrorBoundaryState = {
	error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { error: null }

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error }
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		console.error('UI error boundary caught:', error, info.componentStack)
	}

	private retry = (): void => {
		this.setState({ error: null })
	}

	render(): ReactNode {
		const { error } = this.state

		if (error) {
			const { fallback } = this.props

			if (typeof fallback === 'function') {
				return fallback(error, this.retry)
			}

			return fallback
		}

		return this.props.children
	}
}
