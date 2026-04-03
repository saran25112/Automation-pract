create extension if not exists pgcrypto;

create table if not exists public.ap_users (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  email text not null unique,
  password_hash text not null,
  phone text,
  role text not null default 'user',
  page_status boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.ap_users
add column if not exists page_status boolean not null default false;

alter table public.ap_users
add column if not exists avatar_url text default '/static/avatars/avatar0.svg';

create or replace function public.set_ap_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists ap_users_set_updated_at on public.ap_users;

create trigger ap_users_set_updated_at
before update on public.ap_users
for each row
execute function public.set_ap_users_updated_at();

alter table public.ap_users enable row level security;
