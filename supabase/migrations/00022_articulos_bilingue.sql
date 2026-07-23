-- Add Spanish language columns to articulos table
-- English columns (titulo, contenido_html, resumen) remain as-is for the default/English version

alter table public.articulos
  add column titulo_es text,
  add column contenido_html_es text,
  add column resumen_es text;
