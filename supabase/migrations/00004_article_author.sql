-- Add author columns to articles table
alter table public.articulos add column if not exists autor_nombre text;
alter table public.articulos add column if not exists autor_avatar_url text;
