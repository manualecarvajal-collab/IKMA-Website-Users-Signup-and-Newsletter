-- ============================================================
-- Conferencia IKMA — Panel de administración
-- ------------------------------------------------------------
-- Tres cosas que necesita `/admin/conferencia`:
--
--   1. `ajustes`   — configuración editable sin tocar código.
--   2. `envios`    — registro de qué correo se le mandó a quién.
--   3. `presencia` — latidos para saber cuánta gente hay conectada.
--
-- Solo toca el schema `conferencia`.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Ajustes (clave/valor)
--
-- Se usa clave/valor en vez de una tabla con columnas porque lo
-- que se guarda aquí cambia: hoy son la URL del directo y la
-- plantilla del correo, y mañana puede ser otra cosa sin migrar.
--
-- El directo admite DOS modos, y el panel elige uno:
--   - `directo_url`   → enlace de Zoom. NO se puede incrustar (la
--                       página de Zoom es un lanzador, no un
--                       reproductor), así que se muestra como botón.
--   - `directo_embed` → URL incrustable (YouTube Live, Vimeo, HLS).
--                       Si está puesta, tiene prioridad y se
--                       incrusta en el panel del directo.
-- Si ninguna está puesta, el panel muestra el contador.
-- ------------------------------------------------------------
create table if not exists conferencia.ajustes (
  clave      text primary key,
  valor      text,
  updated_at timestamptz not null default now()
);

comment on table conferencia.ajustes is
  'Configuración editable del panel. Clave/valor para no migrar cada vez que cambie.';

-- ------------------------------------------------------------
-- 2. Envíos de correo
--
-- Deja rastro de a quién se le mandó qué. Sirve para dos cosas:
-- saber quién ya recibió la invitación (y no mandarla dos veces
-- sin darse cuenta) y poder ver qué falló, porque Resend puede
-- rechazar envíos individuales dentro de un lote.
-- ------------------------------------------------------------
create table if not exists conferencia.envios (
  id          uuid primary key default gen_random_uuid(),
  registro_id uuid not null
              references conferencia.registros(id) on delete cascade,
  email       text not null,
  asunto      text not null,
  ok          boolean not null default false,
  error       text,
  created_at  timestamptz not null default now()
);

create index if not exists envios_registro_idx
  on conferencia.envios (registro_id, created_at desc);

-- ------------------------------------------------------------
-- 3. Presencia ("conectados ahora")
--
-- OJO CON LO QUE MIDE: hoy el directo no existe, así que esto
-- cuenta gente CON LA PÁGINA ABIERTA, no gente viendo. Cuando
-- haya reproductor habrá que atarlo a que esté reproduciendo.
--
-- No se guarda nada personal: un identificador de sesión anónimo
-- que genera el navegador y la última vez que dio señales. Las
-- filas viejas se pueden borrar sin más.
-- ------------------------------------------------------------
create table if not exists conferencia.presencia (
  sesion_id text primary key,
  last_seen timestamptz not null default now()
);

create index if not exists presencia_last_seen_idx
  on conferencia.presencia (last_seen desc);

-- ------------------------------------------------------------
-- RLS activado y SIN políticas, como el resto del schema:
-- anon/authenticated no pueden leer ni escribir nada. La única
-- entrada es service_role desde el servidor.
-- ------------------------------------------------------------
alter table conferencia.ajustes   enable row level security;
alter table conferencia.envios    enable row level security;
alter table conferencia.presencia enable row level security;

-- ------------------------------------------------------------
-- Permisos. 00045 ya dejó `alter default privileges`, pero se
-- repiten para no depender de qué rol ejecute la migración.
-- Solo `service_role`, igual que el resto del schema.
-- ------------------------------------------------------------
grant select, insert, update, delete on conferencia.ajustes   to service_role;
grant select, insert, update, delete on conferencia.envios    to service_role;
grant select, insert, update, delete on conferencia.presencia to service_role;

-- ------------------------------------------------------------
-- Plantilla inicial de la invitación.
--
-- Los marcadores disponibles son {{nombre}} y {{email}}.
-- `on conflict do nothing`: si ya existe, NO se pisa lo que haya
-- escrito el usuario desde el panel.
-- ------------------------------------------------------------
insert into conferencia.ajustes (clave, valor) values
  ('plantilla_invitacion_asunto', 'Te esperamos en IKMA'),
  ('plantilla_invitacion_cuerpo',
'<p>Hola {{nombre}},</p>
<p>Gracias por acompañarnos en la Conferencia IKMA. Esperamos que haya sido
tan valioso para ti como para nosotros.</p>
<p>Si quieres seguir formando parte de esta comunidad, puedes hacerte miembro
de IKMA y acceder a nuestros contenidos, revistas y próximos encuentros.</p>
<p>Un abrazo,<br/>El equipo de IKMA</p>')
on conflict (clave) do nothing;
