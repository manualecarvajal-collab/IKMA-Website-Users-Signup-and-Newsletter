-- ============================================================
-- Conferencia IKMA — El directo pasa a máquina de estados
-- ------------------------------------------------------------
-- `directo_activo` era un booleano: encendido o apagado. Una
-- conferencia en directo no tiene dos momentos, tiene cuatro, y el
-- día del evento se cambia de uno a otro con prisa:
--
--   antes   → cuenta atrás. Público: todavía no hay nada que ver.
--   vivo    → transmisión. Con inscripción confirmada se ve; sin
--             ella, un bloqueo que invita a inscribirse.
--   espera  → pausa durante el evento. Aviso para todos, y quien
--             no está inscrito conserva el botón de inscribirse.
--   final   → la conferencia terminó. Cierre e invitación a
--             hacerse miembro.
--
-- El estado lo fija un administrador desde el panel, no el reloj:
-- la fecha del evento puede moverse y la hora real de cada momento
-- la sabe quien da al botón.
--
-- Se retira el booleano viejo para no dejar dos fuentes de verdad
-- que puedan contradecirse.
--
-- Solo toca el schema `conferencia`.
-- ============================================================

-- Estado por defecto. `on conflict do nothing`: si esta migración se
-- re-ejecuta, NO pisa el estado que el panel tenga puesto.
insert into conferencia.ajustes (clave, valor) values
  ('directo_estado', 'antes')
on conflict (clave) do nothing;

-- Conversión desde el booleano. Solo actúa si el estado sigue siendo
-- el de fábrica, así que tampoco pisa un estado puesto a mano.
update conferencia.ajustes
set valor = 'vivo', updated_at = now()
where clave = 'directo_estado'
  and valor = 'antes'
  and exists (
    select 1 from conferencia.ajustes
    where clave = 'directo_activo' and valor = 'true'
  );

-- Retirar el booleano: `directo_estado` es ya la única fuente.
delete from conferencia.ajustes where clave = 'directo_activo';
