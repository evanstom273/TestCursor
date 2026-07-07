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

## Features

- Password and magic-link auth
- Boards, lists, cards, checklists with cloud sync
- Drag-and-drop reordering
- Rich-text card documents (TipTap)
- Export card content to Markdown or PDF (print dialog)
- File attachments: images, documents, audio, video
- Upload limits: images 5MB, docs 10MB, audio 20MB, video 50MB
- PWA: install to home screen on mobile (Add to Home Screen)

## Storage notes

Supabase free tier includes about **1 GB** of file storage. Attachments are private and served via signed URLs.

## PWA install (mobile)

1. Open the app in Safari (iOS) or Chrome (Android)
2. Use **Add to Home Screen** / **Install app**
3. The installed app opens in standalone mode
