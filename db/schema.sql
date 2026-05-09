-- ProjectFlow schema. Run in Supabase SQL editor in order.
-- Idempotent-ish: drops constraints/tables only if you uncomment the
-- corresponding line. By default, just creates.

-- 1. USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  role text not null default 'MEMBER' check (role in ('ADMIN', 'MANAGER', 'MEMBER')),
  avatar text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. PROJECTS
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  deadline date,
  owner_id uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PROJECT MEMBERS
create table if not exists project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(project_id, user_id)
);

-- 4. TASKS
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'TODO' check (status in ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')),
  priority text not null default 'MEDIUM' check (priority in ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  deadline date,
  project_id uuid references projects(id) on delete cascade,
  assignee_id uuid references users(id) on delete set null,
  creator_id uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helpful indexes for the queries we actually run
create index if not exists idx_tasks_project on tasks(project_id);
create index if not exists idx_tasks_assignee on tasks(assignee_id);
create index if not exists idx_project_members_user on project_members(user_id);
