# TestCursor

A coming soon landing page built with React, TypeScript, and Vite, with Google sign-in via Firebase for cross-device accounts.

## Setup

1. Create a [Firebase](https://firebase.google.com) project.
2. In Firebase → **Build** → **Authentication**, enable the **Google** sign-in provider.
3. In Firebase → **Project settings** → **Your apps**, register a **Web** app and copy the config values.
4. Copy [`.env.example`](.env.example) to `.env.local` and fill in your Firebase config:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

5. Add the same env vars in your Vercel project settings for production deploys.
6. In Firebase Authentication → **Settings** → **Authorized domains**, add your production domain.

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
- Firebase opens a Google sign-in popup
- The session persists in the browser and syncs across devices when the same Google account is used
- Future features can store per-user data in Firestore using the signed-in user's UID
