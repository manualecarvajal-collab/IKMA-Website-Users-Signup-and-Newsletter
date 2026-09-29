-- ============================================================
-- Conferencia IKMA — Permisos del schema aislado
-- ------------------------------------------------------------
-- PROBLEMA QUE ARREGLA
-- En Supabase los privilegios por defecto de `anon`,
-- `authenticated` y `service_role` se definen POR SCHEMA y solo
-- cubren `public`. Un schema nuevo como `conferencia` no hereda
-- nada, así que al insertar desde el servidor la API responde:
--
--     permission denied for schema conferencia   (42501)
--
-- Verificado en un Postgres limpio replicando los roles de
-- Supabase: 00050..00053 por sí solas NO bastan.
--
-- DECISIÓN DE ACCESO
-- Se concede únicamente a `service_role`, que es quien escribe
-- desde el servidor y además tiene BYPASSRLS. `anon` y
-- `authenticated` NO reciben ningún permiso: no pueden ni
-- alcanzar el schema, así que quedan bloqueados antes incluso
-- de llegar a RLS. Es el mínimo privilegio posible y mantiene
-- la intención de 00050.
--
-- DESVIACIÓN CONSCIENTE DEL DOC OFICIAL
-- https://supabase.com/docs/guides/api/using-custom-schemas
-- El doc concede a `anon, authenticated, service_role` y confía
-- la protección a RLS. Aquí NO: la landing solo escribe desde el
-- servidor, así que negar a nivel de schema es más estricto.
-- Si algún día hace falta leer desde el cliente con un usuario
-- logueado, basta añadir el grant a `authenticated` + políticas
-- RLS. No hay que rehacer nada.
--
-- OJO: esto NO expone el schema a la API. Para que supabase-js
-- (PostgREST) pueda usarlo hay que añadir `conferencia` a los
-- esquemas expuestos — ver el final del fichero.
-- Solo toca el schema `conferencia`.
-- ============================================================

-- Acceso al schema (sin esto nada más importa).
grant usage on schema conferencia to service_role;

-- Privilegios sobre lo que ya existe.
grant select, insert, update, delete
  on all tables in schema conferencia
  to service_role;

-- Sin secuencias hoy: `registros.id` es uuid con gen_random_uuid().
-- Se deja preparado por si alguna tabla futura usa serial/identity.
grant usage, select
  on all sequences in schema conferencia
  to service_role;

-- Sin funciones hoy. Mismo motivo: preparar el terreno.
grant execute
  on all routines in schema conferencia
  to service_role;

-- Que los objetos futuros del schema no vuelvan a caer en la misma
-- trampa (los default privileges son por schema y por rol creador).
-- `FOR ROLE postgres` explícito: es quien crea los objetos al
-- ejecutar migraciones desde el SQL Editor.
alter default privileges for role postgres in schema conferencia
  grant select, insert, update, delete on tables to service_role;

alter default privileges for role postgres in schema conferencia
  grant usage, select on sequences to service_role;

alter default privileges for role postgres in schema conferencia
  grant execute on routines to service_role;

-- ------------------------------------------------------------
-- PENDIENTE FUERA DE SQL (no se puede hacer desde una migración)
-- ------------------------------------------------------------
-- La app consulta con supabase-js → PostgREST. Hoy la API
-- responde:
--
--     PGRST106  Invalid schema: conferencia
--     hint: Only the following schemas are exposed:
--           public, graphql_public
--
-- Hay que añadir `conferencia` a los esquemas expuestos:
--
--   Dashboard → Project Settings → API → "Exposed schemas"
--     → añadir `conferencia` → Save
--
-- Ese cambio recarga PostgREST solo.
--
-- Por qué NO vale hacerlo por SQL: comprobado en el proyecto real,
-- `pg_roles.rolconfig` de `authenticator` solo contiene
-- session_preload_libraries/statement_timeout/lock_timeout, y no
-- hay ningún `pgrst.db_schemas` en ningún rol. Supabase configura
-- PostgREST con su propia config, no con la configuración
-- in-database, así que `alter role authenticator set
-- pgrst.db_schemas = ...` no es fiable aquí. Solo el dashboard.
--
-- Nota: exponerlo no abre los datos. `anon`/`authenticated` no
-- tienen permisos sobre el schema, y RLS sigue activado sin
-- políticas. El único camino de entrada es service_role.
-- ------------------------------------------------------------
