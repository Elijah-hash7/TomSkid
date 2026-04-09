-- ============================================================
-- Tomskid eSIM Platform — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================


-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id      uuid        primary key references auth.users (id) on delete cascade,
  email   text        not null,
  role    text        not null default 'customer'
                      check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile whenever a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 2. CARRIERS
-- ============================================================
create table if not exists public.carriers (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null unique,
  logo_url    text,
  description text,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now()
);


-- ============================================================
-- 3. PLANS
-- ============================================================
create table if not exists public.plans (
  id            uuid        primary key default gen_random_uuid(),
  carrier_id    uuid        not null references public.carriers (id) on delete cascade,
  name          text        not null,
  data_label    text        not null,          -- e.g. "10 GB"
  validity_days int         not null,
  price_cents   int         not null,          -- price in kobo-style minor units (e.g. 2500 = NGN 25.00)
  currency      text        not null default 'NGN',
  features      text[],                        -- e.g. ARRAY['5G', 'Hotspot']
  badge         text,                          -- e.g. "Best Value"
  is_featured   boolean     not null default false,
  is_active     boolean     not null default true,
  archived_at   timestamptz,
  created_at    timestamptz not null default now()
);


-- ============================================================
-- 4. ORDERS
-- ============================================================
create table if not exists public.orders (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        not null references auth.users (id) on delete cascade,
  plan_id               uuid        not null references public.plans (id),
  status                text        not null default 'pending'
                                    check (status in ('pending', 'processing', 'delivered')),
  -- Customer info
  full_name             text        not null,
  email                 text        not null,
  phone_model           text        not null,
  state                 text        not null,
  zip_code              text        not null,
  imei                  text        not null,
  -- File paths (Supabase Storage)
  imei_screenshot_path  text,
  delivery_proof_path   text,
  -- Admin
  admin_note            text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();


-- ============================================================
-- 5. ROW-LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.carriers  enable row level security;
alter table public.plans     enable row level security;
alter table public.orders    enable row level security;

-- Helper: returns true if the calling user has role = 'admin'
create or replace function public.is_admin()
returns boolean
language sql
security definer stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES ---------------------------------------------------
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- CARRIERS (public read, admin write) ------------------------
create policy "Anyone can read carriers"
  on public.carriers for select
  using (true);

create policy "Admins can manage carriers"
  on public.carriers for all
  using (public.is_admin());

-- PLANS (public read, admin write) ---------------------------
create policy "Anyone can read plans"
  on public.plans for select
  using (true);

create policy "Admins can manage plans"
  on public.plans for all
  using (public.is_admin());

-- ORDERS -----------------------------------------------------
-- Customers see only their own orders
create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Customers can create orders for themselves
create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Customers can update imei_screenshot_path while order is still pending
create policy "Users can attach screenshot on pending orders"
  on public.orders for update
  using  (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);

-- Admins can read ALL orders
create policy "Admins can read all orders"
  on public.orders for select
  using (public.is_admin());

-- Admins can update any order (status, delivery_proof_path, admin_note)
create policy "Admins can update any order"
  on public.orders for update
  using (public.is_admin());


-- ============================================================
-- 6. STORAGE BUCKETS
-- ============================================================
-- Create in Supabase Dashboard → Storage, or run:
insert into storage.buckets (id, name, public)
values
  ('imei-screenshots', 'imei-screenshots', false),
  ('delivery-proofs',  'delivery-proofs',  false)
on conflict (id) do nothing;

-- imei-screenshots: path = {user_id}/{order_id}/{filename}
create policy "Users can upload own IMEI screenshot"
  on storage.objects for insert
  with check (
    bucket_id = 'imei-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own IMEI screenshot"
  on storage.objects for select
  using (
    bucket_id = 'imei-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins can read all IMEI screenshots"
  on storage.objects for select
  using (bucket_id = 'imei-screenshots' and public.is_admin());

-- delivery-proofs: path = {order_id}/{filename}
create policy "Admins can upload delivery proofs"
  on storage.objects for insert
  with check (bucket_id = 'delivery-proofs' and public.is_admin());

create policy "Admins can read all delivery proofs"
  on storage.objects for select
  using (bucket_id = 'delivery-proofs' and public.is_admin());

-- Customers can read delivery proof for their own orders
-- (server actions handle this via signed URLs — see app/actions/files.ts)
