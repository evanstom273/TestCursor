import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, getAuthCallbackUrl } from '../lib/supabaseClient'

type AuthContextValue = {
	session: Session | null
	user: User | null
	loading: boolean
	signInWithEmail: (email: string) => Promise<{ error: string | null }>
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true

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

				return { error: error?.message ?? null }
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
