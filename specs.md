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

---

## Flujos OTP (newsletter, signup, recuperación) + editor Tiptap robusto — 2026-08-04

### Contexto

Supabase enviaba magic links (URLs) en vez de códigos OTP. Se cambió a códigos
numéricos de 6-8 dígitos y se unificaron los tres flujos en `/verificar-codigo`.

### Templates de email (Supabase Dashboard → Auth → Emails)

- **Confirm signup**: plantilla con `{{ .Token }}` (código) + `{{ .ConfirmationURL }}`
  como fallback de link.
- **Magic Link by Email**: igual, `{{ .Token }}` + `{{ .ConfirmationURL }}`.
- El código funciona para newsletter (`solicitarCodigoNewsletter`) y signup.

### Flujo signup con verificación por código

1. `signup()` en `src/lib/supabase/actions.ts` — si `data.user && !data.session`
   (confirmación pendiente), redirige a `/verificar-codigo?flow=signup&email=...`.
2. `verificarCodigo()` — branch `flow === "signup"`: `verifyOtp({ type: "email" })`
   con fallback a `type: "signup"` → `redirect("/membresia")`.
3. `VerificarCodigoForm.tsx` — soporta `isSignup` y el texto `descriptionSignup`
   (keys añadidas en `messages/en.json` y `messages/es.json`).

### Bug: "please match the same format"

El `pattern="[0-9]{6,8}"` + `maxLength` en el input rechazaba códigos de 8 dígitos
(84870028). Fix: input controlado con `onChange` que filtra no-dígitos
(`replace(/[^0-9]/g, "")`) y `.slice(0, 10)`; sin `pattern` ni `maxLength`.
El server action además sanitiza con `replace(/[^0-9]/g, "")`.

### NewsletterCTA oculto en rutas de auth

Nuevo `src/components/NewsletterCTAWrapper.tsx` que renderiza `NewsletterCTA` salvo en:
`/login`, `/registro`, `/verificar-codigo`, `/recuperar`, `/actualizar-password`,
`/crear-contrasena`, `/auth`. `layout.tsx` lo usa en vez del CTA directo.

### Editor Tiptap: alineación + whitespace preservado

| Archivo | Cambio |
|---------|--------|
| `package.json` | **Nueva dep**: `@tiptap/extension-text-align@^3.27.1` |
| `src/components/TiptapEditor.tsx` | `TextAlign.configure({ types: ["heading","paragraph"], alignments: ["left","center","right","justify"] })`; 4 botones de alineación con estado activo; `whitespace-pre-wrap`; `ToolbarButton` movido fuera del componente (evita "Cannot create components during render") |
| `src/components/ArticleContent.tsx` | `whitespace-pre-wrap` en los 3 divs de contenido |
| `src/components/ArticleForm.tsx` | `whitespace-pre-wrap` en el preview |
| `src/app/globals.css` | CSS `.prose` custom: `p { margin: 0 0 1.25em }`, `p:empty { height: 1.25em }`, márgenes h1-h3, ul/ol/li, img, `a`, blockquote |

### Notas

- `@tailwindcss/typography` **NO está instalado** — las clases `prose` son no-ops;
  el espaciado real viene del CSS `.prose` custom en globals.css.
- Causa raíz de párrafos pegados: Tailwind Preflight elimina márgenes de `<p>` y los
  `<p></p>` vacíos colapsan a 0 de altura. El CSS custom los restaura.
- Prettier formatea mal los párrafos con `whitespace-pre-wrap`; los autores deben
  evitar saltos de línea por tema.

### Knowledge graph

Grafo regenerado (2026-08-04): 605 nodos, 1012 edges, 55 comunidades.
Nuevos nodos: `ToolbarButton()`, `NewsletterCTA`, `GroupFreeToggle`,
`CrearContrasenaForm()`, `crearContrasena()`, `EventsPage`, foto Dalia.

---

## Verificación de membresías + fix upload-license — 2026-08-06

### Verificación de BD (migraciones 00001–00029) — PRODUCCIÓN

Confirmado contra la BD real con service role (solo lectura) + SQL editor:

- `solicitudes_membresia`: 24 columnas ✓, unique `username` ✓ (test de insert duplicado → 409),
  trigger `set_updated_at_membresia` ✓ (updated_at cambia tras UPDATE)
- 3 policies RLS (SELECT usuario-propio + SELECT/UPDATE admin) ✓
- `perfiles`: `stripe_customer_id`, `newsletter_optout`, `membresia_gratis` ✓
- `grupos.gratis` ✓ · bucket `membership-licenses` privado (10MB, pdf/jpeg/png) ✓
- 9 índices (00026 + 00012 + 00013) ✓

### Endpoints (producción, verificado en vivo)

| Endpoint | Estado |
|---|---|
| `POST /api/upload-license` sin sesión | 401 ✓ |
| `POST /api/stripe/membership-checkout` sin sesión | 401 ✓ |
| `POST /api/stripe/webhook` sin firma | 400 ✓ |

### Fix: `/api/upload-license` bloqueaba a solicitantes no-admin

- **Bug**: el endpoint exigía `rol === "administrador"` (403), pero quien sube su
  licencia es el miembro solicitante (tipo 1) desde el formulario.
- **Fix**: cualquier usuario autenticado puede pedir un signed upload URL; la ruta
  es aleatoria y el endpoint solo la emite (no lista/lee el bucket).
- Desplegado en producción; verificado 401 sin sesión.

### Hero / CTAs (despliegue 2026-08-06)

- Desktop CTA: "Become a member today" (antes "Subscribe to our Newsletter").
- Mobile CTA: "Sign up" (antes "Newsletter"). Cambios solo en `messages/*.json`.

---

## Membresía de estudiante con revisión manual — 2026-08-06

### Objetivo

La membresía de estudiante (tipo 3, gratuita) dejó de activarse automáticamente.
El usuario registra → verifica OTP → llena un **formulario nuevo de estudiante** → ve una
pantalla de "gracias / en revisión". No tiene acceso hasta que el admin lo apruebe.

### Flujo de usuario

1. Registro (`/registro?tipo=3`) → OTP (`/verificar-codigo`) → `/membresia/estudiante`.
2. Formulario nuevo (solo 6 campos): País de residencia · Nombre de la Universidad ·
   Carrera · Año de ingreso · Año de egreso · Teléfono. (Nombre y email ya existen.)
3. Al enviar → `submitStudentMembership()` crea/actualiza la solicitud con
   `estado = "pendiente"` (en revisión), **sin** activar `membresia_gratis`.
4. Envía correo de bienvenida (Resend) con disclaimer de revisión, en el idioma del
   usuario (EN/ES).
5. Redirige a `/membresia/estudiante/gracias` (mensaje de agradecimiento).
6. El usuario puede iniciar sesión; navega como visitante (proxy ya no lo redirige)
   hasta que el admin apruebe.

### Admin (panel Miembros)

- Lista (`/admin/members`): para filas tipo 3, el badge de estado se reemplaza por un
  botón dropdown `MemberStatusSelect.tsx`:
  - estado por defecto: **"En revisión"** (estado `pendiente`)
  - opciones desde "En revisión": **Aprobado** (→`aprobada`) / **Negado** (→`rechazada`)
  - después de decidir solo permite alternar entre Aprobado/Negado.
- Detalle (`/admin/members/[id]`): nueva sección "Student Information" con universidad,
  carrera, año de ingreso y año de egreso.
- `approveMembership` (tipo 3) → `membresia_gratis = true`; `rejectMembership` (tipo 3) →
  `membresia_gratis = false` (revoca el acceso si se niega una ya aprobada).

### Migración 00030 (`00030_student_manual_review.sql`)

```sql
alter table public.solicitudes_membresia add column if not exists universidad text;
alter table public.solicitudes_membresia add column if not exists carrera text;
alter table public.solicitudes_membresia add column if not exists anio_ingreso int;
alter table public.solicitudes_membresia add column if not exists anio_egreso int;
```

### Archivos

| Archivo | Cambio |
|---|---|
| `supabase/migrations/00030_student_manual_review.sql` | **Nuevo** — 4 columnas académicas |
| `src/app/membresia/estudiante/page.tsx` | **Nuevo** — página del formulario (redirect si no user / si ya aprobado / si pendiente) |
| `src/app/membresia/estudiante/StudentForm.tsx` | **Nuevo** — formulario (6 campos) → `submitStudentMembership` |
| `src/app/membresia/estudiante/gracias/page.tsx` | **Nuevo** — pantalla "gracias / en revisión" |
| `src/app/admin/members/MemberStatusSelect.tsx` | **Nuevo** — botón 3 estados (dropdown) |
| `src/lib/supabase/membresia-actions.ts` | `submitStudentMembership` nuevo; `submitMembership` ya no auto-activa tipo 3; se elimina `grantFreeMembership` |
| `src/lib/supabase/email-actions.ts` | `sendStudentWelcomeEmail` nuevo |
| `src/lib/email-template.ts` | `buildStudentWelcomeHtml` nuevo (EN/ES + disclaimer) |
| `src/lib/supabase/memberships-actions.ts` | `rejectMembership` revoca `membresia_gratis` en tipo 3 (toggle) |
| `src/lib/supabase/actions.ts` | signup/verificardirige tipo 3 → `/membresia/estudiante` |
| `src/app/registro/page.tsx`, `src/app/membresia/page.tsx`, `MembershipForm.tsx` | tipo 3 → `/membresia/estudiante` |
| `src/proxy.ts` | Estudiante pendiente/rechazado navega como invitado (sin redirigir a /membresia) |
| `src/app/admin/members/page.tsx` | Dropdown en filas tipo 3; botones approve/reject solo para no-estudiantes |
| `src/app/admin/members/[id]/page.tsx` | Sección "Student Information" |
| `messages/en.json`, `messages/es.json` | Namespace `StudentMembership` |

### Notas

- Acceso de estudiante = `membresia_gratis` (mirror en `perfiles`) y la solicitud
  `tipo 3` con estado `aprobada`; esto ya alimenta `esMembresiaGratisUsuario` para el
  acceso a revista/videos gratuitos.
- Pendiente opcional: correo al aprobar/negar (hoy solo se envía el de bienvenida).

### Despliegue y ajustes post-migración (2026-08-06)

- Migración 00030 **aplicada en producción** (SQL editor). Verificado vía PostgREST:
  `solicitudes_membresia` tiene `universidad`, `carrera`, `anio_ingreso`, `anio_egreso`.
- Desplegado vía `vercel --prod` → alias `https://www.ikmaglobal.com`.
  Verificado en vivo: `/membresia/estudiante` y `/membresia/estudiante/gracias` responden 200.

#### Región en el formulario de estudiante

- El formulario de estudiante ahora pide elegir región (**A o B**) antes del país.
- `StudentForm.tsx`: selector `region` (A/B) → se pasa a `submitStudentMembership`.
- `submitStudentMembership` valida `region` contra `REGIONES_VALIDAS = ["A", "B"]`
  (antes forzaba `"A"`); se guarda en la columna `region` ya existente (sin migración).
- `messages/en.json` + `es.json`: claves `region`, `selectRegion`, `regionAOpt`, `regionBOpt`
  en namespace `StudentMembership`.

#### `/suscripcion-exito` — quitar descripción

- Se eliminó el párrafo `description` (EN y ES) del namespace `SubscriptionSuccess`;
  ahora es string vacío y no se renderiza nada.

#### Panel admin Membresos — secciones retiradas

- `/admin/members/[id]` ya no muestra las secciones **"Professional Information"** ni
  **"Address"**. Se eliminó `signedLicenseUrl`/`licenciaUrl` (código muerto).
- El detalle queda: Membership → Student Information → Personal Details → Timestamps.

---

## Sistema de cobro (Stripe embedded checkout) — 2026-08-11

### Arquitectura general

Stripe **Embedded Checkout** (`stripe.createEmbeddedCheckoutPage({ clientSecret })` +
`.mount("#...")`) montado **inline dentro de la página** — el usuario nunca sale del sitio.
No hay formulario de tarjeta propio: lo renderiza el iframe de Stripe (email, número,
expiración, CVC, datos de facturación, botón Pay).

### Flujo de donaciones (`/donate`)

| Archivo | Rol |
|---|---|
| `src/app/donate/page.tsx` | Selección de monto → redirige a `/donate/checkout?amount=X` |
| `src/app/donate/checkout/page.tsx` | Pestañas Card/Zelle; monta el checkout embebido en `#donation-checkout` al cargar |
| `src/app/api/stripe/donation-checkout/route.ts` | Crea sesión: `mode: "payment"`, `ui_mode: "embedded_page"`, `price_data` directo (sin price ID), `return_url: /donate/checkout?donation=success` |

- La sesión se crea **en el useEffect del componente** (el monto viene en la URL), guard
  `mounted` ref para no recrearla.
- Zelle: panel púrpura con QR + datos de transferencia + botón "I've sent the payment"
  → pantalla de gracias local (sin sesión Stripe).

### Flujo de membresía — paso 3 (`/membresia`)

| Archivo | Rol |
|---|---|
| `src/app/membresia/MembershipForm.tsx` | `startCardCheckout()` + effect de auto-montaje; pestañas Card/Zelle |
| `src/app/api/stripe/membership-checkout/route.ts` | Sesión: `mode: "subscription"`, `ui_mode: "embedded_page"`, `price` desde `PRICE_IDS` (live, `src/app/membresia/data.ts`), `return_url: /suscripcion-exito`, metadata `user_id` + `solicitud_id` |
| `src/app/api/stripe/webhook/route.ts` | Marca la solicitud "pagada" y guarda `stripe_customer_id` al completarse la sesión |
| `src/app/suscripcion-exito/page.tsx` | Página de éxito (return_url) |

**Auto-montaje (diferencia clave con donaciones)** — la sesión Stripe necesita una
solicitud (con región y tarifa) ya creada, así que:
1. Al entrar al paso 3 con la pestaña Card y `price > 0`, el effect automáticamente:
   `submitFormData("card")` (upsert de la solicitud — `submitMembership` reutiliza la
   pendiente/rechazada existente) → `POST /api/stripe/membership-checkout` → monta el
   checkout en `#membership-checkout`.
2. Si cambia el **plan de pago** (1/2/3 pagos) o el **precio** (cambio de región en paso 2),
   la sesión se destruye (`checkout.destroy()`) y se recrea con `clientSecret` nuevo.
3. Al salir del paso 3 (volver atrás), el checkout se destruye; al volver a entrar se
   remonta automáticamente.
4. Con `price === 0` (URL directa `?step=3` sin región/tipo) NO se crea sesión — el panel
   muestra un aviso ámbar pidiendo seleccionar región. El botón de pago se oculta.
   **Gotcha histórico**: el montaje en un contenedor `display:none` deja el iframe vacío;
   el div del checkout debe estar visible al llamar `mount()`.

**Zelle (membresía)**: pestaña Zelle → QR + instrucciones + campo obligatorio del email
del remitente → `submitFormData("zelle", email)` (envía correo de "en procesamiento") →
paso 4 (confirmación local).

### Pestañas Card/Zelle (estilo compartido con donaciones)

Tabs píldora (`rounded-full`, activo `bg-primary`), paneles en `[grid-area:1/1]` con
`invisible` para mantener ambos montados (preserva estado del input Zelle y del iframe).

### Webhook (`/api/stripe/webhook`)

| Evento | Acción |
|---|---|
| `checkout.session.completed` | `solicitudes_membresia.estado → "pagada"` (via metadata `solicitud_id`), `perfiles.stripe_customer_id = session.customer`, correo de pago confirmado (Resend) |
| `invoice.payment_succeeded` | `perfiles.suscripcion_activa = true` (renovaciones de suscripción) |
| `customer.subscription.deleted` | `perfiles.suscripcion_activa = false` |

### Datos de precios (live, 2026-08)

- `pricingMatrix`: región A → tipos {1: $60, 2: $50, 4: $50}; región B → {1: $150, 2: $100, 4: $100}. Tipo 3 (estudiante) es gratis y usa su propio formulario.
- Los montos de las **cuotas** (2 o 3 pagos) se calculan en el cliente (`price / option`),
  pero Stripe cobra los **price IDs por cuota** (`PRICE_IDS[tipo][region][option]`, modo
  suscripción: 1 pago/año, 2 cuotas/6 meses, 3 cuotas/4 meses).

### Validación año de graduación (paso 1)

- Obligatorio para tipos 1 y 2: `goToStep(2)` bloquea con "Please select your graduation
  year to continue." si `form.gradYear` está vacío. Tipos 3 y 4 no muestran el campo.
