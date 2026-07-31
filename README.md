# TestCursor

A coming soon landing page built with React, TypeScript, and Vite, with Google sign-in via Supabase for cross-device accounts.

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Run the SQL in [`supabase/migrations/001_profiles.sql`](supabase/migrations/001_profiles.sql) in the Supabase SQL editor.
3. In Supabase → Authentication → **Providers**, enable **Google** and add your Google OAuth client ID and secret.
4. In Supabase → Authentication → **URL Configuration**, set:
   - **Site URL** to your deployed URL (e.g. `https://your-app.vercel.app`)
   - **Redirect URLs** to include:
     - `https://your-app.vercel.app/auth/callback`
     - `http://localhost:5173/auth/callback`
5. Copy [`.env.example`](.env.example) to `.env.local` and fill in your project values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

6. Add the same env vars in your Vercel project settings for production deploys.

### Google Cloud Console

When creating OAuth credentials in Google Cloud:

- Application type: **Web application**
- Authorized JavaScript origins: your site URL and `http://localhost:5173`
- Authorized redirect URI: the callback URL shown in Supabase for the Google provider (typically `https://<project-ref>.supabase.co/auth/v1/callback`)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Auth flow

- Users click **Continue with Google** on the landing page
- Supabase handles OAuth and redirects to `/auth/callback`
- A `profiles` row is created automatically for each new user
- Future app features can store per-user data in Supabase, synced across devices via the signed-in account
