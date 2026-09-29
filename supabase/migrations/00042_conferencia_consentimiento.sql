-- ============================================================
-- Conferencia IKMA — Consentimiento del asistente
-- ------------------------------------------------------------
-- El diseño de la landing incluye un checkbox de aceptación.
-- Se guarda el booleano más la fecha/hora de aceptación para
-- trazabilidad legal. Solo toca el schema `conferencia`.
-- ============================================================

alter table conferencia.registros
  add column if not exists consentimiento boolean not null default false,
  add column if not exists consentimiento_at timestamptz;
