-- Visitas agregadas por día. Evita el límite de 1000 filas de PostgREST
-- cuando hay más de 1000 visitas en el período.
create view public.visitas_por_dia as
select created_at::date as dia, count(*) as total
from public.visitas
group by created_at::date
order by dia;
