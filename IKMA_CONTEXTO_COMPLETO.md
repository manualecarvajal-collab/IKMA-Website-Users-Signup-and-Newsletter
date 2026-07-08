# IKMA Website — Contexto Completo del Proyecto

## Descripción General

Sitio web de **International Kingdom Medical Association (IKMA)**, una asociación médica con enfoque de fe. Incluye secciones públicas (inicio, quiénes somos, doctores, revista/blog, contacto) y un panel de administración (CMS) para gestionar contenido, usuarios y envío de revistas por email.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | Next.js 14 (App Router) |
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

### Envío individual
`sendMagazineToEmail(revistaId, userId)` → verifica suscripción activa → envía email con plantilla HTML profesional (portada, descripción, botón de descarga)

### Envío masivo
`sendMagazineToSubscribers(revistaId, excludeEmails[])` → obtiene suscriptores activos → filtra excluidos → envía uno por uno vía Resend

### Modal de envío (`MagazineSendModal.tsx`)
- Búsqueda por nombre/email
- Lista de suscriptores con exclusión temporal por email
- Botón "Send Now" con confirmación

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

---

## Navegación Pública

### Navbar (`Navbar.tsx`)
- Links: Home, About Us, Doctors, Blog, Contact
- Desktop: botones Login/Sign up o email/Sign out + Support Now
- Mobile: menú hamburguesa con todos los links + Admin si aplica
- **Oculto en rutas `/admin`**

### Footer (`Footer.tsx`)
- Logo, descripción, links legales y de recursos
- **Oculto en rutas `/admin`**

### Admin Sidebar (`AdminSidebar.tsx`)
- Sidebar desktop con Dashboard, Articles, Doctors, Magazines
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
| `/` | Hero con 3D, artículos destacados, doctores destacados |
| `/about` | Misión, visión, valores, estadísticas animadas, junta directiva |
| `/contacto` | Formulario de contacto (no funcional), información |
| `/login` | Inicio de sesión |
| `/registro` | Registro de usuario |
| `/suscripcion-exito` | Página de agradecimiento (activa suscripción automáticamente) |
| `/doctores` | Lista de doctores con filtro por especialidad |
| `/doctores/[id]` | Perfil detallado de doctor |
| `/revista` | Lista de artículos y revistas (legacy, redirige a `/blog`) |
| `/revista/[slug]` | Artículo completo legacy (redirige a `/blog/[slug]`) |
| `/blog` | Blog: artículos destacados, grilla, sidebar, revistas |
| `/blog/[slug]` | Artículo completo con paywall, sidebar, artículos relacionados |
| `/newsletter` | Lista de revistas/magazines con botón "Read" gated por auth+suscripción |
| `/teachings` | Placeholder |
| `/our-purpose` | Propósito, misión y valores de la organización |
| `/our-objectives` | Objetivos de la organización |

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
- **Container pattern** — toda página pública debe usar el mismo contenedor que el Navbar: `max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop`. Ignorar configuraciones de layout/márgenes/paddings de diseños externos (Stitch, Figma, etc.) si difieren del proyecto.

---

## Errores Conocidos y Soluciones

### Resueltos
1. **Vercel payload limit (4.5 MB):** Se implementó arquitectura de upload con signed URLs (cliente → API → signed URL → cliente PUT directo a Storage)
2. **TypeScript en consultas SQL:** Se resolvieron errores de tipado en migraciones para builds exitosos en Vercel
3. **Stripe API no disponible temporalmente:** Se implementó paywall manual via `/suscripcion-exito` + `ActivateSubscription`
4. **Pérdida de datos en batch editing:** Se agregó `beforeunload` alert + detección de cambios pendientes
5. **Eliminación de admins:** Se agregó protección en frontend y backend para evitar borrar usuarios admin
6. **Botón "Back" inconsistente:** Se hizo dinámico según ruta (dashboard → "Back to Site" a `/`, sub-páginas → "Back to Dashboard" a `/admin`)

### Pendientes / Consideraciones
- **Stripe webhook:** success_url apunta a `/suscripcion/exito` (ruta incorrecta, debería ser `/suscripcion-exito`)
- **cancel_url:** apunta a `/suscripcion/cancelar` (ruta no implementada)
- **No hay tipos generados de Supabase:** las interfaces se definen inline
- **No hay middleware.ts:** la auth se maneja en layouts y server actions
- **Contact form:** no es funcional (no envía emails)
- **Tags:** `v1.0`, `v1.1`, `v1.2` en GitHub

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
│   ├── revista/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── suscriptores/page.tsx
│   │   ├── articulos/
│   │   ├── doctores/
│   │   └── revistas/
│   └── api/
│       ├── upload/route.ts
│       ├── upload-pdf/route.ts
│       ├── download/route.ts
│       ├── auth/signout/route.ts
│       └── stripe/
├── components/                 # 27 componentes
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
│   └── StatsSection.tsx
└── lib/
    ├── supabase/
    │   ├── server.ts
    │   ├── client.ts
    │   ├── actions.ts
    │   └── admin-actions.ts
    ├── stripe/
    │   ├── server.ts
    │   └── client.ts
    └── newsletter.ts
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

---

## Sesión 2026-07-03 — Strategic Aims mosaic + contenido About

### Stitch MCP (diseño por referencia)
- Se configuró acceso a Stitch vía MCP (`stitch.googleapis.com/mcp`).
- Proyecto ID: `5238137457577360481`
- API Key: `AIzaSy...` (reemplazar con key real)
- Config para `opencode.jsonc`:
```jsonc
"mcp": {
  "stitch": {
    "type": "remote",
    "url": "https://stitch.googleapis.com/mcp",
    "enabled": true,
    "headers": {
      "X-Goog-Api-Key": "AIzaSy... (reemplazar con key real)"
    }
  }
}
```
- Método: `tools/call` con `name: "get_screen"`, args `project_id` + `screen_id`.
- Devuelve `screenshot.downloadUrl` + `htmlCode.downloadUrl`.
- Descargar con `curl -L`.
- Screens usadas: "Sección Strategic Aims - IKMA", "Sección Strategic Aims Mosaic - IKMA", "Sección Who We Are - IKMA", "Sección Mensaje del Fundador - IKMA", "Sección Junta Directiva (Vertical Cards) - IKMA", "Sección Socios Principales - IKMA".

### About page — Strategic Aims mosaic
- Se reemplazó el grid de cards `lg:grid-cols-3` por un mosaic full-width `sm:grid-cols-2 lg:grid-cols-4`.
- Cada tile `h-[320px] md:h-[450px]` con imagen de fondo (Google AIDA), `grayscale` + `brightness-75` default, hover cambia a `grayscale-0` + `brightness-90`.
- Overlay `from-black/80 via-black/20 to-transparent`.
- Título siempre visible al fondo (`mt-auto`), descripción con `max-h-0` → `group-hover:max-h-40`.
- Bloque entero sube `-translate-y-4` en hover.

### Otros cambios
- **CookieConsent.tsx**: v2 con `{status, version}` en JSON, botones compactos w-20, link a `/cookies`.
- **Footer.tsx**: link Privacy Policy → `/privacy-policy`.
- **HeroCarousel.tsx**: colores `#334D96` → tokens `primary`.
- **StatsSection.tsx**: movido de About a Home, sin wrapper `rounded-3xl shadow-xl`.
- **About**: contenido del fundador expandido, badges "Our Foundation" → "About Us".
- **Contacto**: "Doctor Network" → "Membership Question".
- Nuevas páginas: `/cookies`, `/privacy-policy`.

### Commit
- `0e92821` — push a main → auto-deploy Vercel.

---

## Sesión 2026-07-06 — Who We Are page + reestructuración About

### Homepage → Contact section en Footer
- `src/app/contacto/` eliminado como ruta.
- Contact form + info + prayer banner extraídos a `src/components/ContactSection.tsx`.
- `Footer.tsx` renderiza `<ContactSection />` al inicio.
- Navbar: eliminado link "Contact".

### 404 page
- `src/app/notfound/page.tsx`: página 404 con SVG corazón latiendo + EKG animado en colores primary.
- `src/app/not-found.tsx`: re-export de `/notfound` para rutas inexistentes.
- URL: `/notfound` (ya no `/contacto`).

### Navbar dropdown
- "About Us" reemplazado por dropdown hover (desktop) con chevron `expand_more` que rota.
- 3 sub-links: `/who-we-are`, `/our-purpose`, `/our-objectives`.
- Mobile: "About Us" expandible con click, sub-links indentados.
- `src/app/about/` eliminado.

### Who We Are page (`src/app/who-we-are/page.tsx`)
- **Hero**: fondo blur circles (primary-fixed-dim + secondary-fixed), label "Our Identity", título "Who we are", card highlight con `volunteer_activism`, imagen AIDA + floating `public` circle.
- **Founder's Message**: card vertical horizontal con imagen local `/images/ap-boney-studio.jpg`, label "A word from our founder" con `format_quote`, texto del fundador con pull-quote destacado (border-l-4 + bg-surface-container-low), footer con fechas + badge `#TheMandateContinues`.
- **Board of Directors**: grid 1/2/3 col, cards con foto circular + ring, nombre, rol. Imágenes locales desde `/images/` (Ap-Raymond, De León, Hernández, marlene-bonney, Boneza). Dalia Beltran con placeholder `person`.
- **Main Partners**: header bridge full-width con imágenes dual + overlay "Global Network", 3 partner cards (EMIC, Ciudad de las Águilas, Bethlehem Kingdom Center) con flag, líder, ubicación. Callout banner `bg-primary` con CTAs. Statistics 4-col.
- Imágenes locales usadas donde disponibles; AIDA URLs para hero bridge y flags de partners.

### Relevant files touched
- `src/app/who-we-are/page.tsx` (nueva — hero + founder + board + partners)
- `src/components/ContactSection.tsx` (nuevo)
- `src/components/Footer.tsx` (añadido ContactSection)
- `src/components/Navbar.tsx` (dropdown About Us + removed Contact link)
- `src/app/notfound/page.tsx` (nuevo — 404)
- `src/app/not-found.tsx` (nuevo — re-export)
- `src/app/contacto/` (eliminado)
- `src/app/about/` (eliminado)
- `src/app/our-purpose/page.tsx` (nuevo — blank → rellenado en sesión 2026-07-07)
- `src/app/our-objectives/page.tsx` (nuevo — blank → rellenado en sesión 2026-07-07)
- `IKMA_CONTEXTO_COMPLETO.md` (actualizado)

---

## Sesión 2026-07-07 — Nuevo Layout: Newsletter + Blog + Teachings

### Reestructuración de navegación
- Navbar: nuevo dropdown "Blog" con 3 sub-links: **Newsletter**, **Blog**, **Teachings**.
- About Us dropdown se mantiene con Who We Are, Our Purpose, Our Objectives.
- `/revista` y `/revista/[slug]` ahora redirigen a `/blog` y `/blog/[slug]`.

### Nuevas páginas
- **`/newsletter`** — Server component: lista de magazines publicados con botón "Read" gated por auth + suscripción. Usa `ReadMagazineButton.tsx`.
- **`/blog`** — Lista completa de artículos: hero con featured article, sidebar con artículos recientes, grilla 4-col, Load More, sección de magazines al final.
- **`/blog/[slug]`** — Página de artículo: metadata dinámica, imagen + avatar de autor + `ArticleContent`, sidebar con ad + promo magazines, "Recommended Articles" horizontal scroll.
- **`/teachings`** — Placeholder (solo `<div className="min-h-screen" />`).
- **`/our-purpose`** — Rellenada: página completa con propósito, misión, valores (pillars con iconos y bullets).
- **`/our-objectives`** — Rellenada: hero con imagen de fondo + overlay, contenido con badge "NEED REVIEW".

### Componentes nuevos
- **`ReadMagazineButton.tsx`** — Botón cliente: no auth → `/registro`, no suscrito → `/suscripcion-exito`, suscrito → descarga vía `api/download-magazine`.

### API
- **`/api/download-magazine`** — GET: auth check (401), suscripción check (403), genera signed URL 60s del bucket `revistas-pdf` y redirige.

### Commit
- `e6e792d` — push a main → auto-deploy Vercel. Se sanitizó API key de GCP expuesta en `IKMA_CONTEXTO_COMPLETO.md` antes del push.
