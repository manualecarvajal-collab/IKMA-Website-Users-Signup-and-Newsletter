-- ============================================================
-- Conferencia IKMA — Verificación por código (OTP)
-- ------------------------------------------------------------
-- El registro pasa a ser en dos pasos: se guarda el inscrito y se
-- le manda un código de 6 dígitos a su correo. Solo cuando lo
-- introduce correctamente pasa a `estado = 'confirmado'`.
--
-- `estado` NO es cosmético: es la puerta de acceso a la
-- transmisión. Sin `confirmado`, no hay acceso.
--
-- POR QUÉ AQUÍ Y NO CON SUPABASE AUTH
-- El flujo nativo (`auth.signInWithOtp`) crea una fila en
-- `auth.users` por cada inscrito, y eso vive en el sitio
-- principal: borrar el schema `conferencia` NO las eliminaría, y
-- además compartiría la plantilla de OTP con los flujos de
-- registro y recuperación del sitio. Todo el código vive aquí,
-- así que `DROP SCHEMA conferencia CASCADE` lo borra entero.
--
-- Solo toca el schema `conferencia`.
-- ============================================================

-- Marca de cuándo se verificó. Se separa del estado para poder
-- auditar sin depender de `estado` (que puede cambiar después).
alter table conferencia.registros
  add column if not exists verificado_at timestamptz;

-- ------------------------------------------------------------
-- Códigos emitidos.
--
-- Se guarda **una fila por emisión**, no una sola fila que se
-- sobrescribe: así un reenvío no pisa el código anterior y queda
-- rastro de cuántos se pidieron. El válido es siempre el último
-- no consumido y no caducado.
--
-- El código NUNCA se guarda en claro, solo su sha256 con el id del
-- registro como sal. Un código de 6 dígitos son un millón de
-- combinaciones, así que el hash no pretende ser irrompible: su
-- trabajo es que un volcado casual de la tabla no regale los
-- códigos activos. La defensa real son los 15 minutos de
-- caducidad y el límite de 5 intentos.
-- ------------------------------------------------------------
create table if not exists conferencia.codigos (
  id           uuid primary key default gen_random_uuid(),
  registro_id  uuid not null
               references conferencia.registros(id) on delete cascade,
  code_hash    text not null,
  expires_at   timestamptz not null,
  intentos     smallint not null default 0,
  consumido_at timestamptz,
  created_at   timestamptz not null default now()
);

-- El caso de uso es siempre "el último código de este registro".
create index if not exists codigos_registro_created_idx
  on conferencia.codigos (registro_id, created_at desc);

-- Cuántos códigos se han pedido para un email en la última hora:
-- sirve para cortar el abuso de reenvíos (spam a un tercero).
create index if not exists codigos_created_at_idx
  on conferencia.codigos (created_at desc);

alter table conferencia.codigos enable row level security;

-- ------------------------------------------------------------
-- Permisos.
--
-- 00054 ya dejó `alter default privileges`, así que esta tabla
-- los hereda sola al crearla `postgres`. Se repiten aquí de forma
-- explícita para que la migración no dependa de quién la ejecute:
-- si alguien la lanza con otro rol, los default privileges no
-- aplicarían y el formulario fallaría con 42501.
--
-- Solo `service_role`, igual que el resto del schema: `anon` y
-- `authenticated` no reciben nada y quedan fuera a nivel de schema.
-- ------------------------------------------------------------
grant select, insert, update, delete
  on conferencia.codigos to service_role;
