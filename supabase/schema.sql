-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Users)
-- Managed via Supabase Auth, but we keep a public profile reference
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using ( true );
create policy "Users can insert their own profile." on public.profiles for insert with check ( auth.uid() = id );

-- 2. PROJECTS (Conversations)
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null default 'Nova Ideia',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.projects enable row level security;
create policy "Users can view own projects." on public.projects for select using ( auth.uid() = user_id );
create policy "Users can insert own projects." on public.projects for insert with check ( auth.uid() = user_id );
create policy "Users can update own projects." on public.projects for update using ( auth.uid() = user_id );

-- 3. GENERATIONS (Messages/Images)
create table public.generations (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) not null,
  role text not null check (role in ('user', 'model')),
  content text, -- Text prompt or Image URL (if stored in Storage)
  
  -- Metadata columns for easy querying
  prompt_text text, -- If role is model, what prompted it?
  ratio text,
  resolution text,
  temperature float,
  seed bigint,
  
  is_remix boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.generations enable row level security;
create policy "Users can view own generations." on public.generations for select using (auth.uid() = (select user_id from public.projects where id = project_id));
create policy "Users can insert own generations." on public.generations for insert with check (auth.uid() = (select user_id from public.projects where id = project_id));

-- 4. STORAGE BUCKET (Images)
-- Note: You must create a bucket named 'generated-images' in the dashboard.
-- Policy:
-- insert: auth.role() = 'authenticated'
-- select: auth.role() = 'authenticated'
