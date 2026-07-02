# IKMA Website — Contexto Completo del Proyecto

## Descripción General

Sitio web de **International Kingdom Medical Association (IKMA)**, una asociación médica con enfoque de fe. Incluye secciones públicas (inicio, quiénes somos, doctores, revista/blog, contacto) y un panel de administración (CMS) para gestionar contenido, usuarios y envío de revistas por email.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript 5 |
| **Estilos** | Tailwind CSS v4 (configuración en `globals.css` vía `@theme inline`) |
| **Base de datos** | Supabase (PostgreSQL) con RLS |
| **Autenticación** | Supabase Auth (email/password) |
| **Almacenamiento** | Supabase Storage (imágenes, PDFs) |
| **Pagos** | Stripe (Checkout + Webhooks) |
| **Email** | Resend (newsletters, envío de revistas) |
| **3D** | Three.js + @react-three/fiber + drei (esfera wireframe en hero) |
| **Hosting** | Vercel (Hobby plan, límite 4.5 MB payload serverless) |
| **Monitoreo** | Vercel Speed Insights |

---

## Variables de Entorno

| Variable | Propósito |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service_role (bypass RLS) |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio para redirects |
| `RESEND_API_KEY` | API key de Resend para envío de emails |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secreto para validar webhooks de Stripe |
| `STRIPE_PRICE_ID` | ID del precio/suscripción en Stripe |

---

## Base de Datos — Tablas (esquema público)

### `perfiles` — Perfiles de usuario
| Columna | Tipo | Default | Notas |
|---|---|---|---|
| `id` | uuid PK | — | FK → `auth.users` ON DELETE CASCADE |
| `nombre_completo` | text | — | |
| `rol` | text | `'lector'` | Check: `'lector'`, `'autor'`, `'administrador'` |
| `suscripcion_activa` | boolean | `false` | |
| `updated_at` | timestamptz | `now()` | |
- **Trigger:** `handle_new_user()` crea automáticamente un perfil al registrarse
- **RLS:** usuarios ven/editan su propio perfil; admins tienen acceso total vía service_role

### `articulos` — Artículos/Revista
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `titulo` | text NOT NULL | |
| `slug` | text NOT NULL UNIQUE | Generado automáticamente |
| `contenido_html` | text | |
| `resumen` | text | |
| `categoria` | text | |
| `imagen_url` | text | |
| `url_pdf_storage` | text | PDF asociado |
| `publicado` | boolean | Default `false` |
| `autor_nombre` | text | Añadido en migración 004 |
| `autor_avatar_url` | text | Añadido en migración 004 |
| `fecha_publicacion`, `created_at`, `updated_at` | timestamptz | |

### `doctores` — Perfiles de doctores
| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigint PK | `generated always as identity` |
| `nombre` | text NOT NULL | |
| `especialidad_principal` | text NOT NULL | |
| `frase`, `acerca_de` | text | |
| `imagen_url` | text | URL completa o path relativo a Google AIDA |
| `estadisticas` | jsonb | `{experience, patients, awards, publications}` |
| `rating` | numeric(2,1) | |
| `num_resenas` | integer | |
| `especialidades`, `idiomas` | text[] | |
| `disponibilidad`, `hospital`, `direccion` | text | |
| `experiencia`, `educacion`, `certificaciones`, `premios`, `testimonios` | jsonb | Arrays de objetos |
| `publicado` | boolean | Default `false` |
| `created_at`, `updated_at` | timestamptz | |

### `revistas` — Revistas/Magazines
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `titulo` | text NOT NULL | |
| `descripcion` | text | |
| `archivo_url` | text NOT NULL | URL del PDF en Storage |
| `imagen_portada` | text | |
| `publicado` | boolean | Default `false` |
| `fecha_publicacion`, `created_at`, `updated_at` | timestamptz | |

### `app_config` — Configuración del sistema
| Columna | Tipo |
|---|---|
| `key` | text PK |
| `value` | text NOT NULL |

**Valores por defecto:** `email_from_name='IKMA'`, `email_from_email='onboarding@resend.dev'`, `email_subject_template='New Magazine: {{titulo}}'`

### `newsletters` — Newsletters enviados
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `titulo` | text NOT NULL | |
| `contenido_html` | text NOT NULL | HTML generado por editor TipTap |
| `imagen_url` | text | Banner image opcional |
| `enviado_por` | uuid | FK → `auth.users` |
| `destinatarios` | integer | Cantidad de emails enviados exitosamente |
| `created_at` | timestamptz | Default `now()` |
- **RLS:** solo admins pueden leer/insertar/eliminar

---

## Buckets de Storage

| Bucket | Propósito | Público |
|---|---|---|
| `doctor-images` | Imágenes de doctores | Sí |
| `article-images` | Imágenes de artículos | Sí |
| `revistas-pdf` | PDFs de revistas | Sí |

**Políticas:** autenticados pueden subir/eliminar sus propios archivos; lectura pública.

---

## Clientes de Supabase

### `src/lib/supabase/server.ts`
- `createClient()` → SSR client (`@supabase/ssr`) con manejo de cookies
- `createAdminClient()` → Client con `service_role` key (bypass RLS, sin sesión)

### `src/lib/supabase/client.ts`
- `createClient()` → Browser client (`@supabase/ssr`)

### `src/proxy.ts`
Middleware que refresca cookies de autenticación en cada request. No hay `middleware.ts` en el proyecto.

---

## Arquitectura de Upload (bypass límite 4.5MB de Vercel)

1. Cliente POST a `/api/upload` (o `/api/upload-pdf`) con `{ name, type, folder? }`
2. Servidor usa `service_role` para crear `signedUploadUrl` en Supabase Storage
3. Servidor devuelve `{ signedUrl, publicUrl }`
4. Cliente hace PUT directamente a `signedUrl`
5. Se guarda `publicUrl` en el formulario/hidden input

**Componentes de upload:**
- `ImageUpload.tsx` → genérico (drag & drop, folder: "images")
- `AvatarUpload.tsx` → avatares de autor (folder: "avatars")
- `PdfUpload.tsx` → PDFs de revistas

---

## Autenticación y Roles

- Registro via `signup()` → Supabase Auth + trigger crea perfil con `rol='lector'`
- Login via `login()` → Supabase Auth email/password
- Roles: `lector` (default), `autor`, `administrador`
- Protección admin en `src/app/admin/layout.tsx`: verifica `rol === 'administrador'` y redirige si no
- Cada server action en `admin-actions.ts` llama a `checkAdmin()` al inicio
- Navbar detecta rol para mostrar link "Admin"

---

## Sistema de Suscripción

- **Paywall temporal:** página `/suscripcion-exito` → `ActivateSubscription.tsx` → `activateSubscription()` → setea `suscripcion_activa = true`
- **Stripe (producción):** `/api/stripe/checkout` crea sesión de checkout → webhook setea `suscripcion_activa = true`
- **Control de acceso:** `/api/download` verifica `suscripcion_activa` antes de redirigir a PDF firmado (60s)
- **ArticleContent.tsx:** usuarios no autenticados ven solo 1 párrafo + blur + CTA a registro

---

## Sistema de Mailing (Resend)

### Email config
- `getEmailConfig()` lee `app_config` (from_name, from_email, subject_template)
- `sendEmail()` helper que formatea el from y llama a la API de Resend

### Envío individual de revista
`sendMagazineToEmail(revistaId, userId)` → verifica suscripción activa → envía email con plantilla HTML profesional (portada, descripción, botón de descarga)

### Envío masivo de revista
`sendMagazineToSubscribers(revistaId, excludeEmails[])` → obtiene suscriptores activos → filtra excluidos → envía uno por uno vía Resend

### Modal de envío (`MagazineSendModal.tsx`)
- Búsqueda por nombre/email
- Lista de suscriptores con exclusión temporal por email
- Botón "Send Now" con confirmación

### Sistema de Newsletter (CMS)
- Tabla `newsletters` almacena historial de envíos (título, HTML, imagen, destinatarios, fecha)
- Editor WYSIWYG TipTap con toolbar (Bold, Italic, H2, H3, listas, link, imagen)
- Preview en tiempo real del email tal como lo ve el suscriptor
- Subida de imagen banner para la cabecera del email
- Server actions en `admin-actions.ts`: `sendNewsletter()`, `getNewsletters()`, `getNewsletter()`, `deleteNewsletter()`
- Template `buildNewsletterHtml()` en `email-template.ts` con diseño IKMA
- Envío a todos los `suscripcion_activa = true`
- Botón "Send a Newsletter" en la lista + re-envío desde historial (edit & re-send)

---

## Panel de Administración (CMS)

### Rutas admin
| Ruta | Propósito |
|---|---|
| `/admin` | Dashboard con tarjetas + "Manage" |
| `/admin/articulos` | CRUD artículos |
| `/admin/doctores` | CRUD doctores |
| `/admin/revistas` | CRUD revistas + envío masivo |
| `/admin/suscriptores` | Gestión de usuarios y suscripciones |
| `/admin/newsletter` | Lista de newsletters enviados |
| `/admin/newsletter/nueva` | Crear y enviar nueva newsletter |
| `/admin/newsletter/[id]/editar` | Editar y re-enviar newsletter existente |

### Funcionalidades del Dashboard
- 4 tarjetas (Articles, Doctors, Magazines, Users) con contadores + link "Manage"
- La tarjeta de Users muestra Paid Subscribers vs Free Users

### Gestión de Usuarios (`UserManagementTable.tsx`)
- Tabla responsive con toggle de suscripción
- Guardado en lote ("Save Changes") con detección de cambios pendientes
- Alerta `beforeunload` si hay cambios sin guardar
- Eliminación de cuenta (confirmación + delete de Auth y perfil)
- **Protección de admins:** no se puede eliminar ni cambiar suscripción de usuarios admin
- Admin badge en lugar de toggle para usuarios `rol === 'administrador'`

### Componentes del CMS
- **ArticleForm.tsx** — Formulario con ImageUpload, AvatarUpload, slug automático
- **DoctorForm.tsx** — Formulario grande con DynamicListEditor (experiencia, educación, certificaciones, premios, testimonios)
- **MagazineForm.tsx** — Formulario con ImageUpload + PdfUpload
- **ToggleStatus.tsx** — Select Published/Draft
- **DeleteButton.tsx** — Botón genérico con confirmación
- **ListFilters.tsx** — Filtros por status y orden
- **SendMagazineButton.tsx** — Gatilla MagazineSendModal
- **DynamicListEditor.tsx** — Editor genérico de arrays JSON (tabla/cards)
- **TiptapEditor.tsx** — Editor WYSIWYG TipTap con toolbar (Bold, Italic, H2, H3, listas, link, image)
- **NewsletterList.tsx** — Tabla de newsletters enviados con acciones edit/delete

---

## Navegación Pública

### Navbar (`Navbar.tsx`)
- Links: Home, About Us, Blog, Contact (Doctors oculto del navbar)
- Desktop: botones Login/Sign up o email/Sign out + Support Now
- Mobile: menú hamburguesa con todos los links + Admin si aplica
- **Oculto en rutas `/admin`**

### Footer (`Footer.tsx`)
- Logo, descripción, links legales y de recursos
- **Oculto en rutas `/admin`** (basado en pathname, no en rol de usuario)

### Admin Sidebar (`AdminSidebar.tsx`)
- Sidebar desktop con Dashboard, Articles, Doctors, Magazines, Newsletter
- Mobile: navbar superior con "Back" (variable según ruta) + hamburguesa
- Botón "Back to Site" (en dashboard) o "Back to Dashboard" (en sub-páginas)

---

## API Routes

| Ruta | Método | Propósito |
|---|---|---|
| `/api/upload` | POST | Signed URL para imágenes (valida `image/*`) |
| `/api/upload-pdf` | POST | Signed URL para PDFs (valida `application/pdf`) |
| `/api/download` | GET | Descarga PDF protegido (auth + suscripción requerida) |
| `/api/auth/signout` | GET | Logout + limpieza de cookies |
| `/api/stripe/checkout` | POST | Crea sesión Stripe Checkout |
| `/api/stripe/webhook` | POST | Webhook Stripe (activa suscripción) |

---

## Páginas Públicas

| Ruta | Descripción |
|---|---|
| `/` | Hero con 3D, artículos destacados |
| `/about` | Misión, visión, valores, estadísticas animadas, junta directiva |
| `/contacto` | Formulario de contacto (no funcional), información |
| `/login` | Inicio de sesión |
| `/registro` | Registro de usuario |
| `/recuperar` | Solicitar restablecimiento de contraseña |
| `/actualizar-password` | Establecer nueva contraseña (link del email) |
| `/suscripcion-exito` | Página de agradecimiento (activa suscripción automáticamente) |
| `/doctores` | Lista de doctores con filtro por especialidad |
| `/doctores/[id]` | Perfil detallado de doctor |
| `/revista` | Lista de artículos y revistas |
| `/revista/[slug]` | Artículo completo (con paywall para no autenticados) |

---

## Convenciones de Código

- **Server Components por defecto** — solo usar `"use client"` cuando es necesario
- **Tailwind v4** — sin CSS modules, tema en `@theme inline` en `globals.css`
- **Imágenes** — `<img>` con Tailwind (no `next/image` salvo en logo del Navbar)
- **Iconos** — Material Symbols Outlined (vía Google Fonts CDN)
- **Tipografía** — Montserrat (variable `--font-montserrat`)
- **Rutas admin** — layouts separados con verificación de rol
- **Doctor images** — `imagen_url` puede ser URL completa (http) o path relativo a Google AIDA (`BASE + url` con `BASE = "https://lh3.googleusercontent.com/aida-public/"`)
- **Server Actions** — todas en `admin-actions.ts` con `"use server"` y `checkAdmin()`

---

## Errores Conocidos y Soluciones

### Resueltos
1. **Vercel payload limit (4.5 MB):** Se implementó arquitectura de upload con signed URLs (cliente → API → signed URL → cliente PUT directo a Storage)
2. **TypeScript en consultas SQL:** Se resolvieron errores de tipado en migraciones para builds exitosos en Vercel
3. **Stripe API no disponible temporalmente:** Se implementó paywall manual via `/suscripcion-exito` + `ActivateSubscription`
4. **Pérdida de datos en batch editing:** Se agregó `beforeunload` alert + detección de cambios pendientes
5. **Eliminación de admins:** Se agregó protección en frontend y backend para evitar borrar usuarios admin
6. **Botón "Back" inconsistente:** Se hizo dinámico según ruta (dashboard → "Back to Site" a `/`, sub-páginas → "Back to Dashboard" a `/admin`)
7. **Password reset:** Se agregó `NEXT_PUBLIC_SITE_URL` a `.env.local`, se añadió `exchangeCodeForSession` en la página `/actualizar-password`, campo confirm password con validación client-side
8. **Footer oculto en todo el sitio para admins:** Cambiado de `isAdmin` (rol) a `hide` basado en pathname, solo se oculta en rutas `/admin`
9. **Doctors removido del navbar y homepage:** Links eliminados pero rutas y admin siguen funcionando

### Pendientes / Consideraciones
- **Stripe webhook:** success_url apunta a `/suscripcion/exito` (ruta incorrecta, debería ser `/suscripcion-exito`)
- **cancel_url:** apunta a `/suscripcion/cancelar` (ruta no implementada)
- **No hay tipos generados de Supabase:** las interfaces se definen inline
- **No hay middleware.ts:** la auth se maneja en layouts y server actions
- **Contact form:** no es funcional (no envía emails)
- **Tags:** `v1.0`, `v1.1`, `v1.2` en GitHub
- **Doctors:** sección removida del navbar público y del homepage, pero las rutas `/doctores` y admin siguen funcionando

---

## Migraciones (Supabase)

| Migración | Contenido |
|---|---|
| `00001_initial_schema.sql` | Tablas `perfiles`, `articulos`, RLS, trigger `handle_new_user()` |
| `00002_cms_tables.sql` | Tabla `doctores`, seed data (4 doctores, 8 artículos), columnas `autor_id` |
| `00003_storage_buckets.sql` | Bucket `doctor-images` con políticas |
| `00004_article_author.sql` | Columnas `autor_nombre`, `autor_avatar_url` |
| `00005_article_storage.sql` | Bucket `article-images` con políticas |
| `00006_revistas_table.sql` | Tabla `revistas` con RLS |
| `00007_app_config.sql` | Tabla `app_config` + seed de email defaults |
| `00008_revistas_pdf_storage.sql` | Bucket `revistas-pdf` con políticas |
| `00009_revistas_pdf_private.sql` | Bucket `revistas-pdf` privado + RLS (suscriptores y admins) |
| `00010_newsletters.sql` | Tabla `newsletters` con RLS (solo admins) |

---

## Comandos de Desarrollo

```bash
npm run dev      # Servidor local
npm run build    # Producción (tsc + next build)
npm run lint     # ESLint
npm run start    # Iniciar producción local
```

---

## Estructura de Directorios

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Navbar, Footer, Toast)
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Tailwind v4 theme + estilos
│   ├── proxy.ts                # Supabase SSR proxy
│   ├── about/page.tsx
│   ├── contacto/page.tsx
│   ├── login/page.tsx
│   ├── registro/page.tsx
│   ├── suscripcion-exito/page.tsx
│   ├── doctores/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── actualizar-password/page.tsx  # Nueva contraseña
│   ├── recuperar/page.tsx             # Solicitar reset
│   ├── revista/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── suscriptores/page.tsx
│   │   ├── articulos/
│   │   ├── doctores/
│   │   ├── revistas/
│   │   └── newsletter/
│   │       ├── page.tsx               # Lista de newsletters
│   │       ├── nueva/page.tsx         # Crear y enviar
│   │       └── [id]/editar/
│   │           ├── page.tsx           # Server component
│   │           └── form.tsx           # Client form
│   └── api/
│       ├── upload/route.ts
│       ├── upload-pdf/route.ts
│       ├── download/route.ts
│       ├── auth/signout/route.ts
│       └── stripe/
├── components/                 # 29 componentes
│   ├── AdminSidebar.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Toast.tsx
│   ├── UserManagementTable.tsx
│   ├── ArticleContent.tsx
│   ├── DownloadPopup.tsx
│   ├── MagazineSendModal.tsx
│   ├── ImageUpload.tsx
│   ├── AvatarUpload.tsx
│   ├── PdfUpload.tsx
│   ├── ArticleForm.tsx
│   ├── DoctorForm.tsx
│   ├── MagazineForm.tsx
│   ├── DynamicListEditor.tsx
│   ├── DeleteButton.tsx
│   ├── ToggleStatus.tsx
│   ├── ListFilters.tsx
│   ├── SendMagazineButton.tsx
│   ├── ActivateSubscription.tsx
│   ├── HeroBg3D.tsx
│   ├── HeroBg3DWrapper.tsx
│   ├── StatsSection.tsx
│   ├── TiptapEditor.tsx          # Editor WYSIWYG con toolbar
│   └── NewsletterList.tsx        # Tabla historial newsletters
└── lib/
    ├── supabase/
    │   ├── server.ts
    │   ├── client.ts
    │   ├── actions.ts             # signup, login, signout, resetPassword, updatePassword
    │   └── admin-actions.ts       # CRUD + sendMagazine + sendNewsletter + email config
    ├── stripe/
    │   ├── server.ts
    │   └── client.ts
    ├── email-template.ts          # buildMagazineHtml + buildNewsletterHtml
    └── newsletter.ts              # sendNewsletter (legacy, reemplazada por admin-actions)
```

---

## Historias de Usuario (Flujo Completo)

### Visitante no registrado
1. Llega al homepage → ve Hero con "Support Our Mission" y "Sign up for free"
2. Navega artículos → ve solo preview (1 párrafo + blur)
3. Intenta descargar PDF → redirigido a `/registro`
4. Se registra → perfil creado con `rol='lector'`, `suscripcion_activa=false`

### Usuario registrado no suscrito
1. Ve artículos completos
2. Intenta descargar PDF → popup de suscripción con temporizador de 10min
3. Puede suscribirse via `/suscripcion-exito` (paywall manual)
4. Tras activar → `suscripcion_activa=true`, puede descargar PDFs

### Usuario suscrito
1. Descarga PDF → se envía revista al email via Resend
2. Recibe newsletters cuando admin envía nuevas ediciones

### Administrador
1. Login → redirigido a `/admin`
2. Dashboard con resumen de contenido
3. CRUD de artículos, doctores, revistas
4. Gestión de usuarios (toggle suscripción, eliminar)
5. Envío masivo de revistas a suscriptores
6. Configuración de email (from_name, from_email, subject template)
7. Envío de newsletters: `/admin/newsletter` → editor TipTap con preview → envía a suscriptores activos
8. Re-envío desde historial: editar newsletter existente y reenviar

---

## Sesión 2026-06-30 — Password reset, Newsletter CMS, footer fix, Doctors cleanup

### Password reset flow
- `resetPassword()` action llama a `supabase.auth.resetPasswordForEmail()` con `redirectTo: NEXT_PUBLIC_SITE_URL/actualizar-password`
- Página `/actualizar-password` intercambia `?code=` por sesión vía `exchangeCodeForSession()` antes de mostrar el formulario
- Formulario con **New Password** + **Confirm New Password** + validación client-side (mismatch)
- `.env.local` necesita `NEXT_PUBLIC_SITE_URL`

### Footer fix
- Footer se ocultaba para admins en todo el sitio (basado en rol)
- Cambiado a `hide` prop basado en pathname → solo se oculta en rutas `/admin`
- Se usa `headers().get("x-invoke-path")` en el RootLayout para detectar la ruta

### Doctors cleanup
- Link "Doctors" removido del navbar público (`Navbar.tsx`)
- Sección "Our Doctors" removida del homepage (`page.tsx`) junto con `staticDoctors` array
- Rutas `/doctores` y `/admin/doctores` siguen funcionando completamente

### Newsletter CMS
- Migración `00010_newsletters.sql` — tabla `newsletters` + RLS solo admins
- Dependencias: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/pm`
- `TiptapEditor.tsx` — editor WYSIWYG con toolbar (B, I, H2, H3, listas, link, imagen)
- Preview en tiempo real via iframe con `srcdoc` usando el mismo `buildNewsletterHtml()`
- `newsletter.ts` reemplazada por server actions en `admin-actions.ts`:
  - `sendNewsletter(prevState, formData)` — guarda en tabla + envía emails
  - `getNewsletters()` — lista descendente
  - `getNewsletter(id)` — single para editar
  - `deleteNewsletter(id)` — elimina registro
- Páginas admin:
  - `/admin/newsletter` — lista con historial + botón "Send a Newsletter"
  - `/admin/newsletter/nueva` — editor + preview toggle + send
  - `/admin/newsletter/[id]/editar` — re-envío desde historial
- Sidebar: link "Newsletter" en navItems
- Template: `buildNewsletterHtml()` en `email-template.ts`

### Stack update
- Next.js ahora es v16 (se actualizó desde v14)
- React 19
- TipTap para editor de texto enriquecido

---

## Sesión 2026-07-01 — Hero Slide 2 (Francisco Hernández)

### Slide 2 implementation
- Replaced placeholder in `page.tsx` with quote slide: "The root of all diseases… Proverbs 20:27"
- Same layout as slide 1: left content (`md:w-[55%]`) + right image (`md:w-[34%]`)
- Quote marks decorative (same size/weight as slide 1)
- Multi-weight quote text (600/800/600 italic)
- Attribution "FRANCISCO HERNÁNDEZ" uppercase, #717377
- Image pre-flipped at file level (Python PIL `FLIP_LEFT_RIGHT`) — no CSS `scaleX(-1)` to avoid 1px sub-pixel artifact

### Text sizing
- Quote text: `clamp(13px,1.2vw,19px)` — unified with slide 1 (user request after initially setting larger values)
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
