-- Create storage bucket for article images
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload images
create policy "Authenticated users can upload article images"
on storage.objects for insert
with check (
  bucket_id = 'article-images'
  and auth.role() = 'authenticated'
);

-- Allow public read access
create policy "Anyone can view article images"
on storage.objects for select
using (bucket_id = 'article-images');

-- Allow owners to delete
create policy "Owners can delete article images"
on storage.objects for delete
using (
  bucket_id = 'article-images'
  and auth.uid() = owner
);
