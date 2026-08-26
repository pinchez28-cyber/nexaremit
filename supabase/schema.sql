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

create table if not exists public.risk_assessments (
  id text primary key,
  user_id text not null,
  status text not null,
  score integer not null default 0,
  reasons jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists risk_assessments_user_created_idx
  on public.risk_assessments (user_id, created_at desc);

-- Append-only AML record. transfer_id is a plain reference, deliberately not a
-- foreign key: audit rows are written before a transfer record exists, and an
-- audit trail that cascades away with its subject is not an audit trail.
--
-- If you already applied an earlier version of this schema, drop the old
-- constraint before writing audit rows:
--   alter table public.transfer_audit_logs
--     drop constraint if exists transfer_audit_logs_transfer_id_fkey;
create table if not exists public.transfer_audit_logs (
  id uuid primary key default gen_random_uuid(),
  transfer_id text,
  user_id text not null,
  action text not null,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists transfer_audit_logs_user_created_idx
  on public.transfer_audit_logs (user_id, created_at desc);

create index if not exists transfer_audit_logs_transfer_idx
  on public.transfer_audit_logs (transfer_id, created_at desc);

alter table public.transfer_records enable row level security;
alter table public.kyc_records enable row level security;
alter table public.sanctions_screenings enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.transfer_audit_logs enable row level security;

-- NexaRemit writes through serverless API routes with SUPABASE_SERVICE_ROLE_KEY.
-- Do not expose the service role key to the browser.

-- Demand for funding methods that are not live yet (see api/waitlist.js).
-- One row per email per method, so a repeat submission updates rather than
-- duplicates.
create table if not exists public.funding_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  method text not null default 'bank',
  device_id text,
  send_amount numeric(18, 2),
  send_currency text,
  receive_currency text,
  destination text,
  created_at timestamptz not null default now(),
  unique (email, method)
);

create index if not exists funding_waitlist_method_created_idx
  on public.funding_waitlist (method, created_at desc);

alter table public.funding_waitlist enable row level security;

-- Recipients a sender can pay out to.
--
-- account_identifier holds a bank account or mobile money number. It is
-- written by the serverless routes with the service role key and never
-- returned to the browser in full — see recipientRecords.js, which masks it to
-- the last four digits on the way out.
create table if not exists public.recipients (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  country text not null,
  country_code text not null,
  corridor text not null,
  payout_method text not null,
  receive_currency text not null,
  account_identifier text,
  account_name text,
  bank_code text,
  transfer_limit numeric(18, 2) not null default 2500,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipients_user_status_idx
  on public.recipients (user_id, status, created_at desc);

alter table public.recipients enable row level security;

-- Money owed to a recipient, and how far along delivering it has got.
--
-- A payout row is created the moment funding is confirmed, before any provider
-- exists to deliver it. Until now a successful card authorisation produced
-- nothing downstream, so there was no record of what was owed to whom and no
-- queue to work through once a payout partner signs.
--
-- status:
--   awaiting_provider  funded, but no payout provider is connected
--   pending            submitted to a provider, not yet confirmed
--   paid               provider confirmed delivery
--   failed             provider rejected or could not deliver
--   refunded           returned to the sender
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  transfer_id text not null,
  user_id text not null,
  recipient_id uuid,
  recipient_name text not null,
  corridor text not null,
  payout_method text not null,
  destination_masked text,
  send_amount_minor bigint not null,
  send_currency text not null,
  receive_amount_minor bigint not null,
  receive_currency text not null,
  quoted_rate numeric(18, 6),
  status text not null default 'awaiting_provider',
  provider text,
  provider_reference text,
  failure_reason text,
  funded_at timestamptz,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (transfer_id)
);

create index if not exists payouts_status_created_idx
  on public.payouts (status, created_at desc);

create index if not exists payouts_user_created_idx
  on public.payouts (user_id, created_at desc);

alter table public.payouts enable row level security;
