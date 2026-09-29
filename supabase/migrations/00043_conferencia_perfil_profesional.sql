-- ============================================================
-- Conferencia IKMA — Perfil profesional
-- ------------------------------------------------------------
-- Cambios en `conferencia.registros`:
--   1. Se elimina `organizacion` (no se usa).
--   2. `cargo` (texto libre) pasa a `perfil_profesional`, restringido a
--      cuatro opciones.
--
-- Se guardan claves estables en inglés y en snake_case; las etiquetas para
-- el usuario viven en i18n (messages/*.json), así que se pueden traducir sin
-- tocar la base de datos.
-- Solo toca el schema `conferencia`.
-- ============================================================

alter table conferencia.registros drop column if exists organizacion;

-- Renombrado defensivo: si ya se renombró, no falla.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'conferencia'
      and table_name = 'registros'
      and column_name = 'cargo'
  ) then
    alter table conferencia.registros rename column cargo to perfil_profesional;
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'conferencia'
      and table_name = 'registros'
      and column_name = 'perfil_profesional'
  ) then
    alter table conferencia.registros add column perfil_profesional text;
  end if;
end $$;

-- Solo estos cuatro valores (o null, mientras no sea obligatorio).
alter table conferencia.registros
  drop constraint if exists registros_perfil_profesional_check;

alter table conferencia.registros
  add constraint registros_perfil_profesional_check
  check (
    perfil_profesional is null
    or perfil_profesional in (
      'student',
      'licensed_health_professional',
      'resident',
      'non_professional'
    )
  );
