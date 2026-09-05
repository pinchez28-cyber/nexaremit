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

-- ============================================================
-- Batch 2 (sandbox-only, owner-approved): server-owned lifecycle
--   quote -> transfer -> Stripe TEST funding -> webhook reconcile
--   -> funded -> payout obligation (awaiting_provider, PENDING).
--
-- ADDITIVE ONLY: one new table + ADD COLUMNs + indexes. No FKs added
-- anywhere (consistent with the no-FK design); no existing column is
-- altered or dropped; `payouts` is unchanged. Migration is written but NOT
-- applied anywhere live — it targets the sandbox Supabase dev database.
-- ============================================================

-- Immutable server snapshot of a priced quote. Once issued, amount/fee/rate
-- columns never change; only status + consumed_at mutate (issued -> consumed
-- | expired | cancelled). Single-use + expiry are enforced server-side at the
-- point of consumption with a conditional UPDATE (see quoteService.js).
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  status text not null default 'issued',
  recipient_id uuid,
  send_currency text not null,
  send_amount_major numeric(18, 2) not null default 0,
  send_amount_minor bigint not null default 0,
  receive_currency text not null,
  receive_amount_major numeric(18, 2) not null default 0,
  receive_amount_minor bigint not null default 0,
  fx_rate numeric(18, 6),
  platform_fixed_minor bigint not null default 0,
  platform_percent_minor bigint not null default 0,
  fx_markup_minor bigint not null default 0,
  payout_fixed_minor bigint not null default 0,
  payout_percent_minor bigint not null default 0,
  compliance_buffer_minor bigint not null default 0,
  stripe_fee_minor bigint not null default 0,
  total_charge_minor bigint not null default 0,
  expires_at timestamptz not null default now() + interval '15 minutes',
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  idempotency_key text
);

create unique index if not exists quotes_idempotency_key_uidx
  on public.quotes (idempotency_key) where idempotency_key is not null;

create index if not exists quotes_user_created_idx
  on public.quotes (user_id, created_at desc);

create index if not exists quotes_status_expires_idx
  on public.quotes (status, expires_at);

alter table public.quotes enable row level security;
-- RLS enabled with no policies (deny-by-default, like every other table):
-- the browser can never read/write quotes directly; all access flows through
-- the serverless API routes with SUPABASE_SERVICE_ROLE_KEY.

-- Transfer lifecycle anchors. Existing major-unit display columns are kept;
-- the new minor-unit bigint columns are canonical on the money path.
alter table public.transfer_records
  add column if not exists quote_id uuid;
alter table public.transfer_records
  add column if not exists expected_charge_minor bigint;
alter table public.transfer_records
  add column if not exists payment_intent_amount_minor bigint;
alter table public.transfer_records
  add column if not exists idempotency_key text;
alter table public.transfer_records
  add column if not exists funded_at timestamptz;
alter table public.transfer_records
  add column if not exists last_webhook_event_id text;

-- Duplicate-funding guard: one PaymentIntent funds at most one transfer.
create unique index if not exists transfer_records_payment_intent_uidx
  on public.transfer_records (payment_intent_id)
  where payment_intent_id is not null;

-- Duplicate-submit replay: same idempotency key returns the same transfer.
create unique index if not exists transfer_records_idempotency_key_uidx
  on public.transfer_records (idempotency_key)
  where idempotency_key is not null;

create index if not exists transfer_records_quote_idx
  on public.transfer_records (quote_id) where quote_id is not null;

-- Server-owned transfer status values (Batch 2 state machine):
--   pending_funding -> funded -> payout_pending (obligation awaiting_provider;
--     terminal in Batch 2: "Funding received — payout pending", never success)
--   pending_funding -> cancelled (user, only while pending_funding)
--   pending_funding -> expired (quote expired before funding)
--   pending_funding -> reconciliation_failed (webhook amount/currency
--     mismatch; NO obligation created)
-- Reserved (not reachable until a payout provider exists): payout_submitted,
-- paid, payout_failed, refunded.
