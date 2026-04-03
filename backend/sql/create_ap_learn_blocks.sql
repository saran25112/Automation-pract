create extension if not exists pgcrypto;

create table if not exists public.ap_learn_blocks (
  id uuid primary key default gen_random_uuid(),
  topic text not null check (topic in ('java', 'selenium', 'testng', 'maven', 'extent', 'eclipse', 'pom')),
  block_type text not null check (block_type in ('heading', 'subheading', 'content', 'code')),
  content text not null,
  text_color text not null default '#e8e8f0',
  font_size integer not null default 18 check (font_size between 12 and 72),
  text_align text not null default 'left' check (text_align in ('left', 'center', 'right')),
  display_order integer not null default 1,
  created_by uuid,
  created_by_name text,
  last_edited_by uuid,
  last_edited_by_name text,
  last_edited_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.ap_learn_blocks
add column if not exists created_by uuid;

alter table public.ap_learn_blocks
add column if not exists created_by_name text;

alter table public.ap_learn_blocks
add column if not exists last_edited_by uuid;

alter table public.ap_learn_blocks
add column if not exists last_edited_by_name text;

alter table public.ap_learn_blocks
add column if not exists last_edited_at timestamptz not null default timezone('utc', now());

create index if not exists ap_learn_blocks_topic_order_idx
on public.ap_learn_blocks (topic, display_order, created_at);
