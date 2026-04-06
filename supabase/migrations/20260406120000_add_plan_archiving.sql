alter table public.plans
  add column if not exists is_active boolean not null default true,
  add column if not exists archived_at timestamptz;

create index if not exists plans_is_active_idx on public.plans (is_active);
