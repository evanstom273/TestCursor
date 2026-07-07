export function formatAuthError(message: string): string {
	const normalized = message.toLowerCase()

	if (normalized.includes('rate limit') || normalized.includes('429')) {
		return 'Supabase email limit hit (about 2 emails/hour on free tier). Use password sign-in instead, or wait before trying magic links again.'
	}

	if (normalized.includes('invalid login credentials')) {
		return 'Invalid email or password. If you tried magic links earlier, that email may exist without a password — delete it in Supabase → Authentication → Users, then click Create account.'
	}

	if (
		normalized.includes('user already registered') ||
		normalized.includes('already been registered')
	) {
		return 'This email is already registered. Delete the user in Supabase → Authentication → Users, then click Create account again with a password.'
	}

	return message
}

export function getSignUpBlockedMessage(): string {
	return 'Account was created but you are not signed in. In Supabase: turn off Confirm email (Authentication → Providers → Email), delete this user (Authentication → Users), then click Create account again.'
}

export function getExistingEmailMessage(): string {
	return 'This email already exists from earlier login attempts (likely magic links). Delete it in Supabase → Authentication → Users, then click Create account with your password.'
}
