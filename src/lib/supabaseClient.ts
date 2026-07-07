import { createClient } from '@supabase/supabase-js'
import { isNativeApp } from './platform'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
	console.warn(
		'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local.',
	)
}

export const supabase = createClient(
	supabaseUrl ?? 'https://placeholder.supabase.co',
	supabaseAnonKey ?? 'placeholder-key',
	{
		auth: {
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: true,
			flowType: 'pkce',
		},
	},
)

export function getAuthCallbackUrl(): string {
	if (isNativeApp()) {
		return 'com.testcursor.app://auth/callback'
	}

	return `${window.location.origin}/auth/callback`
}
