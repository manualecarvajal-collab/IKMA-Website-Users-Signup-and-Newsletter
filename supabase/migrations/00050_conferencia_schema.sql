-- ============================================================
-- Conferencia IKMA — Schema aislado
-- ------------------------------------------------------------
-- Crea el schema `conferencia` y su primera tabla `registros`.
-- NO toca nada del schema `public` (sitio actual intocable).
-- Se elimina por completo al terminar el evento (ver Checklist
-- de Eliminación en conferencia.md).
-- ============================================================

create schema if not exists conferencia;

-- ------------------------------------------------------------
-- Registros: inscripciones al evento.
-- El formulario aún no tiene los campos cerrados (ver
-- "Decisiones Pendientes" en conferencia.md); estas columnas se
-- pueden ajustar en migraciones siguientes mientras el schema
-- siga aislado.
-- ------------------------------------------------------------
create table if not exists conferencia.registros (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  email         text not null,
  organizacion  text,
  cargo         text,
  telefono      text,
  ciudad        text,
  mensaje       text,
  estado        text not null default 'nuevo'
                check (estado in ('nuevo', 'confirmado', 'cancelado')),
  origen        text not null default 'web',
  created_at    timestamptz not null default now()
);

-- Una sola inscripción por email (case-insensitive).
create unique index if not exists registros_email_unique
  on conferencia.registros (lower(email));

-- ------------------------------------------------------------
-- Acceso estrictamente controlado: RLS activado y SIN políticas,
-- de modo que anon/authenticated no pueden leer ni escribir.
-- La inscripción solo se realiza desde el servidor (service_role),
-- que ignora RLS. Así la landing no expone datos ni deja insertar
-- arbitrariamente desde el cliente.
-- ------------------------------------------------------------
alter table conferencia.registros enable row level security;
