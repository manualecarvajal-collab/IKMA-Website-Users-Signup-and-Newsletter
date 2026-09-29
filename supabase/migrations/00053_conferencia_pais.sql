-- ============================================================
-- Conferencia IKMA — País del asistente
-- ------------------------------------------------------------
-- Se añade `pais` (Country) además de `perfil_profesional`.
-- Se guarda el código ISO 3166-1 alpha-2 (p. ej. 'VE'), que es estable
-- e independiente del idioma; los nombres para mostrar se resuelven en el
-- cliente con Intl.DisplayNames.
-- Solo toca el schema `conferencia`.
-- ============================================================

alter table conferencia.registros
  add column if not exists pais text;

comment on column conferencia.registros.pais is
  'Código ISO 3166-1 alpha-2 (p. ej. VE, US, CO)';
