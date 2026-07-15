# IKMA Website — Specs

## Vercel Pro Migration — 2026-07-15

### Plan

Migración de Vercel Hobby → Team Pro con dominio `ikmaglobal.com`.

### Cambios en código

| Archivo | Cambio |
|---|---|
| `vercel.json` | **Nuevo** — cleanUrls, trailingSlash:false, Node 20, security headers |
| `src/app/layout.tsx` | `metadataBase` → `https://ikmaglobal.com` |
| `next.config.ts` | Security headers eliminados (duplicados, pasan a `vercel.json`) |

### Checklist de migración

**1. Google Cloud Console — OAuth 2.0**
- Authorized JavaScript origins: cambiar a `https://ikmaglobal.com`
- Authorized redirect URIs: sin cambios (apunta a Supabase)

**2. Supabase Dashboard → Auth → Settings**
- Site URL: `https://ikmaglobal.com`
- Redirect URLs: incluir `https://ikmaglobal.com/**`

**3. Vercel Team Pro**
- Crear project desde el repo
- Agregar dominio `ikmaglobal.com`
- Variables de entorno:

  | Variable | Dónde obtener |
  |---|---|
  | `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` |
  | `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` |
  | `NEXT_PUBLIC_SITE_URL` | **Nuevo valor: `https://ikmaglobal.com`** |
  | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Dashboard Stripe |
  | `STRIPE_SECRET_KEY` | Dashboard Stripe |
  | `STRIPE_PRICE_ID` | Dashboard Stripe |
  | `STRIPE_WEBHOOK_SECRET` | Dashboard Stripe |
  | `RESEND_API_KEY` | Dashboard Resend |

**4. Stripe**
- Webhook endpoint → `https://ikmaglobal.com/api/stripe/webhook`

**5. DNS**
- Apuntar `ikmaglobal.com` a Vercel

### Link local al proyecto

```bash
npx vercel link      # vincula el proyecto local al Team Pro
```

### Orden de ejecución

```
cambios en código → deploy a Hobby (verificar) → migrar a Team Pro
→ configurar dominio → reingresar env vars → deploy a Pro → verificar auth
```

### Knowledge graph

El grafo del código se regenera con `/graphify` en opencode después de cambios significativos en la estructura del proyecto. Ejecutar después de esta migración.
