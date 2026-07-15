# IKMA Website — AGENTS.md

## Build & dev
```bash
npm run dev      # local dev
npm run build    # production build (runs tsc + next build)
npm run lint     # lint
```

## Stack
- Next.js 16 (App Router)
- Supabase (Postgres, Auth, Storage)
- Vercel (hosting, Team Pro, dominio: ikmaglobal.com)
- Material Symbols (Google icons via font)

## Key conventions
- Always use `app/` router — no pages/
- Server components by default; add `"use client"` only when needed
- Tailwind CSS via `className` — no CSS modules
- Images: `next/image` is *not* used; plain `<img>` with Tailwind
- Supabase client: `createClient()` from `@/lib/supabase/server` (server) or `@/lib/supabase/client` (browser)
- Auth: Supabase Auth; admin panel at `/admin` behind middleware

## Upload architecture
Files go through `/api/upload` (returns a signed Supabase upload URL), then client PUTs directly to Supabase Storage. This avoids Vercel's serverless payload limit.
- `ImageUpload.tsx` — generic image upload (folder: "images")
- `AvatarUpload.tsx` — doctor avatars (folder: "avatars")

## Knowledge graph
Run `/graphify` in opencode after significant structural changes to regenerate the codebase graph.

## Doctor images
`imagen_url` can be either:
- Full Supabase public URL (new uploads)
- Relative Google AIDA path (older entries)
Use: `url?.startsWith("http") ? url : BASE + url` where `BASE = "https://lh3.googleusercontent.com/aida-public/"`

## Branches
- `main` — production; auto-deploys to Vercel
- Tags: `v1.0`, `v1.1` (MVP milestone)

## Session 2026-06-24 — Security & polish round

### PDF bucket security
- `revistas-pdf` bucket made **private** (was public).
- Migration: `supabase/migrations/00009_revistas_pdf_private.sql` — set bucket private, add RLS policies (subscribers + admins can read).
- Direct PDF links removed from `/revista` and `/revista/[slug]` — `<a>` tags replaced with `<div>`.
- Emails now use signed 7-day PDF URLs via `signedPdfUrl()` helper in `src/lib/supabase/admin-actions.ts`.

### Bug fixes
- `newsletter.ts`: uses `createAdminClient()` instead of regular client (was only returning own profile).
- `getEmailConfig()` in `email-config.ts`: uses `createAdminClient()` (was failing for non-admin users).
- `setSending(sending)` → `setSending(true/false)` typo in `MagazineSendModal.tsx`.
- `deleteArticle`, `deleteDoctor`, `deleteRevista` return types: `Promise<void>`.
- Server-side password validation: ≥8 chars, uppercase+lowercase+digit in `actions.ts`.
- `.env.local` removed from git tracking + added to `.gitignore`.

### Email deduplication
- `src/lib/email-template.ts` — shared `buildMagazineHtml()` for all email sends.

### Footer
- Converted to Server Component; receives `isAdmin` prop instead of `use client` + `usePathname`.

### Performance
- Middleware/proxy: `src/proxy.ts` with `export async function proxy` (Next.js 16 convention).
- `force-dynamic` removed from root layout; pages decide individually.
- `loading="lazy"` added to ~21 `<img>` tags across all pages.
- Hero image: `loading="lazy"` removed, `fetchPriority="high"` added.
- Security headers in `next.config.ts`: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin.
- Image `remotePatterns` configured (Supabase, Unsplash, Google, DiceBear).
- Dashboard batches: `updateUsersBatch` uses single `IN` query instead of N+1.

### Render-blocking fixes
- Google Fonts preload **removed** from layout `<head>` (was render-blocking).
- Material Symbols loaded via `MaterialIcons.tsx` client inject with `media="print"` + `onload`.
- FOUT fix: `globals.css` sets `.material-symbols-outlined { visibility: hidden }`, toggled to `visible` via `.fonts-ready` class on `<html>` when `document.fonts.ready` resolves.

### Image upload resize
- `ImageUpload.tsx` and `AvatarUpload.tsx`: client-side Canvas resize before upload (max 1200px / 600px, JPEG 0.85).

### Page transitions
- No `loading.tsx` (causes Suspense freeze with async server components).
- Instead: CSS `fadeIn` animation on `<main>` in `globals.css` — 0.5s ease-in, no JS, no bundle.

### Relevant files touched
- `supabase/migrations/00009_revistas_pdf_private.sql` (new)
- `src/lib/email-template.ts` (new)
- `src/proxy.ts` (new)
- `src/components/MaterialIcons.tsx` (rewritten)
- `src/app/globals.css` (material icons FOUT + page fade-in)
- `src/app/layout.tsx` (removed preload links, force-dynamic)
- `src/app/revista/page.tsx` (removed PDF <a>)
- `src/app/revista/[slug]/page.tsx` (removed PDF <a>)
- `src/components/ImageUpload.tsx` (added resize)
- `src/components/AvatarUpload.tsx` (added resize)
- `src/components/Footer.tsx` (converted to server component)
- `src/lib/supabase/admin-actions.ts` (added signedPdfUrl)
- `next.config.ts` (security headers + remotePatterns)
- `src/lib/supabase/newsletter.ts` (createAdminClient)
- `src/lib/email-config.ts` (createAdminClient)
- `src/middleware.ts` (removed, replaced by proxy.ts)
- `src/app/admin/users/page.tsx` (batch update)

## Session 2026-07-15 — Vercel Pro migration

### Changes
- Migrated from Hobby → Team Pro, domain `ikmaglobal.com`.
- `vercel.json` created: cleanUrls, trailingSlash:false, Node 20, security headers.
- `layout.tsx`: `metadataBase` → `https://ikmaglobal.com`.
- `next.config.ts`: security headers removed (moved to `vercel.json`).

### External configs to update
- **Google Cloud Console**: Authorized JavaScript origins → add `https://ikmaglobal.com`.
- **Supabase Auth Settings**: Site URL + Redirect URLs → `https://ikmaglobal.com`.
- **Stripe Webhooks**: Endpoint → `https://ikmaglobal.com/api/stripe/webhook`.
- **DNS**: Point `ikmaglobal.com` to Vercel.

### Env vars for new Pro project
Set all env vars from checklist in `specs.md`. `NEXT_PUBLIC_SITE_URL` must be `https://ikmaglobal.com`.

### Relevant files
- `vercel.json` (new)
- `specs.md` (new)
- `src/app/layout.tsx` (metadataBase)
- `next.config.ts` (removed headers)
- `AGENTS.md` (updated stack)
