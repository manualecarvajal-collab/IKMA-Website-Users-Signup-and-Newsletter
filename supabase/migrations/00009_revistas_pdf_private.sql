-- Make revistas-pdf bucket private
update storage.buckets
set public = false
where id = 'revistas-pdf';

-- Remove overly permissive policies
drop policy if exists "Anyone can view PDFs" on storage.objects;

-- Only authenticated users with active subscription can view PDFs
create policy "Subscribers can view PDFs"
on storage.objects for select
using (
  bucket_id = 'revistas-pdf'
  and auth.role() = 'authenticated'
  and exists (
    select 1 from public.perfiles
    where id = auth.uid()
    and suscripcion_activa = true
  )
);

-- Admins can always view PDFs
create policy "Admins can view PDFs"
on storage.objects for select
using (
  bucket_id = 'revistas-pdf'
  and exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'administrador'
  )
);

-- Authenticated users can upload PDFs (for newsletter attachments etc.)
create policy "Authenticated users can upload PDFs"
on storage.objects for insert
with check (
  bucket_id = 'revistas-pdf'
  and auth.role() = 'authenticated'
);

-- Owners can delete their PDFs
create policy "Owners can delete PDFs"
on storage.objects for delete
using (
  bucket_id = 'revistas-pdf'
  and auth.uid() = owner
);
