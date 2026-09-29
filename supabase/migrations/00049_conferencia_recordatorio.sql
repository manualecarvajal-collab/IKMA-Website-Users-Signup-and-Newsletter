-- ============================================================
-- Conferencia IKMA — Segunda plantilla de correo (recordatorio)
-- ------------------------------------------------------------
-- El panel pasa a tener DOS plantillas:
--
--   1. Invitación a hacerse miembro  → botón a /membresia
--      (ya sembrada en la 00047 y traducida en la 00048)
--   2. Recordatorio de la conferencia → botón a /conferencia
--
-- El recordatorio manda a la LANDING, no al link de Zoom. Es
-- deliberado: así el enlace de la reunión nunca sale por correo y
-- no se puede reenviar a terceros.
--
-- `on conflict (clave) do nothing`: si ya existen, NO se pisan.
-- Solo toca el schema `conferencia`.
-- ============================================================

insert into conferencia.ajustes (clave, valor) values
  ('plantilla_recordatorio_asunto', 'The IKMA Conference is coming up'),
  ('plantilla_recordatorio_cuerpo',
'<p>Hi {{nombre}},</p>
<p>The IKMA Conference is almost here — Saturday, November 14.</p>
<p>Keep this email handy. Everything you need to join us on the day, including
the live stream and the full programme, is on the conference page.</p>
<p>See you there,<br/>The IKMA team</p>')
on conflict (clave) do nothing;
