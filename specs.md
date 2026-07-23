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

---

## i18n: Reemplazar Google Translate con next-intl — 2026-07-23

### Problema

Google Translate traduce toda la página automáticamente, incluyendo nombres propios,
títulos de artículos, nombres de doctores, etc. Llevamos ~60 parches `notranslate`
y siguen apareciendo fugas. Es insostenible.

### Solución

Eliminar Google Translate y su script externo. Reemplazar con `next-intl`, que solo
traduce strings explícitamente definidos en diccionarios. El contenido dinámico
(nombres, títulos, datos de la BD) nunca se traduce por defecto.

Solo dos idiomas: **inglés** (`en`) y **español** (`es`).

### Archivos a crear

| Archivo | Propósito |
|---------|-----------|
| `messages/en.json` | Diccionario inglés (plano, ~80 keys) |
| `messages/es.json` | Diccionario español (mismas keys) |
| `i18n/request.ts` | Config: carga el JSON según locale |
| `src/middleware.ts` | **Reemplazar proxy.ts** — detecta locale del cookie `googtrans` (se conserva) + maneja sesión Supabase |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/app/layout.tsx` | Agregar `NextIntlClientProvider`, `lang` dinámico, eliminar `<TranslateButton>` |
| `src/components/Navbar.tsx` | Migrar `useLanguage()` → `useTranslations("Navbar")` |
| `src/components/Footer.tsx` | Migrar `<T>` → `getTranslations("Footer")` (server component) |
| `src/components/ContactSection.tsx` | Igual + fix error string hardcodeado |
| `src/components/HeroCarousel.tsx` | Migrar |
| `src/components/CookieConsent.tsx` | Migrar |
| `src/components/StatsSection.tsx` | Migrar |
| `src/components/DownloadPopup.tsx` | Migrar |
| `src/components/ReadMagazineButton.tsx` | Migrar |
| `src/components/ArticleContent.tsx` | Migrar |
| `src/app/login/page.tsx` | Migrar |
| `src/app/registro/page.tsx` | Migrar |
| `src/app/our-purpose/OurPurposeContent.tsx` | Migrar |
| `src/app/who-we-are/WhoWeAreContent.tsx` | Migrar |

### Archivos a eliminar

| Archivo | Razón |
|---------|-------|
| `src/lib/useLanguage.ts` | Reemplazado por `useLocale()` / `useTranslations()` |
| `src/components/T.tsx` | Reemplazado por `t("key")` |
| `src/components/TranslateButton.tsx` | Reemplazado por selector de locale sin Google |
| `src/proxy.ts` | Su lógica de Supabase pasa al nuevo `middleware.ts` |
| `src/app/globals.css` | Eliminar bloque `.material-symbols-outlined { visibility: hidden }` y `.fonts-ready` (era FOUT fix para Google Fonts, ya no aplica) — **verificar si sigue siendo necesario** |
| ~60 clases `notranslate` | Ya no existen en las migraciones |

### Dependencias

```bash
npm install next-intl
```

No se eliminan dependencias existentes (Google Translate no era dependencia npm,
era un script externo inyectado).

### Nuevo botón selector de idioma

`<LocaleSwitch />` — reemplaza a `TranslateButton`.
- Sin emojis/flags, solo texto: "EN" / "ES"
- Sin recarga de página (next-intl cambia locale sin reload)
- Sin script externo de Google
- Misma posición (bottom-left fixed)

### Middleware

El `middleware.ts` unifica dos responsabilidades:
1. **i18n**: leer cookie `googtrans`, definir locale, pasar a rutas
2. **Supabase**: refrescar sesión (lo que hacía `proxy.ts`)

Esto evita tener dos archivos de middleware (Next.js solo permite uno).

### Orden de ejecución sugerida

```
1. npm install next-intl
2. Crear messages/en.json + messages/es.json (con todas las keys)
3. Crear i18n/request.ts
4. Crear middleware.ts (unifica i18n + Supabase)
5. Crear LocaleSwitch.tsx
6. Modificar layout.tsx (NextIntlClientProvider, lang dinámico)
7. Migrar componentes uno por uno, compilando/build cada ~3 archivos
8. Eliminar archivos legacy (useLanguage, T, TranslateButton, proxy)
9. npm run build — verificar que compila sin errores
10. Probar local: cambiar idioma, verificar que navegación funciona,
    contenido dinámico sin traducir, auth sin romper
```

### Notas

- El cookie `googtrans=/en/es` se conserva para mantener compatibilidad
  con usuarios que ya lo tienen. El middleware lo lee y lo mapea a locale
  de next-intl.
- next-intl **no necesita rutas con prefijo** (`/es/quienes-somos`).
  El locale se pasa por cookie; next-intl soporta `localeDetection: false`
  en middleware y usa cookie como fuente de verdad.
- Si en el futuro se quiere SEO multilingüe con rutas `/es/...`,
  se puede agregar sin cambiar los mensajes JSON.
