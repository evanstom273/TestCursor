# TestCursor

A personal Kanban board app built with React, Vite, TypeScript, and Supabase.

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Run the SQL in [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) in the Supabase SQL editor.
3. Enable **Email** auth in Supabase (Authentication → Providers).
4. In Supabase → Authentication → **URL Configuration**, set:
   - **Site URL** to your Vercel URL (e.g. `https://test-cursor.vercel.app`)
   - **Redirect URLs** to include:
     - `https://your-app.vercel.app/auth/callback`
     - `http://localhost:5173/auth/callback` (for local dev)
5. Copy [`.env.example`](.env.example) to `.env.local` and fill in your project values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Add the same env vars in your Vercel project settings for production deploys.

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

## Features (Phase 1)

- Magic-link email auth
- Boards, lists, and cards with cloud sync
- Drag-and-drop reordering for lists, cards, and checklist items
- Card descriptions and checklists

## Later phases

- File and image attachments (Supabase Storage)
- Rich-text docs with export
- Audio/video attachments
