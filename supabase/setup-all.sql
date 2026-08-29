-- ============================================================
-- KeyCartX / Mello — FULL DATABASE SETUP
-- Paste this whole file into Supabase -> SQL Editor -> Run.
-- Safe to re-run (idempotent).
-- Combines, in dependency order:
--   1. schema.sql          tables, RLS policies, new-user trigger
--   2. settings.sql        CMS settings row + 'media' storage bucket
--   3. seed.sql            sample products (tshirt)
--   4. seed-categories.sql sample products (anime/gym/college/mafia/office)
-- ============================================================

-- ============ 1. schema.sql ============
-- Mello schema for Supabase (Postgres)
-- Run this in Supabase → SQL Editor. Safe to re-run (idempotent where practical).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles  (1:1 with auth.users; holds name + role)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  phone      text,
  avatar_url text,
  role       text not null default 'user',   -- 'user' | 'admin'
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current user an admin? (used by RLS policies)
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title             text not null,
  description       text default '',
  price             integer not null,        -- in paisa
  mrp               integer,                 -- in paisa
  image_url         text default '',
  images            text[] default '{}',
  sizes             text[] default '{S,M,L,XL}',
  colors            text[] default '{}',
  in_stock          boolean not null default true,
  category          text default 'tshirt',
  sub_category      text,
  about_items       text[] default '{}',
  rating            numeric(2,1) default 0,
  reviews_count     integer default 0,
  badge             text,
  best_price_note   text,
  technical_details jsonb default '[]'::jsonb,
  free_delivery     boolean default true,
  replacement_policy text default '3 days replacement',
  meta              jsonb default '{}'::jsonb,   -- admin-only fields (brand, gst, supplier price, etc.)
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_slug_idx on public.products (slug);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id    uuid references auth.users (id) on delete set null,
  reviewer   text default 'Anonymous',
  text       text not null,
  rating     integer not null default 5 check (rating between 1 and 5),
  image      text default '',
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_idx on public.reviews (product_id);

-- ---------------------------------------------------------------------------
-- carts  (one row per user, items as jsonb — single source of truth)
-- ---------------------------------------------------------------------------
create table if not exists public.carts (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  items      jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete set null,
  items      jsonb not null,                  -- price-snapshotted line items
  total      integer not null,                -- in paisa
  shipping   jsonb default '{}'::jsonb,
  payment    jsonb default '{}'::jsonb,        -- {provider, status, razorpay_order_id, razorpay_payment_id}
  status     text not null default 'pending',  -- pending | paid | shipped | delivered | cancelled
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.reviews  enable row level security;
alter table public.carts    enable row level security;
alter table public.orders   enable row level security;

-- profiles: a user can read/update their own; admins can read all.
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- products: public read; only admins write.
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- reviews: public read; authenticated users insert their own.
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = user_id or user_id is null);

-- carts: owner only.
drop policy if exists "carts_owner_all" on public.carts;
create policy "carts_owner_all" on public.carts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- orders: owner reads own; admins read all. Inserts/updates go through the
-- service-role key on the server, which bypasses RLS.
drop policy if exists "orders_owner_read" on public.orders;
create policy "orders_owner_read" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

-- ============ 2. settings.sql ============
-- Home-page CMS settings + media storage bucket. Run in Supabase → SQL Editor.

-- Single-row settings table (id is always 1).
create table if not exists public.site_settings (
  id         int primary key default 1,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_settings_single_row check (id = 1)
);

insert into public.site_settings (id, data) values (1, '{}') on conflict (id) do nothing;

alter table public.site_settings enable row level security;

-- Anyone can read settings (needed to render the home page); writes go through
-- the service-role key on the server, which bypasses RLS.
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select using (true);

-- Public storage bucket for hero/banner images & videos.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- ============ 3. seed.sql ============
-- Seed catalog for Mello. Run after schema.sql. Prices are in paisa.
insert into public.products (slug, title, description, price, mrp, image_url, images, sizes, rating, reviews_count, badge, best_price_note, category)
values
  (
    'crisp-white-tee',
    'Crisp White Tee',
    'Clean look. Breathable fabric for everyday wear.',
    54900, 119900,
    'https://images.unsplash.com/photo-1589902860314-e910697dea18?auto=format&fit=crop&q=80&w=687',
    array[
      'https://images.unsplash.com/photo-1589902860314-e910697dea18?auto=format&fit=crop&q=80&w=687',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=687',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=687'
    ],
    array['S','M','L','XL'], 4.6, 195, 'TRENDING', 'Best price ₹499', 'tshirt'
  ),
  (
    'classic-black-tee',
    'Classic Black Tee',
    'Timeless. Essential black tee for any wardrobe.',
    49900, 99900,
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=687',
    array[
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=687',
      'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&q=80&w=687'
    ],
    array['S','M','L','XL'], 4.8, 230, 'BEST SELLER', 'Best price ₹449', 'tshirt'
  ),
  (
    'royal-blue-tee',
    'Royal Blue Tee',
    'Vibrant. Stand out with this bold royal blue.',
    54900, 119900,
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=687',
    array[
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=687',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=687'
    ],
    array['S','M','L','XL'], 4.5, 142, 'NEW', 'Best price ₹499', 'tshirt'
  )
on conflict (slug) do nothing;

-- To make yourself an admin after registering, run (replace the email):
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');

-- ============ 4. seed-categories.sql ============
-- Sample products for each category page (anime, gym, college, mafia, office).
-- Run in Supabase → SQL Editor. Prices are in paisa. Safe to re-run.
insert into public.products (slug, title, description, price, mrp, image_url, sizes, rating, reviews_count, badge, category)
values
  ('anime-hero-tee',   'Anime Hero Tee',    'Bold anime graphic on premium cotton.',      59900, 129900, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=687', array['S','M','L','XL'], 4.7, 88,  'TRENDING',    'anime'),
  ('anime-mecha-tee',  'Mecha Strike Tee',  'Futuristic mecha print, oversized fit.',     64900, 139900, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=687', array['M','L','XL'],     4.6, 54,  'NEW',         'anime'),

  ('gym-beast-tee',    'Beast Mode Tee',    'Sweat-wicking fabric for heavy lifting.',    54900, 109900, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=687', array['S','M','L','XL','XXL'], 4.8, 120, 'BEST SELLER', 'gym'),
  ('gym-pump-tank',    'Pump Cover Tank',   'Breathable tank for the grind.',             44900, 89900,  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=687', array['S','M','L','XL'], 4.5, 73,  null,          'gym'),

  ('college-varsity-tee', 'Varsity Classic Tee', 'Campus-ready everyday essential.',       49900, 99900,  'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&q=80&w=687', array['S','M','L','XL'], 4.4, 61,  null,          'college'),
  ('college-crew-tee',    'Campus Crew Tee',     'Soft cotton crew neck for lectures & chai.', 47900, 94900, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=687', array['S','M','L','XL'], 4.6, 47, 'NEW',          'college'),

  ('mafia-don-tee',    'The Don Tee',       'Pinstripe-inspired, strictly fashion.',      69900, 149900, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=687', array['M','L','XL'],     4.9, 35,  'BEST SELLER', 'mafia'),
  ('mafia-omerta-tee', 'Omertà Tee',        'Silence speaks. Heavyweight black tee.',     64900, 139900, 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=687', array['S','M','L','XL'], 4.7, 28,  null,          'mafia'),

  ('office-formal-tee','Smart Formal Tee',  'Polished look for the modern workplace.',    52900, 104900, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=687', array['S','M','L','XL'], 4.3, 40,  null,          'office'),
  ('office-minimal-tee','Minimal Pocket Tee','Clean lines, subtle chest pocket.',         54900, 109900, 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&q=80&w=687', array['S','M','L','XL'], 4.5, 52, 'TRENDING',     'office')
on conflict (slug) do nothing;
