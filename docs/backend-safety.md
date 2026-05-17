# NexaRemit Backend Safety Plan

NexaRemit now includes a Vercel serverless backend foundation in `api/`.

This backend is sandbox-only. It does not move real money.

## API Routes

- `GET /api/health` - service health check
- `GET /api/kyc` - sandbox KYC status
- `GET /api/recipients` - sandbox recipient list
- `POST /api/quotes` - create provider-ready transfer quote
- `POST /api/transfers` - create sandbox transfer after safety checks
- `POST /api/create-payment-intent` - create Stripe test PaymentIntent after safety checks
- `POST /api/webhooks-stripe` - Stripe webhook placeholder

## Safety Checks Before Transfer Creation

The backend blocks a transfer when:

- user is not authenticated
- sender KYC is not approved
- recipient is missing
- corridor is not enabled
- transfer amount is not positive
- transfer exceeds recipient limit
- quote is expired

The backend warns when:

- transfer is large enough for enhanced due diligence
- recipient requires manual compliance review

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

## Security Rules

- Do not collect raw card numbers in NexaRemit.
- Use hosted card/bank collection such as Stripe Payment Element, Adyen Drop-in, Plaid Link, or Stripe Financial Connections.
- Keep all API secrets server-side only.
- Do not use `VITE_*` for provider secrets.
- `VITE_STRIPE_PUBLISHABLE_KEY` is safe for the browser, but `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` must stay server-side.
- Verify webhook signatures before processing provider events.
- Store transfer state, audit logs, and provider references in a database before production.
- Get legal/licensing review before enabling real transactions.
