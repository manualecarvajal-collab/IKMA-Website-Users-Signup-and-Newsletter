-- ============================================================
-- Conferencia IKMA — «Bait / Carnada»
-- ------------------------------------------------------------
-- El panel de la conferencia pasa a ser un panel de campañas
-- sobre los inscritos del evento. Necesita tres cosas:
--
--   1. `registros.idioma` — para mandar cada correo en el idioma
--      en el que se inscribió la persona. El formulario no lo
--      guardaba; a partir de ahora sí. Los históricos se
--      rellenan por país (ver nota).
--
--   2. `envios.plantilla` — para saber qué campaña recibió cada
--      inscrito (membresía, newsletter o próxima conferencia).
--
--   3. Las seis plantillas nuevas (3 campañas × ES/EN).
--
-- NOTA SOBRE EL IDIOMA HISTÓRICO
-- El formulario nunca guardó el idioma, así que el relleno por
-- país es una SUPOSICIÓN, no un dato. Solo los países
-- hispanohablantes quedan en `es`; todos los demás —incluidos
-- Francia, Nigeria o Brasil— quedan en `en` por defecto, tal
-- como se decidió. El panel permite corregir cada fila.
--
-- Solo toca el schema `conferencia`. Es idempotente.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Idioma del inscrito
-- ------------------------------------------------------------
alter table conferencia.registros
  add column if not exists idioma text;

-- El CHECK se agrega aparte para que la migración se pueda
-- re-ejecutar sin fallar si ya existe.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'registros_idioma_check'
      and conrelid = 'conferencia.registros'::regclass
  ) then
    alter table conferencia.registros
      add constraint registros_idioma_check
      check (idioma is null or idioma in ('es', 'en'));
  end if;
end $$;

-- Países hispanohablantes → español. El resto → inglés.
update conferencia.registros
set idioma = 'es'
where idioma is null
  and upper(trim(coalesce(pais, ''))) in (
    'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'ES', 'GQ',
    'GT', 'HN', 'MX', 'NI', 'PA', 'PE', 'PR', 'PY', 'SV', 'UY', 'VE'
  );

update conferencia.registros
set idioma = 'en'
where idioma is null;

-- ------------------------------------------------------------
-- 2. Campaña de cada envío
-- ------------------------------------------------------------
-- Queda nula en los envíos anteriores a esta migración: no se
-- puede reconstruir a qué campaña pertenecían.
alter table conferencia.envios
  add column if not exists plantilla text;

-- ------------------------------------------------------------
-- 3. Plantillas nuevas
-- ------------------------------------------------------------
-- `on conflict do nothing`: si ya existe una clave, no se pisa
-- lo que se haya editado desde el panel.
-- Los bloques usan $txt$ para no pelear con las comillas HTML.
-- ------------------------------------------------------------
insert into conferencia.ajustes (clave, valor) values
  ('plantilla_membresia_asunto_es', 'Tu lugar en IKMA'),
  ('plantilla_membresia_cuerpo_es', $txt$<p>Hola {{nombre}},</p>
<p>Gracias por acompañarnos en la Conferencia IKMA 2026. Esperamos que haya sido tan valioso para ti como para nosotros.</p>
<p>Si quieres seguir caminando con nosotros, puedes solicitar tu membresía de IKMA y acceder a nuestros contenidos, revistas y próximos encuentros.</p>
<p>Un abrazo,<br/>El equipo de IKMA</p>$txt$),
  ('plantilla_membresia_asunto_en', 'Your place at IKMA'),
  ('plantilla_membresia_cuerpo_en', $txt$<p>Hi {{nombre}},</p>
<p>Thank you for joining us at the IKMA Conference 2026. We hope it was as valuable for you as it was for us.</p>
<p>If you would like to keep walking with us, you can apply for IKMA membership and get access to our content, journals and upcoming gatherings.</p>
<p>Warm regards,<br/>The IKMA team</p>$txt$),

  ('plantilla_newsletter_asunto_es', 'Sigue conectado con IKMA'),
  ('plantilla_newsletter_cuerpo_es', $txt$<p>Hola {{nombre}},</p>
<p>Queremos seguir compartiendo contigo lo que hacemos: artículos, revistas y encuentros de la comunidad IKMA.</p>
<p>Suscríbete a nuestro boletín para recibir las novedades directamente en tu correo.</p>
<p>Un abrazo,<br/>El equipo de IKMA</p>$txt$),
  ('plantilla_newsletter_asunto_en', 'Stay connected with IKMA'),
  ('plantilla_newsletter_cuerpo_en', $txt$<p>Hi {{nombre}},</p>
<p>We want to keep sharing what we do with you: articles, journals and gatherings from the IKMA community.</p>
<p>Subscribe to our newsletter to get the latest news straight to your inbox.</p>
<p>Warm regards,<br/>The IKMA team</p>$txt$),

  ('plantilla_proxima_asunto_es', 'La próxima Conferencia IKMA'),
  ('plantilla_proxima_cuerpo_es', $txt$<p>Hola {{nombre}},</p>
<p>Gracias por haber sido parte de la Conferencia IKMA 2026.</p>
<p>Ya estamos preparando la próxima edición y queremos que seas de los primeros en saberlo. Las fechas y el programa se publicarán pronto.</p>
<p>Nos encantará volver a verte.</p>$txt$),
  ('plantilla_proxima_asunto_en', 'The next IKMA Conference'),
  ('plantilla_proxima_cuerpo_en', $txt$<p>Hi {{nombre}},</p>
<p>Thank you for being part of the IKMA Conference 2026.</p>
<p>We are already preparing the next edition and want you to be among the first to know. Dates and programme will be published soon.</p>
<p>We would love to see you again.</p>$txt$)
on conflict (clave) do nothing;
