-- WorkLog schema — run in Supabase SQL Editor
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  client text default '',
  start_date date,
  end_date date,
  status text default 'Active',
  notes text default '',
  is_sample boolean default false,
  created_at timestamptz default now()
);

create table if not exists work_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  project_id uuid references projects(id) on delete set null,
  category text default 'Other',
  status text default 'Planned',
  priority text default 'Medium',
  date date not null,
  start_time text default '',
  end_time text default '',
  duration_min integer default 0,
  is_extra boolean default false,
  extra_reason text default '',
  tags text[] default '{}',
  notes text default '',
  accomplishments text default '',
  issues_found text default '',
  is_sample boolean default false,
  created_at timestamptz default now()
);

create table if not exists evidence (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text default 'Link',
  url text default '',
  file_path text default '',
  project_id uuid references projects(id) on delete set null,
  work_entry_id uuid references work_entries(id) on delete set null,
  description text default '',
  date date,
  is_sample boolean default false,
  created_at timestamptz default now()
);

create table if not exists blockers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  project_id uuid references projects(id) on delete set null,
  waiting_for text default '',
  description text default '',
  status text default 'Open',
  created_date date,
  resolution text default '',
  resolution_date date,
  resolved_by text default '',
  resolution_notes text default '',
  is_sample boolean default false,
  created_at timestamptz default now()
);

create table if not exists meetings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  date date,
  start_time text default '',
  end_time text default '',
  attendees text default '',
  project_id uuid references projects(id) on delete set null,
  discussion text default '',
  decisions text default '',
  action_items text default '',
  follow_up_date date,
  notes text default '',
  is_sample boolean default false,
  created_at timestamptz default now()
);

create table if not exists learning (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  topic text not null,
  course text default '',
  date date,
  duration_min integer default 0,
  learned text default '',
  notes text default '',
  certificate_url text default '',
  is_sample boolean default false,
  created_at timestamptz default now()
);

-- Row-level security: users can only see their own rows
alter table profiles enable row level security;
alter table projects enable row level security;
alter table work_entries enable row level security;
alter table evidence enable row level security;
alter table blockers enable row level security;
alter table meetings enable row level security;
alter table learning enable row level security;

create policy "own profiles" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own projects" on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own work_entries" on work_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own evidence" on evidence for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own blockers" on blockers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own meetings" on meetings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own learning" on learning for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage bucket for evidence files
insert into storage.buckets (id, name, public) values ('evidence', 'evidence', true)
on conflict (id) do nothing;

create policy "own evidence files" on storage.objects for all
  using (bucket_id = 'evidence' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'evidence' and auth.uid()::text = (storage.foldername(name))[1]);
