import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import {
	formatAuthError,
	getExistingEmailMessage,
	getSignUpBlockedMessage,
} from '../lib/authErrors'
import { supabase, getAuthCallbackUrl } from '../lib/supabaseClient'

type AuthResult = {
	error: string | null
	success?: boolean
}

type AuthContextValue = {
	session: Session | null
	user: User | null
	loading: boolean
	signInWithEmail: (email: string) => Promise<AuthResult>
	signInWithPassword: (email: string, password: string) => Promise<AuthResult>
	signUpWithPassword: (email: string, password: string) => Promise<AuthResult>
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true
		const loadingTimeout = window.setTimeout(() => {
			if (mounted) {
				setLoading(false)
			}
		}, 8_000)

		supabase.auth.getSession().then(({ data }) => {
			if (mounted) {
				setSession(data.session)
				setLoading(false)
			}
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession)
			setLoading(false)
		})

		return () => {
			mounted = false
			window.clearTimeout(loadingTimeout)
			subscription.unsubscribe()
		}
	}, [])

	const value = useMemo<AuthContextValue>(
		() => ({
			session,
			user: session?.user ?? null,
			loading,
			signInWithEmail: async (email: string) => {
				const { error } = await supabase.auth.signInWithOtp({
					email,
					options: {
						emailRedirectTo: getAuthCallbackUrl(),
					},
				})

				if (error) {
					return { error: formatAuthError(error.message) }
				}

				return { error: null, success: true }
			},
			signInWithPassword: async (email: string, password: string) => {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password,
				})

				if (error) {
					return { error: formatAuthError(error.message) }
				}

				return { error: null, success: true }
			},
			signUpWithPassword: async (email: string, password: string) => {
				const { data, error } = await supabase.auth.signUp({
					email,
					password,
				})

				if (error) {
					return { error: formatAuthError(error.message) }
				}

				if (data.user?.identities?.length === 0) {
					return { error: getExistingEmailMessage() }
				}

				if (!data.session) {
					return { error: getSignUpBlockedMessage() }
				}

				return { error: null, success: true }
			},
			signOut: async () => {
				await supabase.auth.signOut()
			},
		}),
		[session, loading],
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
