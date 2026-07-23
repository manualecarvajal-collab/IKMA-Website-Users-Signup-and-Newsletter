-- Unique constraint on username in membership applications
-- First nullify duplicates (keep the earliest submission, clear later ones)
update public.solicitudes_membresia
set username = null
where id in (
  select id from (
    select id, username, row_number() over (partition by username order by created_at) as rn
    from public.solicitudes_membresia
    where username is not null
  ) dup
  where dup.rn > 1
);
alter table public.solicitudes_membresia
  add constraint solicitudes_membresia_username_key unique (username);

-- Auto-update updated_at on membership applications
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_updated_at_membresia
  before update on public.solicitudes_membresia
  for each row execute function public.set_updated_at();
