# Running NexaRemit

Every control in this codebase is enforced server-side and needs Supabase.
Without it the payment route refuses outright rather than degrading quietly —
that is deliberate, but it does mean nothing works until step 1 is done.

Once configured, `npm run verify https://your-deployment` will tell you which
controls are actually live rather than intended.

---

## 1. Supabase

Create a project at supabase.com, then:

**Apply the schema.** In the SQL editor, paste and run `supabase/schema.sql`.
It creates `transfer_records`, `recipients`, `kyc_records`,
`sanctions_screenings`, `risk_assessments` and `transfer_audit_logs`.

If you applied an earlier version of this schema, drop the stale constraint on
the audit table first — audit rows are written before a transfer record exists,
so the old foreign key rejects them:

```sql
alter table public.transfer_audit_logs
  drop constraint if exists transfer_audit_logs_transfer_id_fkey;
```

**Collect three values** from Project Settings → API:

| Value | Goes in | Notes |
|---|---|---|
| Project URL | `SUPABASE_URL` and `VITE_SUPABASE_URL` | same value, both places |
| `anon` public key | `VITE_SUPABASE_ANON_KEY` | safe in the browser |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` | **never** give this a `VITE_` prefix |

The `VITE_` prefix means "ship this to the browser". Putting the service role
key behind one would hand every visitor full database access.

**Allow the sign-in redirect.** Under Authentication → URL Configuration, add
your deployment origin plus `/SignIn` to the redirect allowlist. Magic links
fail silently without this.

---

## 2. Environment variables

Set these in Vercel (Project Settings → Environment Variables). `.env.example`
lists everything with notes.

**Required for anything to work**

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Required by the payment route**

```
STRIPE_SECRET_KEY=            # sk_test_... until you are licensed
VITE_STRIPE_PUBLISHABLE_KEY=  # pk_test_... to match
STRIPE_WEBHOOK_SECRET=
```

**Identity verification**

```
PERSONA_API_KEY=
PERSONA_TEMPLATE_ID=
PERSONA_WEBHOOK_SECRET=
NEXA_REQUIRE_KYC=true
```

`NEXA_REQUIRE_KYC=false` disables the identity gate. It is an explicit opt-out
so that the secure behaviour is what you get if nobody configures anything.

**Pre-transfer controls**

```
NEXA_ALLOW_UNSCREENED=false   # see the warning below
NEXA_DAILY_LIMIT=2500
NEXA_MONTHLY_LIMIT=10000
NEXA_DAILY_COUNT_LIMIT=10
```

**Optional**

```
VITE_ENABLE_PHONE_AUTH=false  # needs an SMS provider configured in Supabase
NEXA_MAX_SEND_CENTS=
```

---

## 3. The one flag that blocks everything

Sanctions screening **fails closed**. There is no screening provider wired up,
so every transfer is refused until you set:

```
NEXA_ALLOW_UNSCREENED=true
```

This exists for pre-launch testing only. When it is on, each transfer records a
warning in the audit trail saying the screen never ran — it is never recorded
as a clear screen. Turn it off before real money moves, and treat wiring an
actual screening provider as a launch blocker rather than a nice-to-have.

---

## 4. Verify

```bash
npm run verify https://your-deployment
```

Seven checks: that health describes its own configuration, that no API route
falls through to the SPA or crashes on load, that the payment path and
recipients refuse unauthenticated callers, that no fabricated demo data ships
in the bundle, and which Stripe key mode is live.

It sends no authenticated requests and creates nothing. For most checks a
refusal is the passing result.

Run it after every deployment. Two of these — the SPA fallback and the
crash-on-load check — cover failures that were live in production for weeks
without anyone noticing, because both look fine from the browser.

---

## 5. Local checks

```bash
npm run check:imports   # every route loads with an empty environment
npm run check:cjs       # nothing ESM-only in the require graph
npm run build
```

`check:imports` catches routes that would return an unreadable 500 in
production. `check:cjs` catches the dependency drift that took the settlement
routes down: Vercel's loader cannot `require()` an ES module, while local Node
can, so a package can import cleanly here and still fail once deployed.

---

## Account closure

`DELETE /api/account` closes an account: it deletes saved recipients, removes
the email from the funding list, and deletes the Supabase auth user. It refuses
while any payout is still `awaiting_provider` or `pending`.

It deliberately does **not** delete transfer records, payout records, the KYC
result, or the audit trail. 31 CFR 1010.410 requires an MSB to retain records
of the money it moved for five years, and those rows key off `user_id` as plain
text with no foreign key into `auth.users`, so they survive the deletion
intact. The page at `/Account` states this to the customer before they confirm.

A closure writes `account.closed` to `transfer_audit_logs` **before** anything
is deleted. If that write fails the request is refused and nothing is removed.

---

## What is still missing

- **Payout.** No provider is connected, so no transfer completes end to end.
- **Sanctions screening.** No provider. See section 3.
- **Risk scoring.** Not configured; recorded as a warning rather than a pass.
- **Licensing.** Required before any of this may legally move money.
