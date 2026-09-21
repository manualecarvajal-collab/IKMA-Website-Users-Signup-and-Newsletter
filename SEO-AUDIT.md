# Auditoría SEO — ikmaglobal.com

**Fecha:** 2026-09-21
**Alcance:** 25 URLs auditadas (crawl en vivo + inspección del código en `src/`)
**Dominio canónico detectado:** `https://www.ikmaglobal.com` (el apex redirige 308 al `www`)

---

## Estado tras la sesión de trabajo en los P0 (2026-09-21)

Los 6 P0 seguros se implementaron y verificaron en local (build + crawl de las 25 URLs,
**25/25 sin fallos**). P0.6 (locale en la URL) y la parte estructural de P0.7 (ISR) se
aplazaron a una sesión dedicada: mueven 29 carpetas de ruta, 90 `href` internos y 25
`redirect()`, y no se pueden validar sin desplegar (auth y Stripe).

| P0 | Estado | Verificación |
|---|---|---|
| P0.1 host canónico | ✅ Hecho | Las 29 URLs del sitemap usan `www`; `robots.txt` apunta a `www` |
| P0.2 JSON-LD | ✅ Hecho | 25/25 páginas con structured data válido (JSON parseado) |
| P0.3 canonical | ✅ Hecho | 25/25 páginas con `<link rel="canonical">` a `www` |
| P0.4 H1 | ✅ Hecho | Exactamente **1** `<h1>` por página en las 25 URLs |
| P0.5 `/donate` | ✅ Hecho | Título y descripción propios, ya no clona la home |
| P0.6 locale en URL | ⏸️ Aplazado | Requiere migración estructural |
| P0.7 cache/proxy | 🟡 Parcial | Early-return sin cookie de sesión; ISR sigue bloqueado por P0.6 |
| P0.8 imágenes | ✅ Hecho | `/who-we-are`: **10,00 MB → 0,76 MB (-92,4 %)** |

### Decisiones y hallazgos de la sesión

- **El JSON-LD NO declara `NGO` ni `nonprofitStatus`.** Tres páginas legales (`/donate`,
  `/donor-rights`, `/privacy-policy`) declaran que la entidad es *"IKMA LLC, a for-profit
  limited liability company"*, no exenta bajo la Sección 501(c)(3). En schema.org `NGO` es
  por definición sin ánimo de lucro: declararlo habría sido marcado falso. Se emite
  `["Organization", "MedicalOrganization"]` + `legalName: "IKMA LLC"`.
- **No se emite `Event` para teachings.** La tabla `grupos` no tiene campos de fecha
  (`id, nombre, slug, created_at, posicion, gratis`) y los nombres llevan fechas en texto
  libre. `startDate` es obligatorio para el rich result, y parsear fechas de texto libre
  habría sido inventar datos.
- **No se emite `SearchAction`.** El sitio no tiene buscador interno.
- **No se emite `sameAs`.** IKMA no enlaza ningún perfil social propio; el único Facebook
  del código es de una organización partner (pendiente de aportar las URLs reales).
- **No se borró ningún fichero.** `alcance.JPG`, `medical.jpg`, `Unete a la familia.png` y
  `¡YA ESTAMOS EN LÍNEA!.png` no tienen referencias en el código, pero un fichero en
  `public/` no pesa nada si nadie lo pide (no está en el bundle ni en la carga de página).
  Borrarlos es higiene de repositorio, no rendimiento, y el CMS guarda HTML de artículos en
  Postgres que podría referenciarlos. Los originales de las imágenes optimizadas siguen en
  `public/` por la misma razón.
- **Corrección de un dato del informe original:** las dos etiquetas `<img>` del hero de la
  home apuntan a la **misma URL**, así que solo se descarga una vez — no había bytes
  duplicados, solo dilución de la señal de prioridad. El problema real era que el
  `<link rel="preload">` de esa imagen vivía en el layout raíz y la descargaba **todas** las
  páginas del sitio; ahora está acotado a la home.

### Pendiente de configuración externa

- `NEXT_PUBLIC_SITE_URL` en Vercel debe ser `https://www.ikmaglobal.com`. Sigue usándose para
  redirects de auth y Stripe, y no para metadatos SEO (`src/lib/site.ts` es la fuente única
  del dominio canónico).
- Verificar la propiedad en Google Search Console y enviar `sitemap.xml`.

---

## 1. Estado en los resultados de Google

**El dominio no aparece en resultados de búsqueda.** Cuatro consultas independientes sobre
`ikmaglobal.com`, `IKMA Global`, `International Kingdom Medical Association` e `ikmaglobal`
no devolvieron **ninguna** URL del dominio.

Lo que sí aparece cuando se busca la marca:

| Resultado | Qué es | Implicación |
|---|---|---|
| [fliphtml5.com/IKMA-2025](https://fliphtml5.com/IKMA-2025/vwvk/NEWSLETTER_-_IKMA_%231_-_A_GLOBAL_HEALTH_PROJECT/) | La newsletter #1 de IKMA alojada en un visor de terceros | **El contenido propio rankea fuera del dominio.** La autoridad se regala |
| [emmint.com — Second Kingdom Medical Conference](https://www.emmint.com/second-kingdom-medical-conference/) | Mención externa de la conferencia | Único backlink/mención de marca localizado |
| [ikma.edu.my](https://ikma.edu.my) | IKMA Malasia (acrónimo idéntico) | Canibalización de marca: el acrónimo ya está ocupado |

**Diagnóstico:** el sitio está en estado *zero-visibility*. No es un problema de "estar en
posición 12 y querer subir al 3" — es que Google prácticamente no lo conoce como entidad.
La causa no es una sola cosa; es la combinación de los P0 de abajo.

---

## 2. P0 — Críticos (bloquean la indexación o la calidad base)

### P0.1 — El 100 % de las URLs del sitemap son redirecciones (conflicto www / no-www)

El sitio resuelve en `www.ikmaglobal.com`, pero todo el código declara el apex:

| Fuente | Valor declarado | Realidad |
|---|---|---|
| `src/app/layout.tsx` → `metadataBase` | `https://ikmaglobal.com` | redirige 308 a `www` |
| `src/app/sitemap.ts` → las 18 URLs | `https://ikmaglobal.com/...` | redirigen 308 a `www` |
| `src/app/robots.ts` → `Sitemap:` | `https://ikmaglobal.com/sitemap.xml` | redirige 308 a `www` |
| `og:image` | `https://ikmaglobal.com/og-image.png` | redirige 308 a `www` |

**Evidencia verificada:** las 18 URLs del sitemap devuelven `num_redirects=1`.

```
https://ikmaglobal.com                       -> 200 | final: https://www.ikmaglobal.com/
https://ikmaglobal.com/blog                  -> 200 | final: https://www.ikmaglobal.com/blog
https://ikmaglobal.com/who-we-are            -> 200 | final: https://www.ikmaglobal.com/who-we-are
... (18/18 igual)
```

Google recibe un sitemap compuesto íntegramente por redirecciones. Es una de las señales de
calidad más baratas de arreglar y más caras de ignorar.

**Fix:** elegir un host y aplicarlo en los 4 sitios. Recomendado mantener `www` (Vercel ya lo
fuerza) y cambiar `metadataBase`, `sitemap.ts` base, `robots.ts` y `NEXT_PUBLIC_SITE_URL`.

### P0.2 — Cero datos estructurados en todo el sitio

`grep -rn "ld+json|schema.org" src/` → **0 coincidencias**.
Recuento en las 25 URLs renderizadas → **0 bloques `application/ld+json`**.

Falta todo:
`Organization` / `NGO` / `MedicalOrganization` · `WebSite` + `SearchAction` ·
`BreadcrumbList` · `Article` / `BlogPosting` (5 artículos) · `Event` (3 teachings) ·
`Person` / `Physician` (doctores) · `FAQPage`.

Sin `Organization` + `sameAs` Google no construye el panel de entidad de marca. Sin
`Article` no hay rich results ni elegibilidad para Top Stories. Para una organización médica
(YMYL) esto además agrava el juicio de autoridad.

### P0.3 — Cero etiquetas canonical

`grep -rn "canonical" src/` → **0 coincidencias**. Ninguna página emite
`<link rel="canonical">`.

Riesgo material ya existente: `/revista` existe como ruta pero **308 → `/blog`**
(2 saltos desde el apex), y el idioma se controla por cookie, de modo que la misma URL sirve
contenido distinto. Sin canonical, Google decide por su cuenta qué consolidar.

### P0.4 — Páginas principales sin H1

| URL | H1 | H2 | H3 |
|---|---|---|---|
| `/` | **0** | 5 | 3 |
| `/blog` | **0** | — | — |
| `/membresia` | **0** | — | — |
| `/events` | **0** | — | — |
| `/contact-us` | **0** | — | — |
| `/who-we-are` | **3** ❌ | — | — |

En la home el titular del hero (`…of the Kingdom of God`) está marcado como `<h2>`. El
documento principal del sitio no declara cuál es su encabezado de nivel 1. En `/who-we-are`
ocurre lo contrario: tres H1 compitiendo.

### P0.5 — Contenido duplicado: `/donate` clona la home

```
/donate  ->  <title>IKMA - International Kingdom Medical Association</title>
             <meta name="description" content="Healing through faith and excellence. A mission-driven...">
/
         ->  <title>IKMA - International Kingdom Medical Association</title>
             <meta name="description" content="Healing through faith and excellence. A mission-driven...">
```

`/donate` es una página de conversión clave y no tiene `metadata` propia ni canonical.
Título y descripción **idénticos** a la home.

### P0.6 — Bilingüe sin hreflang ni URLs por idioma

`next-intl` está configurado con el locale en una **cookie** (`NEXT_LOCALE`), no en la ruta:

- `src/i18n/request.ts` lee `cookies().get("NEXT_LOCALE")`
- `src/components/LocaleSwitch.tsx` hace `document.cookie = ...` + `window.location.reload()`
- `grep hreflang|alternates` → **0 coincidencias**; 0 `<link hreflang>` en el HTML

**Consecuencia:** una sola URL sirve inglés y español. Google indexa una versión
arbitraria (la del render que le tocó) y **no puede descubrir la otra**. El contenido real
está mezclado además: `/blog/sanar-a-las-naciones` sirve el título `HEALING THE NATIONS`,
`/testimonios` tiene título en español, `/blog/ikma-avanza` → `IKMA FORWARD`.

**Fix estructural:** mover el locale al path (`/es/...`, `/en/...`) con un segmento
`[locale]`. Esto resuelve de golpe el hreflang **y** la cacheabilidad (ver P0.7).

### P0.7 — Nada se cachea: todo el sitio se renderiza en cada request

```
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
x-vercel-cache: MISS
TTFB medido: 0.51s / 0.50s / 0.73s
```

**Causa raíz (dos capas):**

1. `src/app/layout.tsx` → `getLocale()` → `cookies()` en `src/i18n/request.ts`.
   Leer una cookie en el root layout **fuerza render dinámico en todas las páginas**.
2. `src/proxy.ts` corre en el matcher
   `"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"`
   y ejecuta `supabase.auth.getUser()` — **una llamada de red a Supabase en cada request**,
   incluso para un visitante anónimo que sólo quiere leer el blog.

**Impacto:** sin CDN para HTML, TTFB ×3 más alto de lo necesario, LCP/INP castigados y crawl
budget desperdiciado. Es también la razón por la que `/sitemap.xml` sale con `MISS`.

### P0.8 — Imágenes de hasta 4 MB sin optimizar

| Archivo | Peso | Dónde | Problema |
|---|---|---|---|
| `public/1968.jpg` | **3.99 MB** | `/who-we-are` (background CSS) | Ni se cachea: `cache-control: public, max-age=0, must-revalidate` |
| `public/quienes-somos.png` | 2.39 MB | `/who-we-are` (`<img>`) | PNG sin comprimir |
| `public/images/carlos.png` | 1.67 MB | doctores | PNG de foto |
| `public/images/Ngata.png` | 1.66 MB | doctores | PNG de foto |
| `public/images/Francisco.png` | 1.57 MB | doctores | PNG de foto |
| `public/images/Marlon.png` | 1.47 MB | doctores | PNG de foto |
| `public/alcance.JPG` | 5.37 MB | **sin usar en el código** | peso muerto |
| `public/medical.jpg` | 853 KB | **sin usar en el código** | peso muerto |

Total de `public/`: **31 MB**. El proyecto usa `<img>` plano en casi todas partes (según
`AGENTS.md`), así que no hay AVIF/WebP, ni `srcset`, ni redimensionado automático.

Además, la home carga **el mismo archivo dos veces con `fetchPriority="high"`**:

```html
<img src="/images/Ap Bonny 2.webp" alt="" fetchPriority="high" .../>
<img src="/images/Ap Bonny 2.webp" alt="Apostle John Boney" fetchPriority="high" .../>
```

Dos candidatos LCP compitiendo y bytes duplicados.

---

## 3. P1 — Alto (limitan el crecimiento)

### P1.1 — Sitemap incompleto y con `lastmod` falso

El sitemap tiene **18 URLs**. Faltan páginas perfectamente indexables:

`/contact-us` · `/events` · `/testimonios` · `/donate` · `/cookies` · `/privacy-policy` ·
`/terms-of-service` · `/donor-rights` · `/donation-policy` · `/outreach/communities` ·
`/outreach/zumurucuare`

Y el `lastmod` miente. `sitemap.ts` usa `lastModified: new Date()` con
`export const dynamic = "force-dynamic"`, así que cambia en cada request:

```
petición 1: 2026-09-21T14:24:46.086Z
petición 2: 2026-09-21T14:24:49.810Z   (3 s después)
```

Google aprende a ignorar `lastmod` cuando no es fiable. Debe usar el `updated_at` real de la
BD (que ya se usa para los artículos) o eliminarse para las URLs estáticas.

### P1.2 — Contenido muy fino y volumen insuficiente

| Página | Palabras |
|---|---|
| `/donation-policy` | 139 |
| `/events` | 138 |
| `/teachings` | 172 |
| `/doctores` | 238 |
| `/blog/sanar-a-las-naciones` | 415 |
| `/blog/ikma-avanza` | 1.849 (pero **sin meta description**) |
| `/privacy-policy` | 1.703 |

Inventario total indexable de contenido editorial: **5 artículos de blog + 3 teachings**.
Ninguna página supera 1.900 palabras. Con ese volumen no hay superficie para competir por
ninguna query no-marca.

### P1.3 — Sin verificación de GSC detectable y páginas de conversión indexables

- No hay `<meta name="google-site-verification">` en el HTML ni archivo de verificación en
  `public/` (sólo `favicon.webp` y `og-image.png`). Puede estar verificado por DNS, pero no
  hay evidencia en el repo.
- Sin analítica de búsqueda no hay forma de medir nada de lo anterior.
- `/suscripcion-exito` y `/membresia/estudiante/gracias` son páginas de conversión
  **indexables** y devuelven 200. Deberían ser `noindex`.

### P1.4 — La revista (el activo diferencial) no existe para Google

Los PDFs viven en el bucket privado `revistas-pdf` y desde el 2026-06-24 los enlaces directos
se eliminaron de `/revista` y `/revista/[slug]` (se sustituyeron `<a>` por `<div>`). Además
`/revista` hoy 308 → `/blog`.

Resultado: el contenido más valioso de IKMA no es rastreable. **Cero contenido indexable de
la revista.** Ese es exactamente el tipo de activo que debería atraer tráfico orgánico.

### P1.5 — Nomenclatura de navegación rota / confusa

`src/components/Navbar.tsx`:

```tsx
{ href: "/newsletter", label: t("magazine") },   // ← "Magazine" apunta al form de suscripción
{ href: "/blog",       label: "Blog" },
```

- El ítem **Magazine** lleva a `/newsletter` (formulario), cuya etiqueta es `Magazine - IKMA`.
- `/revista` existe como ruta pero redirige a `/blog`.
- `/testimonios` está comentado en el navbar (línea 29) pese a existir y ser indexable:
  **página huérfana** sin enlaces internos que la alimenten.

### P1.6 — URLs con nombres problemáticos

```
public/Tu vocación médica al servicio(1).png   → espacios, acentos, paréntesis
public/Unete a la familia.png                  → espacios
public/¡YA ESTAMOS EN LÍNEA!.png               → signos de apertura, acentos
public/1968.jpg                                → nombre sin significado
```

Generan URLs codificadas frágiles, son malas para búsqueda de imágenes y para compartir.
Falta un `sitemap` de imágenes (`<image:image>`).

### P1.7 — Open Graph incompleto y sin Twitter Cards

Presentes: `og:title`, `og:description`, `og:image` (+width/height/alt), `og:type`.
Ausentes: `og:url`, `og:site_name`, `og:locale`, `twitter:card`, `twitter:title`,
`twitter:description`, `twitter:image`.

Sin `og:url` los shares pueden resolver al host equivocado y no hay señal de consolidación.

### P1.8 — Contenido tras login invisible para el crawler

`src/app/blog/[slug]/page.tsx` sirve sólo el resumen si el usuario no está autenticado
(`puedeVerCompleto`). Googlebot no se autentica: de los 5 artículos, los que tengan gating
se indexan con apenas el teaser. Combinado con P1.2 (contenido ya fino), es un techo duro.

Además `src/app/blog/[slug]/page.tsx` tiene `export const dynamic = "force-dynamic"`, así
que cada artículo se renderiza en servidor en cada visita.

---

## 4. P2 — Medio

- **Sin `x-default` ni hreflang** (derivado de P0.6).
- **Títulos de marca, no de intención.** `Who We Are - IKMA`, `Events - IKMA`,
  `Contact Us - IKMA`. Nadie busca "who we are". Cero cobertura de queries reales del sector
  (misiones médicas, conferencias de medicina y fe, asociación médica cristiana, etc.).
- **Sin `BreadcrumbList`** en `/blog/[slug]` ni `/teachings/[grupoSlug]/[videoSlug]`.
- **E-E-A-T débil para YMYL.** `/doctores` y `/doctores/[id]` existen, pero sin JSON-LD
  `Person`/`Physician`, sin credenciales estructuradas, sin `sameAs` a perfiles externos y sin
  páginas de autor en el blog. En contenido de salud Google aplica el estándar más exigente.
- **Nav duplicado en el HTML** (desktop + móvil): el mismo bloque de enlaces se repite y
  contamina el recuento de palabras y la densidad de enlaces (visible en el texto extraído de
  la home: "Home About Us Who We Are…" aparece dos veces).
- **Sin hub temático.** 28 enlaces internos en la home, pero sin silos ni arquitectura por
  tema; `teachings` y `blog` no se enlazan entre sí de forma estructurada.
- **`/blog` con 0 H1** ya listado en P0.4, pero es además la página con `priority: 0.9`.

---

## 5. P3 — Pulido

- **Doble salto de redirección en HTTP:**
  `http://ikmaglobal.com` → 308 → `https://ikmaglobal.com` → 308 → `https://www.ikmaglobal.com`.
  Debería ir directo al host final en un solo salto.
- **`NEXT_PUBLIC_SITE_URL=http://localhost:3000` en `.env.local`.** Se usa en `ShareButtons`,
  en `src/lib/email-template.ts` (5 sitios) y en los redirects de Stripe. Verificar que en
  Vercel Pro esté en el host final **con `www`**, o los enlaces de email añadirán un salto.
- **`og:image` apunta a no-www** → una redirección extra en cada scrape de redes sociales.
- **Sin `apple-touch-icon` ni `manifest.json`.**
- **Sin `Cache-Control: immutable` para `/images/*`.** Los estáticos se sirven con
  `max-age=0, must-revalidate`.
- **`/notfound/` como directorio de ruta** en `src/app/` (además de `not-found.tsx`); revisar
  que no genere una ruta indexable.

---

## 6. Hoja de ruta propuesta

### Semana 1 — Fundacional (todo P0, sin contenido nuevo)

1. **Unificar host canónico** en `layout.tsx` (`metadataBase`), `sitemap.ts`, `robots.ts`,
   `NEXT_PUBLIC_SITE_URL` y `og:image`. Verificar 18/18 URLs con `redirects=0`.
2. **Añadir `alternates.canonical`** en el root layout y en cada `generateMetadata`.
3. **JSON-LD:** `Organization`+`sameAs` y `WebSite` en layout; `Article` en blog;
   `Event` en teachings; `Person`/`Physician` en doctores; `BreadcrumbList` en rutas anidadas.
4. **H1 semántico** en `/`, `/blog`, `/membresia`, `/events`, `/contact-us`; reducir
   `/who-we-are` a exactamente 1.
5. **Metadata propia para `/donate`** (+ canonical + description).
6. **Completar sitemap** con las 11 URLs ausentes y arreglar `lastmod` (usar `updated_at`
   real o quitarlo en las estáticas). Quitar `force-dynamic` del sitemap.
7. **`noindex`** en `/suscripcion-exito`, `/membresia/estudiante/gracias`, `/login`,
   `/registro`, `/verificar-codigo`, `/recuperar`, `/crear-contrasena`.
8. **Verificar Google Search Console**, enviar el sitemap y capturar la línea base de
   cobertura e impresiones.

### Semana 2 — Rendimiento y rastreo

9. **Migrar el locale al path** (`app/[locale]/...`) — resuelve i18n, hreflang y
   cacheabilidad de una vez.
10. **Pasar páginas públicas a ISR** (`export const revalidate = 3600`), quitar
    `force-dynamic` de `/blog/[slug]`, `/membresia`, `/teachings/...`.
11. **Acotar `proxy.ts`** a rutas realmente autenticadas (`/perfil`, `/admin`, `/membresia`)
    para sacar `supabase.auth.getUser()` del camino crítico público.
12. **Optimizar imágenes:** pasar a `next/image` con AVIF/WebP; comprimir `1968.jpg`
    (3.99 MB → objetivo <300 KB), `quienes-somos.png` y los 5 PNG de doctores.
    Borrar `alcance.JPG` (5.37 MB) y `medical.jpg` si están muertos.
13. **Eliminar el doble `<img>` del hero** y su doble `fetchPriority="high"`.
14. **`Cache-Control: public, max-age=31536000, immutable`** para `/images/*` y
    `/outreach/*`.

### Semana 3 — Contenido y activos propios

15. **Publicar la revista como HTML indexable** (o al menos el índice + resúmenes de cada
    edición en `/revista/[slug]`), en vez de sólo PDF en bucket privado.
16. **Sacar la newsletter de fliphtml5** y alojarla en el dominio.
17. **Plan editorial:** 2-4 artículos/mes atacando queries reales, no títulos de marca.
18. **Arreglar la navegación:** "Magazine" → `/revista`, descomentar `/testimonios`, eliminar
    la ruta muerta `/revista` o darle contenido propio.
19. **`BreadcrumbList` + E-E-A-T:** páginas de autor con credenciales, revisión médica,
    fuentes citadas en cada artículo.

### Mes 2+ — Autoridad y entidad

20. **Backlinks:** directorios médicos, organizaciones partner (ya hay mención en
    `emmint.com`), notas de prensa del congreso.
21. **Construir la entidad de marca:** Wikidata, Google Business Profile, perfiles sociales
    enlazados con `sameAs` — hoy "IKMA" compite con [ikma.edu.my](https://ikma.edu.my).
22. **Monitorizar:** GSC (cobertura, CWV, impresiones por query), Core Web Vitals con datos
    de campo de Vercel Speed Insights (ya instalado).

---

## 7. Lo que ya está bien

No todo es deuda. Lo siguiente está correctamente implementado y conviene no romperlo:

- `robots.txt` correcto: `Allow: /` con `Disallow` en `/admin/`, `/api/`, `/auth/`.
- HTTP 404 real (no soft-404): `/magazine`, `/esta-pagina-no-existe-xyz`, `/revista/abc`
  devuelven **404**, no un 200 vacío.
- Sin meta `noindex` accidental en páginas públicas.
- Compresión Brotli activa: home de 128 KB → **30.5 KB**.
- Seguridad: HSTS con `preload`, `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy` y CSP configurados en `vercel.json`.
- Todas las imágenes tienen `alt` (0 sin `alt` en la home) y la mayoría `loading="lazy"`.
- `trailingSlash: false` + `cleanUrls: true` → URLs limpias.
- Vercel Speed Insights y Analytics ya instalados: la instrumentación para medir mejoras
  ya está en su sitio.
