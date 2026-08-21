-- Allow account deletion to cascade past content FKs.
-- articulos.autor_id and newsletters.enviado_por had no ON DELETE clause
-- (default NO ACTION), which blocked auth.users cascade delete and made
-- deleteAccount() fail silently for any user with articles or newsletters.
alter table public.articulos
  drop constraint if exists articulos_autor_id_fkey,
  add constraint articulos_autor_id_fkey
    foreign key (autor_id) references public.perfiles(id) on delete set null;

alter table public.newsletters
  drop constraint if exists newsletters_enviado_por_fkey,
  add constraint newsletters_enviado_por_fkey
    foreign key (enviado_por) references auth.users on delete set null;
