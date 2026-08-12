-- Google OAuth stores the name in raw_user_meta_data as 'full_name' (or 'name'),
-- not 'nombre_completo'. Fall back to those keys when creating the profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre_completo, rol, suscripcion_activa)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'nombre_completo',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    'lector',
    false
  );
  return new;
end;
$$;

-- Backfill existing profiles created with an empty name.
update public.perfiles p
set nombre_completo = coalesce(
  u.raw_user_meta_data ->> 'nombre_completo',
  u.raw_user_meta_data ->> 'full_name',
  u.raw_user_meta_data ->> 'name',
  p.nombre_completo
)
from auth.users u
where u.id = p.id
  and (p.nombre_completo is null or p.nombre_completo = '');