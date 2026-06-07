-- Create storage bucket for doctor images
insert into storage.buckets (id, name, public)
values ('doctor-images', 'doctor-images', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
with check (
  bucket_id = 'doctor-images'
  and auth.role() = 'authenticated'
);

-- Allow public read access
create policy "Anyone can view images"
on storage.objects for select
using (bucket_id = 'doctor-images');

-- Allow owners to delete
create policy "Owners can delete images"
on storage.objects for delete
using (
  bucket_id = 'doctor-images'
  and auth.uid() = owner
);
