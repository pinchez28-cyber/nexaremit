import Stripe from "stripe";

// Stripe is created lazily inside the handler so a missing/invalid key returns
// a clean JSON error instead of crashing the function at module load
// (which surfaces on Vercel as an opaque FUNCTION_INVOCATION_FAILED).
let stripeSingleton = null;
function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) return null;
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(stripeSecretKey);
  }
  return stripeSingleton;
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function getEnvInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function normalizeCurrency(value, fallback = "usd") {
  const v = String(value || fallback).trim().toLowerCase();
  return v || fallback;
}

async function getJsonBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      throw new Error("Invalid JSON request body");
    }
  }

  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString("utf8"));
    } catch {
      throw new Error("Invalid JSON request body");
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) return {};

  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON request body");
  }
}

function buildQuote(sendAmountCents) {
  const platformFixedFeeCents = getEnvInt("NEXA_PLATFORM_FIXED_FEE_CENTS", 99);
  const platformPercentBps = getEnvInt("NEXA_PLATFORM_PERCENT_BPS", 0);

  const fxMarkupBps = getEnvInt("NEXA_FX_MARKUP_BPS", 40);
  const payoutFixedFeeCents = getEnvInt("NEXA_PAYOUT_FIXED_FEE_CENTS", 0);
  const payoutPercentBps = getEnvInt("NEXA_PAYOUT_PERCENT_BPS", 0);

  const complianceBufferCents = getEnvInt("NEXA_COMPLIANCE_BUFFER_CENTS", 0);

  const stripePercentBps = getEnvInt("STRIPE_FEE_PERCENT_BPS", 290);
  const stripeFixedFeeCents = getEnvInt("STRIPE_FEE_FIXED_CENTS", 30);

  const platformPercentFeeCents = Math.ceil(sendAmountCents * (platformPercentBps / 10000));
  const fxMarkupCents = Math.ceil(sendAmountCents * (fxMarkupBps / 10000));
  const payoutPercentFeeCents = Math.ceil(sendAmountCents * (payoutPercentBps / 10000));

  const baseCostCents =
    sendAmountCents +
    platformFixedFeeCents +
    platformPercentFeeCents +
    fxMarkupCents +
    payoutFixedFeeCents +
    payoutPercentFeeCents +
    complianceBufferCents;

  const stripeRate = stripePercentBps / 10000;
  const totalChargeCents = Math.ceil((baseCostCents + stripeFixedFeeCents) / (1 - stripeRate));
  const stripeFeeEstimateCents = totalChargeCents - baseCostCents;

  return {
    sendAmountCents,
    platformFeeCents: platformFixedFeeCents + platformPercentFeeCents,
    fxMarkupCents,
    payoutCostCents: payoutFixedFeeCents + payoutPercentFeeCents,
    complianceBufferCents,
    stripeFeeEstimateCents,
    totalChargeCents,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, {
      ok: false,
      route: "create-payment-intent",
      error: "Method not allowed. Use POST.",
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return sendJson(res, 500, {
      ok: false,
      route: "create-payment-intent",
      stage: "config",
      error: "Server is missing STRIPE_SECRET_KEY",
    });
  }

  let body;
  try {
    body = await getJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, {
      ok: false,
      route: "create-payment-intent",
      stage: "body-parse",
      error: err.message || "Invalid JSON request body",
    });
  }

  // Amount is expected in minor units (cents). Coerce to a whole integer so
  // Stripe never receives a fractional amount.
  const amount = Math.round(Number(body.amount));
  const currency = normalizeCurrency(body.currency, "usd");

  const referenceId =
    String(body.referenceId || "").trim() ||
    `nexa-${Date.now()}`;

  const transferId =
    String(body.transferId || "").trim() ||
    referenceId;

  // Optional: only relevant when the recipient is a Stripe Connect account and
  // this platform performs a separate Connect transfer (see stripe-webhook.js).
  // The primary NexaRemit flow funds the platform here and settles the payout
  // over XRPL, so this field is NOT required for a funding charge.
  const rawRecipientStripeAccountId = String(
    body.recipientStripeAccountId || body.recipient?.stripeAccountId || ""
  ).trim();

  const explicitRecipientAmountMinor =
    body.recipientAmountMinor ??
    body.recipientGetsCents ??
    body.quote?.recipientGetsCents;

  if (!Number.isFinite(amount) || amount <= 0) {
    return sendJson(res, 400, {
      ok: false,
      route: "create-payment-intent",
      stage: "validate-input",
      error: "Missing or invalid amount",
    });
  }

  // Optional AML/sanity ceiling. Only enforced when NEXA_MAX_SEND_CENTS is set,
  // so it can never block a legitimate transfer unless deliberately configured.
  const maxSendCents = getEnvInt("NEXA_MAX_SEND_CENTS", 0);
  if (maxSendCents > 0 && amount > maxSendCents) {
    return sendJson(res, 400, {
      ok: false,
      route: "create-payment-intent",
      stage: "validate-input",
      error: `Amount exceeds the configured maximum of ${maxSendCents} minor units`,
    });
  }

  if (!currency) {
    return sendJson(res, 400, {
      ok: false,
      route: "create-payment-intent",
      stage: "validate-input",
      error: "Missing or invalid currency",
    });
  }

  // If a recipient Stripe account IS provided, it must be well-formed.
  const hasRecipientConnectAccount = Boolean(rawRecipientStripeAccountId);
  if (
    hasRecipientConnectAccount &&
    !rawRecipientStripeAccountId.startsWith("acct_")
  ) {
    return sendJson(res, 400, {
      ok: false,
      route: "create-payment-intent",
      stage: "validate-input",
      error: "Invalid recipientStripeAccountId (must start with acct_)",
    });
  }

  const quote = buildQuote(amount);

  const recipientAmountMinor = Number(
    explicitRecipientAmountMinor ?? quote.sendAmountCents
  );

  if (!Number.isFinite(recipientAmountMinor) || recipientAmountMinor <= 0) {
    return sendJson(res, 400, {
      ok: false,
      route: "create-payment-intent",
      stage: "validate-input",
      error: "Missing or invalid recipientAmountMinor",
    });
  }

  const recipientCurrency = normalizeCurrency(
    body.recipientCurrency || body.quote?.recipientCurrency || currency,
    currency
  );

  const transferGroup = `remit_${transferId}`;

  const metadata = {
    referenceId: String(referenceId),
    transferId: String(transferId),
    transferGroup,
  };

  // Only attach Connect-transfer metadata when a recipient account is present.
  // Without it the webhook treats the charge as funding-only and does not
  // attempt a Stripe transfer.
  if (hasRecipientConnectAccount) {
    metadata.recipientStripeAccountId = String(rawRecipientStripeAccountId);
    metadata.recipientAmountMinor = String(recipientAmountMinor);
    metadata.recipientCurrency = String(recipientCurrency).toLowerCase();
  }

  if (body.senderId) metadata.senderId = String(body.senderId);
  if (body.recipientId) metadata.recipientId = String(body.recipientId);

  // Wallets (Apple Pay, Google Pay, Link) settle over the same card rails and
  // are surfaced automatically by Stripe's PaymentElement.
  //
  // allow_redirects:"never" is important: the client confirms with
  // redirect:"if_required" and no return_url, so redirect-based methods
  // (Klarna, iDEAL, ...) would fail. Excluding them keeps the flow card+wallet
  // only. This is very likely what broke the earlier attempt at enabling
  // automatic payment methods.
  //
  // Kill switch: set NEXA_ENABLE_WALLETS=false to fall back to card-only
  // without needing a code change or redeploy of the frontend.
  const walletsEnabled =
    String(process.env.NEXA_ENABLE_WALLETS || "true").trim().toLowerCase() !==
    "false";

  // NOTE: confirmation_method must NOT be sent alongside
  // automatic_payment_methods — Stripe rejects the combination with
  // "You may only specify one of these parameters". "automatic" is Stripe's
  // default confirmation_method anyway, so it is simply omitted here and the
  // behaviour is unchanged for both branches.
  const createParams = {
    amount: quote.totalChargeCents,
    currency,
    capture_method: "automatic",
    description: `NexaRemit transfer ${referenceId}`,
    metadata,
    ...(walletsEnabled
      ? {
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
          },
        }
      : { payment_method_types: ["card"] }),
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create(createParams, {
      idempotencyKey: `pi-${referenceId}`,
    });

    return sendJson(res, 200, {
      ok: true,
      route: "create-payment-intent",
      stage: "payment-intent-created",
      provider: "stripe",
      mode: paymentIntent.livemode ? "production" : "test",
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paymentMethodTypes: paymentIntent.payment_method_types,
      livemode: paymentIntent.livemode,
      referenceId,
      transferId,
      recipientStripeAccountId: hasRecipientConnectAccount
        ? rawRecipientStripeAccountId
        : null,
      fundingOnly: !hasRecipientConnectAccount,
      metadata: {
        referenceId,
        transferId,
        recipientStripeAccountId: hasRecipientConnectAccount
          ? rawRecipientStripeAccountId
          : null,
        recipientAmountMinor,
        recipientCurrency,
        transferGroup,
      },
      quote: {
        ...quote,
        recipientGetsCents: recipientAmountMinor,
      },
    });
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      route: "create-payment-intent",
      stage: "stripe-create",
      error: err?.type || "StripeError",
      message: err?.message || "Failed to create PaymentIntent",
    });
  }
}
