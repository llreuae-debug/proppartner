-- ==============================================================================
-- Supabase Storage Bucket Setup Migration: project-photos
-- File: supabase/migrations/20260902_create_storage_bucket.sql
-- ==============================================================================

-- 1. Insert Storage Bucket for Project Photos (if not exists)
insert into storage.buckets (id, name, public)
values ('project-photos', 'project-photos', true)
on conflict (id) do nothing;

-- 2. Storage Policies
-- Public read access for cover images and photos
create policy "Public Access to Project Photos"
on storage.objects for select
using ( bucket_id = 'project-photos' );

-- Authenticated users / Admins can upload photos
create policy "Authenticated Users Can Upload Project Photos"
on storage.objects for insert
with check (
  bucket_id = 'project-photos'
  and auth.role() = 'authenticated'
);

-- Authenticated users / Admins can update photos
create policy "Authenticated Users Can Update Project Photos"
on storage.objects for update
using (
  bucket_id = 'project-photos'
  and auth.role() = 'authenticated'
);

-- Authenticated users / Admins can delete photos
create policy "Authenticated Users Can Delete Project Photos"
on storage.objects for delete
using (
  bucket_id = 'project-photos'
  and auth.role() = 'authenticated'
);
