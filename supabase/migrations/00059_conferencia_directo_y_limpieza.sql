-- ============================================================
-- Conferencia IKMA — Directo activo y limpieza de abandonados
-- ------------------------------------------------------------
-- Dos cosas independientes, ambas dentro del schema aislado.
-- ============================================================

-- ------------------------------------------------------------
-- 1. `directo_activo` — el interruptor del directo.
--
-- Mientras esté en 'false', el panel 5 de la landing enseña el
-- contador A TODO EL MUNDO, inscrito o no. Al ponerlo en 'true':
--
--   confirmado  → ve la transmisión (embed) o el botón que la abre
--   sin confirmar → ve una pantalla de bloqueo que le invita a
--                   inscribirse, y el enlace NO viaja en el HTML
--
-- Es manual a propósito. La fecha del evento puede moverse y la
-- hora real de arranque no la sabe un reloj: la sabe quien da al
-- botón. Derivarlo de `EVENT_DATE` bloquearía la página antes de
-- que exista transmisión si el evento se retrasa.
--
-- Clave nueva, no hay nada que migrar: `on conflict do nothing`.
-- ------------------------------------------------------------
insert into conferencia.ajustes (clave, valor) values
  ('directo_activo', 'false')
on conflict (clave) do nothing;

-- ------------------------------------------------------------
-- 2. Purga de inscripciones abandonadas.
--
-- El formulario es público, así que cualquiera puede crear una
-- fila con `estado = 'nuevo'` y un correo que no es suyo (o uno
-- inventado). Esas filas NO son inscripciones: nadie ha demostrado
-- que el buzón sea suyo. Dejarlas es lo que ensucia la lista del
-- panel, que es justo la que se va a usar para invitar a la
-- membresía y al newsletter.
--
-- Se borran pasados 7 días: el flujo OTP entero dura 15 minutos,
-- así que ese margen no le quita la inscripción a nadie que esté
-- de verdad a medio registrarse. Los `confirmado` y `cancelado`
-- NO se tocan nunca.
--
-- `codigos` y `envios` referencian `registros` con ON DELETE
-- CASCADE, así que se van con ellas. `presencia` es independiente.
--
-- Re-ejecutable: a la segunda pasada no queda ninguna fila que
-- cumpla la condición y no borra nada.
--
-- OJO: esto limpia el atraso UNA VEZ. Para que no se vuelva a
-- acumular hace falta repetirlo (o un cron) — ver conferencia.md.
-- ------------------------------------------------------------
delete from conferencia.registros
where estado = 'nuevo'
  and created_at < now() - interval '7 days';
