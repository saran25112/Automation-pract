create extension if not exists pgcrypto;

create table if not exists public.ap_practice_advanced_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  button_text text not null,
  target_url text not null,
  display_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ap_practice_advanced_items_order_idx
on public.ap_practice_advanced_items (display_order, created_at);
