# Conferencia IKMA — Fundamentos para IA

## Contexto del Proyecto

Landing page temporal para una conferencia de IKMA. El proyecto se
desarrolla dentro del mismo repo Next.js existente, pero con base de
datos completamente aislada using PostgreSQL schemas.

**Rama de trabajo:** `feat/conferencia-landing`
**Base de datos:** Mismo Supabase, schema separado `conferencia`
**Objetivo temporal:** Se puede borrar completo sin afectar nada

## Arquitectura

```
Base de datos IKMA_website
├── public/          ← TODO lo existente (NO TOCAR)
│   ├── perfiles
│   ├── articulos
│   ├── solicitudes_membresia
│   └── ...
│
└── conferencia/     ← NUEVO (se borra al final)
    ├── registros
    └── ...
```

**Regla de oro:** Las tablas del schema `conferencia` NUNCA se
consultan sin `.schema('conferencia')`. Si ves una query a una tabla
que no existe en `public`, probablemente falta el prefijo.

## Qué SÍ se puede hacer

1. **Crear tablas en `conferencia`** — cualquier tabla nueva para el
   evento va en este schema.
2. **Modificar `supabase/config.toml`** — agregar `"conferencia"` a
   `schemas` y `extra_search_path` para exponer las tablas vía API.
3. **Crear rutas en `src/app/conferencia/`** — toda la estructura de
   la landing va aquí.
4. **Usar el mismo `createClient()` de Supabase** — con
   `.schema('conferencia')` en las queries.
5. **Agregar keys i18n** en `messages/*.json` bajo el namespace
   `Conferencia`.
6. **Modificar `.env.local`** — solo si se necesitan variables nuevas
   (ej: `NEXT_PUBLIC_CONF_*`).

## Qué NO se puede hacer (What Not to Do's)

1. **NO tocar tablas en `public/`** — ni crear, ni modificar, ni
   eliminar. Las tablas del sitio actual son intocables.
2. **NO agregar foreign keys de `conferencia` a `public`** — los
   schemas no deben depender el uno del otro.
3. **NO usar el schema `public` por defecto para queries de la
   conferencia** — siempre `.schema('conferencia')`.
4. **NO modificar migraciones existentes** (`00001` a `00040`). Solo
   se agregan migraciones nuevas.
5. **NO commitear a `main`** — todos los cambios van en
   `feat/conferencia-landing`.
6. **NO instalar dependencias nuevas** a menos que sea estrictamente
   necesaria. La landing debe ser lo más liviana posible.
7. **NO crear componentes reutilizables** para el sitio general. Todo
   el código de la conferencia vive en `src/app/conferencia/` o
   `src/components/conferencia/`.
8. **NO usar auth del sitio actual** — la conferencia maneja su propio
   registro. No crear usuarios en `auth.users` del proyecto IKMA.
9. **NO tocar `src/middleware.ts`** sin antes verificar que los
   cambios no afecten rutas existentes.
10. **NO eliminar archivos de la conferencia de la rama `main`** — si
    se hace merge, los archivos se eliminan de la rama, no del repo.

## Checklist de Eliminación (post-evento)

Cuando la conferencia termine, borrar en este orden:

1. `DROP SCHEMA conferencia CASCADE;` (Supabase SQL Editor)
2. Quitar `"conferencia"` de `supabase/config.toml` (2 líneas)
3. `rm -rf src/app/conferencia src/components/conferencia`
4. Eliminar keys `Conferencia` de `messages/en.json` y `messages/es.json`
5. Eliminar variables `CONF_*` de `.env.local` (si existen)
6. `git branch -d feat/conferencia-landing`

Ninguna de estas acciones afecta la funcionalidad del sitio principal.

## Decisiones Pendientes

- [ ] Plataforma de streaming (Zoom, YouTube Live, otra)
- [ ] Diseño visual de la landing
- [ ] Contenido del hero (título, fecha, hora, descripción)
- [ ] Campos exactos del formulario de registro
