# NexaRemit Backend Safety Plan

NexaRemit now includes a Vercel serverless backend foundation in `api/`.

This backend is sandbox-only. It does not move real money.

## API Routes

- `GET /api/health` - service health check
- `GET /api/kyc` - sandbox KYC status
- `POST /api/kyc-start` - create or prepare a Persona-compatible KYC inquiry
- `POST /api/sanctions-screening` - create or reuse a sender/recipient sanctions screening result
- `POST /api/risk-check` - create a rule-based fraud and velocity risk assessment
- `GET /api/recipients` - sandbox recipient list
- `POST /api/quotes` - create provider-ready transfer quote
- `POST /api/transfers` - create sandbox transfer after safety checks
- `POST /api/create-payment-intent` - create Stripe test PaymentIntent after safety checks
- `GET /api/transfer-records` - list saved sandbox transfer records
- `GET /api/transfer-records?id=NX-...` - load one saved sandbox receipt
- `POST /api/transfer-records` - save a sandbox transfer record
- `POST /api/webhooks-stripe` - Stripe webhook placeholder
- `POST /api/webhooks-persona` - Persona webhook receiver for KYC status updates

## Safety Checks Before Transfer Creation

The backend blocks a transfer when:

- user is not authenticated
- sender KYC is not approved
- sanctions screening is not clear
- fraud risk check blocks the transfer
- recipient is missing
- corridor is not enabled
- transfer amount is not positive
- transfer exceeds recipient limit
- quote is expired

The backend warns when:

- transfer is large enough for enhanced due diligence
- recipient requires manual compliance review

## KYC Provider Readiness

NexaRemit has a sandbox KYC status slot at `GET /api/kyc` and a Persona-compatible start endpoint at `POST /api/kyc-start`. The next production step is to add provider credentials and store inquiry results in the database.

For Persona, add these Vercel environment variables only on the server side:

- `KYC_PROVIDER=persona`
- `PERSONA_API_KEY`
- `PERSONA_TEMPLATE_ID`
- `PERSONA_ENVIRONMENT=sandbox`
- `PERSONA_WEBHOOK_SECRET`

Before live transfers, the backend must create or resume a KYC inquiry, store the provider inquiry ID on the user record, verify Persona webhook signatures, update the user's KYC status from webhook events, and block all real transfer creation until the status is approved.

Do not trust browser-only KYC status. The transfer API must always read KYC status from the server/database.

Current behavior:

- Without Persona credentials, `POST /api/kyc-start` returns a sandbox reference and no live verification link.
- With Persona credentials, `POST /api/kyc-start` creates a Persona inquiry and returns the inquiry ID plus the provider verification link/token when Persona provides it.
- `POST /api/webhooks-persona` verifies the `Persona-Signature` header, reads the inquiry reference ID, and upserts the server-side KYC status.
- Live transfer creation must remain blocked until webhook-confirmed KYC status is stored server-side.

## Provider Slots

Real integrations should replace the sandbox provider registry in:

`api/_lib/providerRegistry.js`

Provider categories:

- KYC identity verification
- sanctions and AML screening
- sender funding by card or bank account
- FX/exchange rate locking
- settlement rail such as bank, stablecoin, Ripple Payments, or XRPL
- payout to bank, mobile money, wallet, or cash pickup

## Sanctions and AML Screening

`POST /api/sanctions-screening` creates a stable screening ID from the sender, receiver, country, corridor, and payout method. When Supabase is configured, results are stored in `sanctions_screenings` and reused by the transfer safety engine.

Current behavior:

- Sandbox recipients with `risk: \"Review required\"` create a `manual_review` screening.
- Other sandbox recipients create a `clear` screening.
- Transfer creation is blocked unless the screening status is `clear`.
- A production AML provider should replace the sandbox result with real watchlist, sanctions, PEP, adverse media, and corridor-risk checks.

## Fraud and Risk Checks

`POST /api/risk-check` and transfer creation both run a rule-based risk assessment. The assessment is stored in `risk_assessments` when Supabase is configured.

Current rules score:

- missing user identity
- KYC not approved
- sanctions screening not clear
- large transfer amounts
- higher-risk corridors
- repeated transfers in the last 24 hours
- daily transfer volume above standard limits

Risk status can be `clear`, `manual_review`, or `blocked`. Blocked transfers cannot be created. Manual-review transfers produce warnings and should not be released to payout until an admin review system exists.

## Security Rules

- Do not collect raw card numbers in NexaRemit.
- Use hosted card/bank collection such as Stripe Payment Element, Adyen Drop-in, Plaid Link, or Stripe Financial Connections.
- Keep all API secrets server-side only.
- Do not use `VITE_*` for provider secrets.
- `VITE_STRIPE_PUBLISHABLE_KEY` is safe for the browser, but `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` must stay server-side.
- Verify webhook signatures before processing provider events.
- Store transfer state, audit logs, and provider references in a database before production.
- Get legal/licensing review before enabling real transactions.

## Supabase Transfer Records

Use `supabase/schema.sql` in the Supabase SQL editor to create the transfer record tables. Then add these server-only Vercel environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The React app never receives the service role key. Browser screens call `/api/transfer-records`, and that serverless route writes records with the server-only Supabase client. If Supabase is not configured yet, NexaRemit keeps using local sandbox records so the demo remains usable.

The same schema also creates `kyc_records`. When Supabase is configured, transfer creation reads KYC status from this table. If a sender has no approved KYC record, transfer creation is blocked.
