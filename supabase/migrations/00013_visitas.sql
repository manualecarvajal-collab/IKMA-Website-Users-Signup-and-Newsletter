create table if not exists public.visitas (
  id bigint primary key generated always as identity,
  path text not null,
  created_at timestamp with time zone default now()
);

create index idx_visitas_created_at on public.visitas (created_at desc);
