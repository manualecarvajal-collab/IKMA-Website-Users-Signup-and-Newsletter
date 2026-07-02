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
- Vercel (hosting, Hobby plan: 4.5 MB serverless payload limit)
- Material Symbols (Google icons via font)

## Key conventions
- Always use `app/` router — no pages/
- Server components by default; add `"use client"` only when needed
- Tailwind CSS via `className` — no CSS modules
- Images: `next/image` is *not* used; plain `<img>` with Tailwind
- Supabase client: `createClient()` from `@/lib/supabase/server` (server) or `@/lib/supabase/client` (browser)
- Auth: Supabase Auth; admin panel at `/admin` behind middleware
- Editor: TipTap (`@tiptap/react`) for rich text editing in admin

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

## Session 2026-06-30 — Password reset, Newsletter CMS, footer fix, Doctors cleanup

### Password reset
- `actions.ts`: `resetPassword()` + `updatePassword()` con validación
- `/actualizar-password` page: intercambia `?code=` via `exchangeCodeForSession()`, confirm password field
- `.env.local` necesita `NEXT_PUBLIC_SITE_URL`

### Footer fix
- `Footer.tsx`: prop `hide` en vez de `isAdmin` — oculto solo en rutas `/admin`
- `layout.tsx`: usa `headers().get("x-invoke-path")` para detectar pathname

### Doctors cleanup
- Link removido del Navbar (`Navbar.tsx`) y sección removida del homepage (`page.tsx`)
- Rutas `/doctores` y admin siguen activas

### Newsletter CMS
- Migration `00010_newsletters.sql` — tabla `newsletters` + RLS admins
- Dependencias: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/pm`
- `TiptapEditor.tsx` — editor WYSIWYG con toolbar + preview via iframe
- `NewsletterList.tsx` — tabla historial con edit/delete
- Pages: `/admin/newsletter` (lista), `/admin/newsletter/nueva` (crear), `/admin/newsletter/[id]/editar` (re-enviar)
- Actions: `sendNewsletter()`, `getNewsletters()`, `getNewsletter()`, `deleteNewsletter()`
- Template: `buildNewsletterHtml()` en `email-template.ts`
- Sidebar: link "Newsletter"

### Relevant files touched
- `supabase/migrations/00010_newsletters.sql` (new)
- `src/components/TiptapEditor.tsx` (new)
- `src/components/NewsletterList.tsx` (new)
- `src/app/admin/newsletter/page.tsx` (new)
- `src/app/admin/newsletter/nueva/page.tsx` (new)
- `src/app/admin/newsletter/[id]/editar/page.tsx` (new)
- `src/app/admin/newsletter/[id]/editar/form.tsx` (new)
- `src/app/actualizar-password/page.tsx` (rewritten)
- `src/lib/email-template.ts` (added buildNewsletterHtml)
- `src/lib/supabase/admin-actions.ts` (added newsletter actions)
- `src/components/Footer.tsx` (isAdmin → hide prop)
- `src/app/layout.tsx` (headers pathname detection)
- `src/components/AdminSidebar.tsx` (added Newsletter link)
- `src/components/Navbar.tsx` (removed Doctors link)
- `src/app/page.tsx` (removed Doctors section)
- `.env.local` (added NEXT_PUBLIC_SITE_URL)

## Session 2026-07-01 — Hero Slide 2 (Francisco Hernández)

### Slide 2 implementation
- Replaced placeholder in `page.tsx` with quote slide: "The root of all diseases… Proverbs 20:27"
- Same layout as slide 1: left content (`md:w-[55%]`) + right image (`md:w-[34%]`)
- Quote marks decorative (same size/peso as slide 1)
- Multi-weight quote text (600/800/600 italic)
- Attribution "FRANCISCO HERNÁNDEZ" uppercase, #717377
- Image pre-flipped at file level (PIL `FLIP_LEFT_RIGHT`) — no CSS `scaleX(-1)` to avoid 1px sub-pixel artifact

### Text sizing
- Quote text: `clamp(13px,1.2vw,19px)` — unified with slide 1 (user request)
- Quote marks: `clamp(48px, 6vw, 90px)` — same as slide 1

### Image container
- Reduced from `md:w-[45%]` to `md:w-[34%]` (25% smaller display area per user request)
- Box-shadow: `-25px 4px 25px 0px #00000033` from Penpot

### 1px border artifact fix
- CSS `scaleX(-1)` + `object-cover` causes sub-pixel 1px line on right edge
- Attempted: container transform, `width: calc(100% + 2px)`, `backfaceVisibility`, `translateZ(0)` — none fully worked
- **Final fix**: pre-flip image at file level (Python PIL), remove all CSS transforms

### Relevant files touched
- `src/app/page.tsx` (slide 2 added, text sizing, image container width)
- `public/images/Francisco 1.png` (pre-flipped via PIL)
