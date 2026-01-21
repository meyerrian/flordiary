-- Create a specific schema for private tables if desired, but public is fine for MVP + RLS.

-- 1. PROFILES
-- Extends the Auth User table.
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  timezone text default 'UTC',
  reminder_enabled boolean default true,
  reminder_time_local time default '20:00:00',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Trigger to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. MOODS
-- Static table for the mood definitions.
create table public.moods (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  color_hex text not null, -- Store format like '#34d399' or CSS var name
  sort_order int not null default 0,
  created_at timestamptz default now()
);

alter table public.moods enable row level security;

-- Policies: Everyone can read moods, no one can write (except admin/service role)
create policy "Moods are viewable by everyone" on public.moods
  for select using (true);

-- Seed Data
insert into public.moods (name, color_hex, sort_order) values
('Great', '#34d399', 1), -- Emerald
('Good', '#a3e635', 2),  -- Lime
('Okay', '#facc15', 3),  -- Amber
('Low', '#fb923c', 4),   -- Orange
('Awful', '#f87171', 5); -- Rose


-- 3. DIARY ENTRIES
create table public.entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  mood_id uuid not null references public.moods(id),
  entry_date date not null, -- Stores the LOCAL date of the user (YYYY-MM-DD)
  notes text,
  tags text[], -- Array of strings for tags
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, entry_date)
);

alter table public.entries enable row level security;

create policy "Users can view own entries" on public.entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own entries" on public.entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own entries" on public.entries
  for update using (auth.uid() = user_id);

create policy "Users can delete own entries" on public.entries
  for delete using (auth.uid() = user_id);

-- 4. TODOS (New Feature)
create table public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null, -- Tasks are daily
  content text not null,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(user_id, date, content) -- Prevent duplicates for same day
);

alter table public.todos enable row level security;

create policy "Users can view own todos" on public.todos
  for select using (auth.uid() = user_id);

create policy "Users can insert own todos" on public.todos
  for insert with check (auth.uid() = user_id);

create policy "Users can update own todos" on public.todos
  for update using (auth.uid() = user_id);

create policy "Users can delete own todos" on public.todos
  for delete using (auth.uid() = user_id);

-- 5. MOOD EMOJIS UPDATE
-- Add emoji column to moods if it doesn't exist (Manual run required on existing DB)
-- alter table public.moods add column emoji text;

-- Update seed data with emojis
-- update public.moods set emoji = '🤩' where name = 'Great';
-- update public.moods set emoji = '🙂' where name = 'Good';
-- update public.moods set emoji = '😐' where name = 'Okay';
-- update public.moods set emoji = '😔' where name = 'Low';
-- update public.moods set emoji = '😫' where name = 'Awful';

