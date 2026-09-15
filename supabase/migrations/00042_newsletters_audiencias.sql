-- The audience selector in the newsletter admin form has been writing
-- `audiencias` since the Admin Panel work (2026-08-17), but no migration ever
-- created the column. Every insert/update in src/lib/supabase/email-actions.ts
-- was failing with PGRST204 ("Could not find the 'audiencias' column") and the
-- error was discarded, so drafts and sends vanished silently while
-- actividad_admin still logged them as saved.
--
-- Valid values mirror the Audience union in src/lib/newsletter-audiences.ts:
--   registrados | estudiantes | residentes | licenciados | no_medicos
-- (`registrados` means everyone.)

alter table public.newsletters
  add column if not exists audiencias text[] not null default '{registrados}';

comment on column public.newsletters.audiencias is
  'Recipient groups this newsletter targets. Mirrors the Audience union in src/lib/newsletter-audiences.ts; "registrados" means everyone.';

-- Existing rows were sent before audience targeting existed, i.e. to everyone,
-- which is what the {registrados} default backfills and what the send path
-- already assumed (cron falls back to ["registrados"] when the value is unset).

-- Vocabulary guard: any subset of the known groups (empty array allowed) passes,
-- unknown values are rejected loudly instead of silently matching no recipients.
alter table public.newsletters
  drop constraint if exists newsletters_audiencias_valid;

alter table public.newsletters
  add constraint newsletters_audiencias_valid
  check (audiencias <@ array['registrados','estudiantes','residentes','licenciados','no_medicos']::text[]);
