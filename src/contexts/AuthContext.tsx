import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react'
import {
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithPopup,
	signOut as firebaseSignOut,
	type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'

type AuthResult = {
	error: string | null
}

type AuthContextValue = {
	user: User | null
	loading: boolean
	isConfigured: boolean
	signInWithGoogle: () => Promise<AuthResult>
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(isFirebaseConfigured)

	useEffect(() => {
		if (!auth) {
			return
		}

		const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
			setUser(nextUser)
			setLoading(false)
		})

		return unsubscribe
	}, [])

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			loading,
			isConfigured: isFirebaseConfigured,
			signInWithGoogle: async () => {
				if (!auth) {
					return { error: 'Firebase is not configured.' }
				}

				const provider = new GoogleAuthProvider()

				try {
					await signInWithPopup(auth, provider)
					return { error: null }
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Sign-in failed.'
					return { error: message }
				}
			},
			signOut: async () => {
				if (!auth) {
					return
				}

				await firebaseSignOut(auth)
			},
		}),
		[user, loading],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext)

	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}

	return context
}
