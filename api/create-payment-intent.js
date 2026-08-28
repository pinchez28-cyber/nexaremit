import Stripe from "stripe";
import { verifyKycInquiry } from "../src/server/_lib/kycGate.js";
import { requireAuthenticatedUser } from "../src/server/_lib/requireUser.js";
import { runTransferSafetyChecks } from "../src/server/_lib/safetyEngine.js";
import { recordAuditEvent } from "../src/server/_lib/audit.js";
import { getRecipientForUser } from "../src/server/_lib/recipientRecords.js";
import { getVelocityUsage, getVelocityLimits } from "../src/server/_lib/velocity.js";
import { minorToMajor } from "../src/lib/money.js";
import {
  payoutMethodLabels,
  deliveryEstimates,
} from "../src/lib/payout-destinations.js";

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
  // directly, so this field is NOT required for a funding charge.
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

  // ---- Authentication -------------------------------------------------
  // Establishes a durable customer id before anything else. Every control
  // below is meaningless without one: limits, KYC linkage and the audit trail
  // all hang off this. Verified against Supabase, never read from the body.
  let user;
  try {
    user = await requireAuthenticatedUser(req);
  } catch (authError) {
    return sendJson(res, authError.statusCode || 401, {
      ok: false,
      route: "create-payment-intent",
      stage: "authentication",
      error: authError.details?.reason || "authentication_required",
      message: authError.message,
    });
  }

  // ---- Identity gate -------------------------------------------------
  // Runs BEFORE any PaymentIntent is created, so an unverified sender can
  // never reach the card form with a live client secret. The browser only
  // supplies an inquiry ID; approval itself is confirmed server-side against
  // Persona (or the webhook-written kyc_records table).
  // The user id is passed so the gate can confirm the approved inquiry was
  // created for this account. The browser supplies the inquiry id, so without
  // that check one leaked id would let someone else's verified identity
  // authorise a transfer.
  const kyc = await verifyKycInquiry(
    body.kycInquiryId || body.inquiryId || body.kyc?.inquiryId,
    user.id
  );

  if (!kyc.ok) {
    return sendJson(res, 403, {
      ok: false,
      route: "create-payment-intent",
      stage: "kyc-gate",
      error: kyc.code || "kyc_required",
      message: kyc.message || "Identity verification is required.",
      kycStatus: kyc.status || null,
    });
  }

  // ---- Pre-transfer controls -----------------------------------------
  // safetyEngine enforces corridor, recipient limit, quote expiry and the
  // authentication/KYC/sanctions gates. It runs here, before any PaymentIntent
  // exists, so a failure means no client secret is ever issued.
  //
  // Screening and risk scoring have no provider on this deployment and say so
  // rather than reporting a pass. Sanctions therefore blocks unless
  // NEXA_ALLOW_UNSCREENED is explicitly set for pre-launch testing.
  const allowUnscreened =
    String(process.env.NEXA_ALLOW_UNSCREENED || "").trim().toLowerCase() === "true";

  // safetyEngine compares against recipient limits expressed in major units,
  // while this route works in minor units throughout. The conversion is
  // currency-aware: JPY has no minor unit, so dividing by 100 would understate
  // a yen transfer a hundredfold and let it past every limit.
  const amountMajor = minorToMajor(amount, currency);

  // The recipient is re-read from the database rather than taken from the
  // request. safetyEngine decides on corridor and per-recipient limit, so a
  // body-supplied recipient would let a caller raise their own limit or claim
  // a corridor they never registered.
  const recipientId = String(body.recipientId || body.recipient?.id || "").trim();

  if (!recipientId) {
    return sendJson(res, 400, {
      ok: false,
      route: "create-payment-intent",
      stage: "validate-input",
      error: "recipient_required",
      message: "Choose a saved recipient before authorizing payment.",
    });
  }

  const recipient = await getRecipientForUser(user, recipientId, {
    payoutMethodLabels,
    deliveryEstimates,
  });

  if (!recipient) {
    return sendJson(res, 404, {
      ok: false,
      route: "create-payment-intent",
      stage: "validate-input",
      error: "recipient_not_found",
      message: "That recipient could not be found on your account.",
    });
  }

  // What this customer has already committed in the trailing 24 hours and 30
  // days, read from the audit trail rather than from anything the browser
  // sends.
  const velocityLimits = getVelocityLimits();
  const velocity = await getVelocityUsage(user, { currency });

  const safety = runTransferSafetyChecks({
    user,
    amount: amountMajor,
    currency,
    recipient,
    velocity,
    velocityLimits,
    quote: body.quote,
    kyc: { status: "approved", source: kyc.source || "" },
    sanctions: { status: "not_configured" },
    risk: { status: "not_configured" },
    allowUnscreened,
  });

  const safetyAudit = await recordAuditEvent({
    action: "transfer.safety_check",
    status: safety.passed ? "passed" : "failed",
    user,
    transferId,
    metadata: {
      referenceId,
      amountMinor: amount,
      currency,
      corridor: recipient.corridor,
      recipientId: recipient.id,
      failures: safety.failures,
      warnings: safety.warnings,
      kycSource: kyc.source || null,
      allowUnscreened,
      velocity: {
        dailyAmount: velocity.dailyAmount,
        monthlyAmount: velocity.monthlyAmount,
        dailyCount: velocity.dailyCount,
        available: velocity.available,
        limits: velocityLimits,
      },
    },
  });

  // If the decision cannot be recorded, the charge does not happen. An AML
  // record is a retention obligation, so an unrecorded transfer is worse than
  // a refused one.
  if (!safetyAudit.persisted) {
    return sendJson(res, 503, {
      ok: false,
      route: "create-payment-intent",
      stage: "audit",
      error: "audit_unavailable",
      message:
        "This transfer cannot proceed because it could not be recorded for compliance.",
    });
  }

  if (!safety.passed) {
    return sendJson(res, 403, {
      ok: false,
      route: "create-payment-intent",
      stage: "safety-checks",
      error: "safety_checks_failed",
      message: "This transfer did not pass our pre-transfer checks.",
      failures: safety.failures,
      warnings: safety.warnings,
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
    // Audit trail: which verified identity check authorised this charge.
    userId: String(user.id),
    kycInquiryId: String(body.kycInquiryId || body.inquiryId || ""),
    kycVerifiedBy: String(kyc.source || ""),
    kycStatus: String(kyc.status || (kyc.skipped ? "not_required" : "")),
    // Carried so the webhook can record what is owed to whom the moment
    // funding confirms. Previously a funded transfer produced nothing
    // downstream, so there was no record of the obligation and no queue for a
    // payout partner to work through.
    recipientId: String(recipient.id),
    recipientName: String(recipient.name).slice(0, 200),
    corridor: String(recipient.corridor),
    payoutMethod: String(recipient.payoutMethod),
    destinationMasked: String(recipient.accountMasked || ""),
    receiveCurrency: String(recipient.receiveCurrency),
    sendAmountMinor: String(amount),
    receiveAmountMinor: String(recipientAmountMinor),
    quotedRate: String(body.quote?.rate ?? ""),
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

  // Apple Pay and Google Pay are CARD WALLETS: Stripe's Payment Element
  // surfaces them automatically whenever "card" is an allowed payment method
  // and the shopper's device supports them (Apple Pay additionally requires
  // domain verification in the Stripe dashboard). They do NOT require
  // automatic_payment_methods.
  //
  // automatic_payment_methods defers the choice to the dashboard
  // configuration, which fails with "No valid payment method types for this
  // Payment Intent" when nothing enabled there is compatible with the
  // currency once allow_redirects:"never" filters out redirect-based methods.
  // An explicit list is therefore the dependable default.
  //
  // To add Link or any other method you have activated in the dashboard:
  //   NEXA_PAYMENT_METHOD_TYPES=card,link
  // To hand control back to the dashboard entirely:
  //   NEXA_PAYMENT_METHOD_MODE=automatic
  const paymentMethodMode = String(
    process.env.NEXA_PAYMENT_METHOD_MODE || "explicit"
  )
    .trim()
    .toLowerCase();

  const configuredTypes = String(process.env.NEXA_PAYMENT_METHOD_TYPES || "card")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const paymentMethodTypes = configuredTypes.length ? configuredTypes : ["card"];

  // NOTE: confirmation_method must NOT be sent alongside
  // automatic_payment_methods — Stripe rejects that combination with
  // "You may only specify one of these parameters". "automatic" is Stripe's
  // default anyway, so it is omitted entirely.
  const createParams = {
    amount: quote.totalChargeCents,
    currency,
    capture_method: "automatic",
    description: `NexaRemit transfer ${referenceId}`,
    metadata,
    ...(paymentMethodMode === "automatic"
      ? {
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
          },
        }
      : { payment_method_types: paymentMethodTypes }),
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create(createParams, {
      idempotencyKey: `pi-${referenceId}`,
    });

    // Best-effort here, unlike the pre-charge record. The intent already
    // exists at this point, so refusing the response would leave the customer
    // worse off than a logged failure does.
    await recordAuditEvent({
      action: "payment_intent.created",
      status: paymentIntent.status || "created",
      user,
      transferId,
      metadata: {
        referenceId,
        paymentIntentId: paymentIntent.id,
        amountMinor: paymentIntent.amount,
        currency: paymentIntent.currency,
        livemode: paymentIntent.livemode,
        safetyWarnings: safety.warnings,
      },
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
