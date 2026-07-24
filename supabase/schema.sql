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
