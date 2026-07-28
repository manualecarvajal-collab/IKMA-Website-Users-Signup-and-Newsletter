-- A9: Remove fake seed data that should only exist in seed.sql (local)
-- These are fictional doctors and articles that were mistakenly included in migrations

delete from public.doctores where nombre in (
  'Dr. Sarah Jenkins',
  'Dr. Marcus Chen',
  'Dr. Elena Rodriguez',
  'Dr. David Osei'
);

delete from public.articulos where slug in (
  'nuevo-campamento-medico',
  'esperanza-en-tiempos-dificiles',
  'iniciativas-globales-salud',
  'encuentro-comunitario',
  'voluntaria-sarah',
  'expandiendo-atencion-rural',
  'recuperacion-maria',
  'excelencia-medica-fe'
);
