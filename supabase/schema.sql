-- Resume Screener schema
-- Run this in the Supabase SQL editor (or via the migration script) before deploying.

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  department text,
  location text,
  description text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  age text not null,
  current_location text not null,
  address text not null,
  resume_file_name text not null,
  resume_file_size integer not null default 0,
  resume_parsed_text text not null,
  match_score integer not null,
  verdict text not null,
  fit_summary text not null,
  strengths jsonb not null default '[]'::jsonb,
  gaps jsonb not null default '[]'::jsonb,
  follow_up_questions jsonb not null default '[]'::jsonb,
  model_used text not null,
  status text not null default 'submitted',
  submitted_at timestamptz not null default now()
);

create index if not exists applications_job_id_idx on applications(job_id);

-- RLS: this app talks to Supabase only via the server-side service role key
-- (never exposed to the browser), so we lock the tables down from the public
-- anon key entirely rather than writing per-row policies.
alter table jobs enable row level security;
alter table applications enable row level security;
