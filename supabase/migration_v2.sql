
-- Run this in your Supabase SQL Editor to update your database

-- 1. Add Emoji Support
alter table public.moods add column if not exists emoji text;

update public.moods set emoji = '🤩' where name = 'Great';
update public.moods set emoji = '🙂' where name = 'Good';
update public.moods set emoji = '😐' where name = 'Okay';
update public.moods set emoji = '😔' where name = 'Low';
update public.moods set emoji = '😫' where name = 'Awful';

-- 2. Create Todos Table
create table if not exists public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

alter table public.todos enable row level security;

-- Policies (Safe to run if they fail on existence, or drop/recreate)
drop policy if exists "Users can view own todos" on public.todos;
create policy "Users can view own todos" on public.todos for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own todos" on public.todos;
create policy "Users can insert own todos" on public.todos for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own todos" on public.todos;
create policy "Users can update own todos" on public.todos for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own todos" on public.todos;
create policy "Users can delete own todos" on public.todos for delete using (auth.uid() = user_id);
