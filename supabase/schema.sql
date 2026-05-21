create table if not exists public.transfer_records (
  id text primary key,
  user_id text not null,
  recipient_name text not null,
  destination text not null,
  send_amount numeric(18, 2) not null default 0,
  send_currency text not null,
  receive_amount numeric(18, 2) not null default 0,
  receive_currency text not null,
  payment_method text not null,
  payment_intent_id text,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists transfer_records_user_created_idx
  on public.transfer_records (user_id, created_at desc);

create table if not exists public.kyc_records (
  user_id text primary key,
  provider text not null,
  provider_inquiry_id text,
  status text not null default 'required',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists kyc_records_status_idx
  on public.kyc_records (status, updated_at desc);

create table if not exists public.sanctions_screenings (
  id text primary key,
  user_id text not null,
  provider text not null,
  status text not null default 'required',
  subject jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sanctions_screenings_user_status_idx
  on public.sanctions_screenings (user_id, status, updated_at desc);

create table if not exists public.transfer_audit_logs (
  id uuid primary key default gen_random_uuid(),
  transfer_id text references public.transfer_records(id) on delete cascade,
  user_id text not null,
  action text not null,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.transfer_records enable row level security;
alter table public.kyc_records enable row level security;
alter table public.sanctions_screenings enable row level security;
alter table public.transfer_audit_logs enable row level security;

-- NexaRemit writes through serverless API routes with SUPABASE_SERVICE_ROLE_KEY.
-- Do not expose the service role key to the browser.
