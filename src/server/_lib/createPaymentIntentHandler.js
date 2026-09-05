// src/server/_lib/createPaymentIntentHandler.js
//
// Server-side card-funding handler (sandbox only; never point live Stripe keys
// at this).
//
// Order of gates (owner-approved Batch 1):
//   1. AUTHENTICATION first — requireAuthenticatedUser() resolves the bearer
//      token BEFORE any KYC check, any quote/payment processing, and before
//      Stripe is even constructed. Unauthenticated callers get 401 and never
//      receive a client secret. (P0-1)
//   2. KYC verification — separate *second* security/compliance layer, after
//      authentication. (kept as-is)
//   3. Quote + PaymentIntent creation. (P1-3 math)
//
// Every dependency is injectable so tests can supply fakes (mock user, mock
// KYC, fake Stripe) without a live Supabase / Persona / Stripe client and
// without any network requests.

import { createHttpError } from "./http.js";
import { unitPerMajorFor, resolveSendAmountMinor } from "./moneyAmount.js";

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

// Raw node-writer error response (this repo's Vercel routes use
// res.statusCode/res.end, not Express res.status().json()).
function sendHttpError(res, err) {
  const statusCode =
    Number.isInteger(err?.statusCode) && err.statusCode >= 400
      ? err.statusCode
      : 500;
  const payload = {
    ok: false,
    error: err?.message || "Internal Server Error",
  };
  if (err?.details !== undefined) payload.details = err.details;
  sendJson(res, statusCode, payload);
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

/**
 * Deterministic all-in quote in minor units of the send currency (P1-3).
 *
 * Every fee constant is expressed in minor units of the currency being sent —
 * cents for USD/EUR/KES, yen for JPY (exponent 0), fils for BHD (exponent 3) —
 * so the quote is correct for every send currency without a single /100.
 */
export function buildQuote(sendAmountMinor, unitPerMajor = 100) {
  if (!Number.isFinite(Number(sendAmountMinor)) || Number(sendAmountMinor) <= 0) {
    return null;
  }
  const platformFixedMinor = getEnvInt("NEXA_PLATFORM_FIXED_FEE_CENTS", 99);
  const platformPercentBps = getEnvInt("NEXA_PLATFORM_PERCENT_BPS", 0);
  const fxMarkupBps = getEnvInt("NEXA_FX_MARKUP_BPS", 40);
  const payoutFixedMinor = getEnvInt("NEXA_PAYOUT_FIXED_FEE_CENTS", 0);
  const payoutPercentBps = getEnvInt("NEXA_PAYOUT_PERCENT_BPS", 0);
  const complianceBufferMinor = getEnvInt("NEXA_COMPLIANCE_BUFFER_CENTS", 0);
  const stripePercentBps = getEnvInt("STRIPE_FEE_PERCENT_BPS", 290);
  const stripeFixedMinor = getEnvInt("STRIPE_FEE_FIXED_CENTS", 30);

  const amountMinor = Math.round(Number(sendAmountMinor));
  const platformPercentMinor = Math.ceil(amountMinor * (platformPercentBps / 10000));
  const fxMarkupMinor = Math.ceil(amountMinor * (fxMarkupBps / 10000));
  const payoutPercentMinor = Math.ceil(amountMinor * (payoutPercentBps / 10000));

  const baseMinor =
    amountMinor +
    platformFixedMinor +
    platformPercentMinor +
    fxMarkupMinor +
    payoutFixedMinor +
    payoutPercentMinor +
    complianceBufferMinor;

  const stripeRate = stripePercentBps / 10000;
  const totalChargeMinor = Math.ceil(
    (baseMinor + stripeFixedMinor) / (1 - stripeRate)
  );
  const stripeFeeMinor = totalChargeMinor - baseMinor;

  return {
    sendAmountMinor: amountMinor,
    // Major-unit view (minor/exponent) for the client breakdown, kept exact
    // for the exponents that matter.
    sendAmountMajor: amountMinor / unitPerMajor,
    platformFeeMinor: platformFixedMinor + platformPercentMinor,
    platformFeeMajor: (platformFixedMinor + platformPercentMinor) / unitPerMajor,
    fxMarkupMinor,
    fxMarkupMajor: fxMarkupMinor / unitPerMajor,
    payoutCostMinor: payoutFixedMinor + payoutPercentMinor,
    payoutCostMajor: (payoutFixedMinor + payoutPercentMinor) / unitPerMajor,
    complianceBufferMinor,
    complianceBufferMajor: complianceBufferMinor / unitPerMajor,
    stripeFeeMinor,
    stripeFeeMajor: stripeFeeMinor / unitPerMajor,
    totalChargeMinor,
    totalChargeMajor: totalChargeMinor / unitPerMajor,
  };
}

export function createPaymentIntentHandler(deps = {}) {
  const {
    getStripeImpl,
    requireAuthenticatedUser = async () => {
      throw createHttpError(
        503,
        "Authentication is unavailable because Supabase is not configured on this deployment.",
        { reason: "supabase_not_configured" }
      );
    },
    verifyKyc,
    readBody = getJsonBody,
    quoteBuilder = buildQuote,
  } = deps;

  return async function handler(req, res) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return sendJson(res, 405, {
        ok: false,
        route: "create-payment-intent",
        error: "Method not allowed. Use POST.",
      });
    }

    let body;
    try {
      body = await readBody(req);
    } catch (err) {
      return sendJson(res, 400, {
        ok: false,
        route: "create-payment-intent",
        stage: "body-parse",
        error: err.message || "Invalid JSON request body",
      });
    }

    // ---- Identity gate 1: AUTH FIRST (P0-1) -----------------------------
    // Resolved BEFORE any KYC processing, any quote/payment work, and before
    // Stripe is created. An unauthenticated caller is refused here and can
    // never reach the PaymentIntent creation or receive a client secret.
    let user;
    try {
      user = await requireAuthenticatedUser(req);
    } catch (err) {
      return sendHttpError(res, err);
    }
    if (!user) {
      return sendHttpError(
        res,
        createHttpError(401, "You must be signed in to do this.", {
          reason: "authentication_required",
        })
      );
    }

    // Volatile-but-essential wiring: getStripe() may be undefined even with a
    // valid session (e.g. Stripe unconfigured). Refuse cleanly rather than
    // crashing with a TypeError later.
    const stripe = getStripeImpl ? getStripeImpl() : null;
    if (!stripe) {
      return sendJson(res, 500, {
        ok: false,
        route: "create-payment-intent",
        stage: "config",
        error: "Server is missing STRIPE_SECRET_KEY",
      });
    }

    const currency = normalizeCurrency(body.currency, "usd");

    // P1-3: express every amount in the minor units of its own currency.
    // moneyAmount.resolveSendAmountMinor accepts amountMajor (major units,
    // converted through money.js's ISO 4217 exponent — JPY exponent 1, BHD
    // 1000, USD/EUR/KES 100) and keeps legacy amountMinor/amount working.
    // One exponent table lives in money.js; no /100 or *100 is hard-coded
    // anywhere on the money path.
    const sendAmountMinor = resolveSendAmountMinor(body, currency);

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
      body.quote?.recipientGetsMinor;

    if (!Number.isFinite(sendAmountMinor) || sendAmountMinor <= 0) {
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
    if (maxSendCents > 0 && sendAmountMinor > maxSendCents) {
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

    // ---- Identity gate 2: KYC (second layer, AFTER authentication) -----
    // Runs BEFORE any PaymentIntent is created, so an unverified sender can
    // never reach the card form with a live client secret. The browser only
    // supplies an inquiry ID; approval itself is confirmed server-side against
    // Persona (or the webhook-written kyc_records table).
    const kyc = verifyKyc
      ? await verifyKyc(body.kycInquiryId || body.inquiryId || body.kyc?.inquiryId)
      : { ok: true, source: "unconfigured", skipped: true };

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

    // ---- Funding joins the transfer (Batch 2, additive) ------------------
    // When the request names a transfer, the charge amount is rebuilt from the
    // STORED quote — never from a client amount. Validation: transfer owned +
    // pending_funding + quote single-use anchor intact. The legacy path
    // (no transferId) keeps the direct amount flow for backwards-compatible
    // tests and non-lifecycle usage.
    let boundTransfer = null;
    let boundQuote = null;
    const rawTransferId = String(body.transferId || body.transfer_id || "").trim();
    if (deps.transferStore && rawTransferId) {
      const found = await deps.transferStore.getTransferById(rawTransferId);
      if (found?.error) {
        return sendJson(res, 503, {
          ok: false,
          route: "create-payment-intent",
          stage: "transfer-lookup",
          error: "Could not read the transfer. Please try again.",
        });
      }
      const transferRow = found?.data;
      if (!transferRow || String(transferRow.user_id) !== String(user.id)) {
        return sendJson(res, 404, {
          ok: false,
          route: "create-payment-intent",
          stage: "transfer-lookup",
          error: "Transfer not found.",
        });
      }
      if (String(transferRow.status) !== "pending_funding") {
        return sendJson(res, 409, {
          ok: false,
          route: "create-payment-intent",
          stage: "transfer-state",
          error: `This transfer is not awaiting funding (state: ${transferRow.status}).`,
        });
      }
      const quoteLookup = await deps.transferStore.getQuoteById(transferRow.quote_id);
      if (quoteLookup?.error || !quoteLookup?.data) {
        return sendJson(res, 503, {
          ok: false,
          route: "create-payment-intent",
          stage: "quote-lookup",
          error: "Could not read the stored quote for this transfer.",
        });
      }
      boundQuote = quoteLookup.data;
      boundTransfer = transferRow;
    }

    const quote = quoteBuilder(sendAmountMinor, unitPerMajorFor(currency)) || buildQuote(sendAmountMinor, unitPerMajorFor(currency));

    const recipientAmountMinor = Number(
      explicitRecipientAmountMinor ?? quote.sendAmountMinor
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
      kycInquiryId: String(body.kycInquiryId || body.inquiryId || ""),
      kycVerifiedBy: String(kyc.source || ""),
      kycStatus: String(kyc.status || (kyc.skipped ? "not_required" : "")),
    };

    // Bound transfers carry the exact reconciliation anchors in metadata.
    if (boundTransfer) {
      metadata.quoteId = String(boundTransfer.quote_id || "");
      metadata.expectedChargeMinor = String(
        boundTransfer.expected_charge_minor ?? boundQuote?.total_charge_minor ?? 0
      );
    }

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
      amount: quote.totalChargeMinor,
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

    // Stripe idempotency is bound to the transfer when one is named, so the
    // same transfer can never create two PaymentIntents (pi-{transferId}).
    const idempotencyKey = boundTransfer
      ? `pi-${transferId}`
      : `pi-${referenceId}`;

    try {
      const paymentIntent = await stripe.paymentIntents.create(createParams, {
        idempotencyKey,
      });

      // Server-store PI id + amount at CREATION time (Batch 2 invariant: the
      // webhook reconciles against what the server recorded, never the client).
      if (boundTransfer && deps.transferStore?.bindPaymentIntent) {
        const stored = await deps.transferStore.bindPaymentIntent({
          id: boundTransfer.id,
          paymentIntentId: paymentIntent.id,
          paymentIntentAmountMinor: paymentIntent.amount,
        });
        if (!stored?.ok) {
          console.error(
            `[create-payment-intent] could not persist PI binding for ${boundTransfer.id}: ${
              stored?.error || "write failed"
            }`
          );
        }
      }

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
          recipientGetsMinor: recipientAmountMinor,
          // Back-compat fields for the existing fee-breakdown UIs.
          sendAmountCents: quote.sendAmountMinor,
          platformFeeCents: quote.platformFeeMinor,
          fxMarkupCents: quote.fxMarkupMinor,
          payoutCostCents: quote.payoutCostMinor,
          complianceBufferCents: quote.complianceBufferMinor,
          stripeFeeEstimateCents: quote.stripeFeeMinor,
          totalChargeCents: quote.totalChargeMinor,
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
  };
}

// Re-exported for existing importers/tests; the implementation lives in
// moneyAmount.js and delegates to src/lib/money.js — the one ISO table.
export { unitPerMajorFor } from "./moneyAmount.js";

export default createPaymentIntentHandler;