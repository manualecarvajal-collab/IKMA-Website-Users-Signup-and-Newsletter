-- ============================================================
-- Conferencia IKMA — Plantilla de invitación en inglés
-- ------------------------------------------------------------
-- La plantilla se sembró en español en la 00056. Aquí se pasa a
-- inglés, incluida la frase fija del shell.
--
-- IMPORTANTE: los dos UPDATE van condicionados a que el valor sea
-- TODAVÍA el de fábrica. Si ya has editado el asunto o el cuerpo
-- desde el panel, esta migración NO toca nada: no pisa tu trabajo.
-- Y por lo mismo se puede re-ejecutar sin efecto.
--
-- Solo toca el schema `conferencia`.
-- ============================================================

update conferencia.ajustes
set valor = 'Become part of IKMA',
    updated_at = now()
where clave = 'plantilla_invitacion_asunto'
  and valor = 'Te esperamos en IKMA';

update conferencia.ajustes
set valor = $en$<p>Hi {{nombre}},</p>
<p>Thank you for joining us at the IKMA Conference. We hope it was as
valuable for you as it was for us.</p>
<p>If you would like to remain part of this community, you can become a
member of IKMA and get access to our content, journals and upcoming
gatherings.</p>
<p>Warm regards,<br/>The IKMA team</p>$en$,
    updated_at = now()
where clave = 'plantilla_invitacion_cuerpo'
  and valor = $es$<p>Hola {{nombre}},</p>
<p>Gracias por acompañarnos en la Conferencia IKMA. Esperamos que haya sido
tan valioso para ti como para nosotros.</p>
<p>Si quieres seguir formando parte de esta comunidad, puedes hacerte miembro
de IKMA y acceder a nuestros contenidos, revistas y próximos encuentros.</p>
<p>Un abrazo,<br/>El equipo de IKMA</p>$es$;
