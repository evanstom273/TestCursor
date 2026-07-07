# TestCursor

A personal Kanban board app built with React, Vite, TypeScript, and Supabase.

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Run the SQL in [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) in the Supabase SQL editor.
3. Run the SQL in [`supabase/migrations/002_attachments_and_rich_text.sql`](supabase/migrations/002_attachments_and_rich_text.sql) in the Supabase SQL editor.
4. Confirm the **`card-attachments`** storage bucket exists (migration 002 creates it). In **Storage**, it should be **private**.
5. Enable **Email** auth in Supabase (Authentication → Providers), or use password sign-in with **Confirm email** turned off.
6. In Supabase → Authentication → **URL Configuration**, set:
   - **Site URL** to your Vercel URL (e.g. `https://test-cursor.vercel.app`)
   - **Redirect URLs** to include:
     - `https://your-app.vercel.app/auth/callback`
     - `http://localhost:5173/auth/callback` (for local dev)
     - `com.testcursor.app://auth/callback` (for the Android APK)
7. Copy [`.env.example`](.env.example) to `.env.local` and fill in your project values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

8. Add the same env vars in your Vercel project settings for production deploys.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## App navigation

| Route | Description |
|-------|-------------|
| `/` | Welcome page (logged out) |
| `/home` | Dashboard after sign-in |
| `/boards` | Board list |
| `/boards/:id` | Kanban board |
| `/settings` | Theme, defaults, account, install hints |

Desktop uses a collapsible sidebar; mobile and Android use a bottom tab bar.

## Features

- Password and magic-link auth
- Boards, lists, cards, checklists with cloud sync
- Drag-and-drop reordering
- Rich-text card documents (TipTap)
- Export card content to Markdown or PDF (print dialog)
- File attachments: images, documents, audio, video
- Camera capture on native Android (Capacitor)
- Upload limits: images 5MB, docs 10MB, audio 20MB, video 50MB
- Light/dark theme (Settings)
- Configurable default list columns for new boards
- PWA: install to home screen on mobile (Add to Home Screen)

## Storage notes

Supabase free tier includes about **1 GB** of file storage. Attachments are private and served via signed URLs.

## PWA install (mobile web)

1. Open the app in Safari (iOS) or Chrome (Android)
2. Use **Add to Home Screen** / **Install app**
3. The installed app opens in standalone mode and lands on `/home` when signed in

## Android APK (Capacitor)

The app can be wrapped as a native Android WebView using [Capacitor](https://capacitorjs.com/).

### Prerequisites

- [Android Studio](https://developer.android.com/studio) with Android SDK
- JDK 17+
- Supabase redirect URL `com.testcursor.app://auth/callback` added (see Setup step 6)

### Build workflow

```bash
# Sync web build into the android/ project
npm run build:mobile

# Open in Android Studio
npm run android:open

# Or build and run on a connected device/emulator
npm run android:run
```

### Produce an APK in Android Studio

1. Run `npm run build:mobile`
2. Run `npm run android:open`
3. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. Install the debug APK from `android/app/build/outputs/apk/debug/` on a device

For a release APK, configure signing in Android Studio (**Build → Generate Signed Bundle / APK**). Play Store upload and CI signing are out of scope for this repo.

### Auth in the APK

Magic-link and OAuth flows redirect to `com.testcursor.app://auth/callback`. The app listens for that deep link and routes to `/auth/callback` to complete the Supabase PKCE exchange.

Password sign-in works without redirects.

### Environment variables on device

Capacitor bundles the Vite build at compile time. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` before running `npm run build:mobile`.
