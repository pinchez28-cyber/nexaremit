import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

function toStr(v) {
  return typeof v === "string" ? v.trim() : "";
}

function toInt(v) {
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

function envInt(name, fallbackValue) {
  const raw = process.env[name];
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallbackValue;
}

function safeCurrency(value, fallback = "usd") {
  const c = toStr(value).toLowerCase();
  return /^[a-z]{3}$/.test(c) ? c : fallback;
}

function isLikelyTestKey(value) {
  return /^sk_test_/i.test(toStr(value));
}

function isLikelyLiveKey(value) {
  return /^sk_live_/i.test(toStr(value));
}

function normalizeMetadata(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = toStr(k).slice(0, 40);
    if (!key) continue;
    out[key] = toStr(v).slice(0, 500);
  }
  return out;
}

function roundUpCents(n) {
  return Math.ceil(Number(n));
}

function calculateQuote(sendAmountCents) {
  const platformFlatCents = envInt("FEE_PLATFORM_FLAT_CENTS", 99);
  const platformPercentBps = envInt("FEE_PLATFORM_PERCENT_BPS", 0);

  const fxMarkupBps = envInt("FEE_FX_MARKUP_BPS", 30);

  const payoutFixedCents = envInt("FEE_PAYOUT_FIXED_CENTS", 0);
  const payoutPercentBps = envInt("FEE_PAYOUT_PERCENT_BPS", 0);

  const complianceBufferCents = envInt("FEE_COMPLIANCE_BUFFER_CENTS", 0);

  const stripePercentBps = envInt("STRIPE_PERCENT_BPS", 290);
  const stripeFixedCents = envInt("STRIPE_FIXED_CENTS", 30);

  const platformPercentFeeCents = roundUpCents(
    (sendAmountCents * platformPercentBps) / 10000
  );

  const platformFeeCents = platformFlatCents + platformPercentFeeCents;

  const fxMarkupCents = roundUpCents(
    (sendAmountCents * fxMarkupBps) / 10000
  );

  const payoutPercentFeeCents = roundUpCents(
    (sendAmountCents * payoutPercentBps) / 10000
  );

  const payoutCostCents = payoutFixedCents + payoutPercentFeeCents;

  const baseCostCents =
    sendAmountCents +
    platformFeeCents +
    fxMarkupCents +
    payoutCostCents +
    complianceBufferCents;

  const stripeRate = stripePercentBps / 10000;

  const totalChargeCents = roundUpCents(
    (baseCostCents + stripeFixedCents) / (1 - stripeRate)
  );

  const stripeFeeEstimateCents = totalChargeCents - baseCostCents;

  return {
    sendAmountCents,
    platformFeeCents,
    fxMarkupCents,
    payoutCostCents,
    complianceBufferCents,
    stripeFeeEstimateCents,
    totalChargeCents,

    config: {
      platformFlatCents,
      platformPercentBps,
      fxMarkupBps,
      payoutFixedCents,
      payoutPercentBps,
      complianceBufferCents,
      stripePercentBps,
      stripeFixedCents,
    },
  };
}

export default async function handler(req, res) {
  const send = (status, body) => {
    res.setHeader("Cache-Control", "no-store");
    return res.status(status).json(body);
  };

  try {
    if (req.method !== "POST") {
      return send(405, {
        ok: false,
        route: "create-payment-intent",
        stage: "method-not-allowed",
        error: "Method not allowed. Use POST.",
      });
    }

    const TRANSFER_MODE = toStr(process.env.TRANSFER_MODE);
    const STRIPE_SECRET_KEY = toStr(process.env.STRIPE_SECRET_KEY);
    const STRIPE_ACCOUNT_ID = toStr(process.env.STRIPE_ACCOUNT_ID);
    const DEFAULT_CURRENCY = safeCurrency(process.env.STRIPE_CURRENCY || "usd");

    if (TRANSFER_MODE && TRANSFER_MODE !== "production") {
      return send(500, {
        ok: false,
        route: "create-payment-intent",
        stage: "env-validation",
        error: "TRANSFER_MODE must be 'production' for this endpoint.",
        value: TRANSFER_MODE,
      });
    }

    if (!STRIPE_SECRET_KEY) {
      return send(500, {
        ok: false,
        route: "create-payment-intent",
        stage: "env-validation",
        error: "Missing STRIPE_SECRET_KEY.",
      });
    }

    if (isLikelyTestKey(STRIPE_SECRET_KEY)) {
      return send(500, {
        ok: false,
        route: "create-payment-intent",
        stage: "env-validation",
        error: "Unsafe value in environment variable: STRIPE_SECRET_KEY is a test key.",
      });
    }

    if (!isLikelyLiveKey(STRIPE_SECRET_KEY)) {
      return send(500, {
        ok: false,
        route: "create-payment-intent",
        stage: "env-validation",
        error: "STRIPE_SECRET_KEY does not appear to be a live secret key.",
      });
    }

    let body = {};
    try {
      body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};
    } catch (err) {
      return send(400, {
        ok: false,
        route: "create-payment-intent",
        stage: "body-parse",
        error: "Invalid JSON request body.",
        details: toStr(err?.message),
      });
    }

    const sendAmountCents = toInt(
      body.sendAmountCents ?? body.transferAmountCents ?? body.amount
    );

    const currency = safeCurrency(body.currency, DEFAULT_CURRENCY);
    const customerId = toStr(body.customerId);
    const receiptEmail = toStr(body.receiptEmail || body.email);
    const description = toStr(body.description) || "NexaRemit transfer funding";
    const referenceId =
      toStr(body.referenceId) ||
      `nexaremit-pi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (!Number.isInteger(sendAmountCents) || sendAmountCents <= 0) {
      return send(400, {
        ok: false,
        route: "create-payment-intent",
        stage: "input-validation",
        error:
          "amount/sendAmountCents must be a positive integer in the smallest currency unit.",
      });
    }

    if (currency === "usd" && sendAmountCents < 50) {
      return send(400, {
        ok: false,
        route: "create-payment-intent",
        stage: "input-validation",
        error: "Transfer amount must be at least 50 cents for usd.",
      });
    }

    const quote = calculateQuote(sendAmountCents);

    const metadata = normalizeMetadata({
      referenceId,
      transferId: body.transferId,
      senderId: body.senderId,
      recipientId: body.recipientId,
      corridor: body.corridor,
      payoutCountry: body.payoutCountry,

      sendAmountCents: quote.sendAmountCents,
      platformFeeCents: quote.platformFeeCents,
      fxMarkupCents: quote.fxMarkupCents,
      payoutCostCents: quote.payoutCostCents,
      complianceBufferCents: quote.complianceBufferCents,
      stripeFeeEstimateCents: quote.stripeFeeEstimateCents,
      totalChargeCents: quote.totalChargeCents,

      source: "nexaremit-sendmoney",
      ...(body.metadata || {}),
    });

    const createParams = {
      amount: quote.totalChargeCents,
      currency,
      payment_method_types: ["card"],
      confirmation_method: "automatic",
      capture_method: "automatic",
      description,
      metadata,
    };

    if (customerId) {
      createParams.customer = customerId;
    }

    if (receiptEmail) {
      createParams.receipt_email = receiptEmail;
    }

    const requestOptions = STRIPE_ACCOUNT_ID
      ? { stripeAccount: STRIPE_ACCOUNT_ID }
      : undefined;

    const intent = await stripe.paymentIntents.create(
      createParams,
      requestOptions
    );

    return send(200, {
      ok: true,
      route: "create-payment-intent",
      stage: "payment-intent-created",
      provider: "stripe",
      mode: "production",
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      paymentMethodTypes: intent.payment_method_types || ["card"],
      livemode: Boolean(intent.livemode),
      referenceId,

      quote: {
        sendAmountCents: quote.sendAmountCents,
        platformFeeCents: quote.platformFeeCents,
        fxMarkupCents: quote.fxMarkupCents,
        payoutCostCents: quote.payoutCostCents,
        complianceBufferCents: quote.complianceBufferCents,
        stripeFeeEstimateCents: quote.stripeFeeEstimateCents,
        totalChargeCents: quote.totalChargeCents,
        recipientGetsCents: Number.isInteger(body.recipientGetsCents)
          ? body.recipientGetsCents
          : null,
      },
    });
  } catch (err) {
    const type = toStr(err?.type);
    const code = toStr(err?.code);
    const message = toStr(err?.message) || "Unexpected Stripe error.";

    return send(500, {
      ok: false,
      route: "create-payment-intent",
      stage: "top-level-catch",
      error: message,
      stripeType: type || "",
      stripeCode: code || "",
    });
  }
}
