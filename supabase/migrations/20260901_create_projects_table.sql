-- ==============================================================================
-- Supabase / PostgreSQL Migration: Create Projects Table & RLS Policies
-- File: supabase/migrations/20260901_create_projects_table.sql
-- ==============================================================================

-- 1. Create Projects Table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  client text,
  category text not null,
  description text,
  cover_image_url text not null,
  gallery_urls text[] default '{}',
  completion_date date,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Performance Indexes
create index if not exists idx_projects_slug on projects (slug);
create index if not exists idx_projects_category on projects (category);
create index if not exists idx_projects_featured on projects (featured) where featured = true;
create index if not exists idx_projects_created_at on projects (created_at desc);

-- 3. Automatic Updated_At Trigger Function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_projects_updated_at on projects;
create trigger set_projects_updated_at
before update on projects
for each row
execute function update_updated_at_column();

-- 4. Enable Row Level Security (RLS)
alter table projects enable row level security;

-- 5. RLS Policies
-- Policy: Public can read all active projects
drop policy if exists "Public projects are viewable by everyone." on projects;
create policy "Public projects are viewable by everyone." 
on projects for select using (true);

-- Policy: Authenticated admins can insert/update/delete
drop policy if exists "Admins can manage projects." on projects;
create policy "Admins can manage projects." 
on projects for all using (auth.role() = 'authenticated');

-- ==============================================================================
-- 6. Initial Seed Data (Commercial Real Estate Ecosystem)
-- ==============================================================================
insert into projects (title, slug, client, category, description, cover_image_url, gallery_urls, completion_date, featured)
values
(
  'Gatwala Commercial Hub',
  'gatwala-commercial-hub',
  'Gatwala Mega Developers',
  'Commercial Retail & Corporate Suites',
  'Premier multi-story commercial hub located at Canal Expressway, featuring ground-floor flagship retail shops, food courts, and luxury corporate executive offices.',
  'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
  ],
  '2025-12-31',
  true
),
(
  'Dragon Souk Commercial Market',
  'dragon-souk-commercial-market',
  'Dragon Souk Trade Holdings',
  'Wholesale & Trade Hub',
  'State-of-the-art wholesale shopping pavilions, import-export commercial halls, and bulk retail outlets with direct container freight logistics.',
  'https://images.unsplash.com/photo-1555636222-cae831e670b3?auto=format&fit=crop&w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1555636222-cae831e670b3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80'
  ],
  '2026-06-30',
  true
),
(
  'The Luminary Sky Residences',
  'luminary-towers',
  'Luminary Real Estate Group',
  'Luxury High-Rise Residential & Commercial',
  'Ultra-luxury architectural high-rise featuring signature sky suites, panoramic city views, infinity pools, and exclusive member concierge desks.',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
  ],
  '2026-03-31',
  true
),
(
  'Elysium Waterfront Villas',
  'elysium-waterfront',
  'Elysium Master Developments',
  'Waterfront Luxury Villas',
  'Exclusive private waterfront estate featuring custom beachfront architectural villas with private moorings and smart automation.',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  ],
  '2026-09-30',
  false
)
on conflict (slug) do nothing;
