# IKMA Website — AGENTS.md

## Build & dev
```bash
npm run dev      # local dev
npm run build    # production build (runs tsc + next build)
npm run lint     # lint
```

## Stack
- Next.js 14 (App Router)
- Supabase (Postgres, Auth, Storage)
- Vercel (hosting, Hobby plan: 4.5 MB serverless payload limit)
- Material Symbols (Google icons via font)

## Key conventions
- Always use `app/` router — no pages/
- Server components by default; add `"use client"` only when needed
- Tailwind CSS via `className` — no CSS modules
- Images: `next/image` is *not* used; plain `<img>` with Tailwind
- Supabase client: `createClient()` from `@/lib/supabase/server` (server) or `@/lib/supabase/client` (browser)
- Auth: Supabase Auth; admin panel at `/admin` behind middleware

## Upload architecture
Files go through `/api/upload` (returns a signed Supabase upload URL), then client PUTs directly to Supabase Storage. This avoids Vercel's 4.5 MB payload limit.
- `ImageUpload.tsx` — generic image upload (folder: "images")
- `AvatarUpload.tsx` — doctor avatars (folder: "avatars")

## Doctor images
`imagen_url` can be either:
- Full Supabase public URL (new uploads)
- Relative Google AIDA path (older entries)
Use: `url?.startsWith("http") ? url : BASE + url` where `BASE = "https://lh3.googleusercontent.com/aida-public/"`

## Branches
- `main` — production; auto-deploys to Vercel
- Tags: `v1.0`, `v1.1` (MVP milestone)
