create extension if not exists pgcrypto;

create table if not exists public.ap_learn_block_requests (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.ap_learn_blocks(id) on delete cascade,
  topic text not null,
  request_type text not null check (request_type in ('edit', 'delete')),
  requester_id uuid not null,
  requester_name text not null,
  owner_id uuid not null,
  owner_name text not null,
  requested_comment text not null check (char_length(trim(requested_comment)) >= 10),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  decision_comment text,
  decided_by uuid,
  decided_by_name text,
  decided_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists ap_learn_block_requests_owner_status_idx
on public.ap_learn_block_requests (owner_id, status, created_at desc);

create index if not exists ap_learn_block_requests_requester_idx
on public.ap_learn_block_requests (requester_id, created_at desc);
