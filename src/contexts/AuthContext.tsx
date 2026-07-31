import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getAuthCallbackUrl, isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import type { Profile } from '../types/database'

type AuthResult = {
	error: string | null
}

type AuthContextValue = {
	session: Session | null
	user: User | null
	profile: Profile | null
	loading: boolean
	isConfigured: boolean
	signInWithGoogle: () => Promise<AuthResult>
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchProfile(userId: string): Promise<Profile | null> {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.maybeSingle()

	if (error) {
		console.error('Failed to load profile:', error.message)
		return null
	}

	return data as Profile | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null)
	const [profile, setProfile] = useState<Profile | null>(null)
	const [loading, setLoading] = useState(isSupabaseConfigured)

	useEffect(() => {
		if (!isSupabaseConfigured) {
			return
		}

		let mounted = true

		const loadSession = async () => {
			const {
				data: { session: currentSession },
			} = await supabase.auth.getSession()

			if (!mounted) {
				return
			}

			setSession(currentSession)

			if (currentSession?.user) {
				const nextProfile = await fetchProfile(currentSession.user.id)
				if (mounted) {
					setProfile(nextProfile)
				}
			} else {
				setProfile(null)
			}

			if (mounted) {
				setLoading(false)
			}
		}

		void loadSession()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession)

			if (nextSession?.user) {
				void fetchProfile(nextSession.user.id).then((nextProfile) => {
					if (mounted) {
						setProfile(nextProfile)
					}
				})
			} else {
				setProfile(null)
			}

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
			profile,
			loading,
			isConfigured: isSupabaseConfigured,
			signInWithGoogle: async () => {
				if (!isSupabaseConfigured) {
					return { error: 'Supabase is not configured.' }
				}

				const { error } = await supabase.auth.signInWithOAuth({
					provider: 'google',
					options: {
						redirectTo: getAuthCallbackUrl(),
					},
				})

				if (error) {
					return { error: error.message }
				}

				return { error: null }
			},
			signOut: async () => {
				await supabase.auth.signOut()
			},
		}),
		[session, profile, loading],
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
