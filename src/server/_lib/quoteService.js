// src/server/_lib/quoteService.js
//
// P1-1: server-owned immutable quotes (Batch 2, sandbox-only).
//
// A quote is an immutable server snapshot of a priced transfer: fees (via the
// Batch 1 buildQuote minor-unit math), FX rate, and send/receive amounts are
// captured at issuance and NEVER recomputed or trusted from the client. After
// issuance only `status` + `consumed_at` mutate (issued -> consumed | expired
// | cancelled). Single-use + expiry are enforced server-side at the point of
// consumption with a conditional UPDATE — the guard, not a check-then-set.
//
// DB access goes through the injected `store` so tests exercise every path
// with fixtures (no network, no live Supabase). The store interface:
//   store.createQuote(row) -> { data, error }
//   store.getQuoteById(id) -> { data, error }
//   store.getQuoteByIdempotencyKey(key, userId) -> { data, error }
//   store.consumeQuote({ id, userId, nowIso }) -> { data, error }
//     (conditional: status='issued' AND expires_at > now; returns the row or
//     null when the guard fails — exactly 1 row on success)
//   store.cancelQuote({ id, userId, nowIso }) -> { data, error } (same guard)
// All store errors are fail-closed (thrown as 503, never silent).
//
// When no store is available (Supabase unconfigured, sandbox DB absent) every
// mutation fails closed with 503 — there is NO silent local fallback on the
// money path (Batch 2 invariant).

import { createHttpError } from "./http.js";
import { buildQuote } from "./createPaymentIntentHandler.js";
import { unitPerMajorFor } from "./moneyAmount.js";
import { majorToMinor } from "../../lib/money.js";
import { getFallbackRate } from "../../lib/fx-rates.js";

export const QUOTE_TTL_MINUTES_DEFAULT = 15;

export const QUOTE_STATUS = Object.freeze({
  ISSUED: "issued",
  CONSUMED: "consumed",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
});

function getQuoteTtlMinutes(env = process.env) {
  const raw = Number(env?.NEXA_QUOTE_TTL_MINUTES);
  if (Number.isFinite(raw) && raw > 0 && raw <= 1440) return Math.trunc(raw);
  return QUOTE_TTL_MINUTES_DEFAULT;
}

function envInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isQuoteExpired(quote, nowMs = Date.now()) {
  if (!quote?.expires_at) return true;
  return new Date(quote.expires_at).getTime() <= nowMs;
}

/**
 * Validate quote-request input (ids + validated choices only — amounts are
 * validated, never authoritative downstream).
 * Returns a normalized object or throws an http error (422/400).
 */
export function validateQuoteInput(body = {}) {
  const sendCurrency = String(body.sendCurrency || body.currency || "")
    .trim()
    .toUpperCase();
  const receiveCurrency = String(
    body.receiveCurrency || body.recipientCurrency || ""
  )
    .trim()
    .toUpperCase();
  const recipientId =
    body.recipientId ?? body.recipient?.id ?? body.recipient ?? null;

  const majorRaw =
    body.sendAmountMajor ?? body.amountMajor ?? body.amount ?? null;
  const major = Number(majorRaw);

  if (!sendCurrency || sendCurrency.length !== 3) {
    throw createHttpError(422, "sendCurrency must be a 3-letter ISO currency code.", {
      code: "invalid_currency",
    });
  }
  if (!receiveCurrency || receiveCurrency.length !== 3) {
    throw createHttpError(422, "receiveCurrency must be a 3-letter ISO currency code.", {
      code: "invalid_currency",
    });
  }
  if (!Number.isFinite(major) || major <= 0) {
    throw createHttpError(422, "sendAmountMajor must be a positive number.", {
      code: "invalid_amount",
    });
  }
  const maxSendMajor = Number(process.env.NEXA_MAX_SEND_MAJOR);
  if (Number.isFinite(maxSendMajor) && maxSendMajor > 0 && major > maxSendMajor) {
    throw createHttpError(422, "Amount exceeds the configured maximum.", {
      code: "amount_exceeds_maximum",
    });
  }
  if (!recipientId || (typeof recipientId === "string" && !recipientId.trim())) {
    throw createHttpError(422, "recipientId is required.", {
      code: "recipient_required",
    });
  }
  return {
    recipientId: String(recipientId).trim(),
    sendCurrency,
    receiveCurrency,
    sendAmountMajor: major,
    idempotencyKey:
      body.idempotencyKey || body.idempotency_key
        ? String(body.idempotencyKey || body.idempotency_key).trim()
        : null,
  };
}

/**
 * Build the immutable quote snapshot row (not yet persisted).
 * Fees come from buildQuote (Batch 1 minor-unit math); the receive side is the
 * send amount converted at the server-captured FX rate.
 */
export function buildQuoteSnapshot({
  userId,
  recipientId,
  sendCurrency,
  receiveCurrency,
  sendAmountMajor,
  fxRate = null,
  nowMs = Date.now(),
  env = process.env,
}) {
  const sendMinor = majorToMinor(sendAmountMajor, sendCurrency);
  if (!Number.isFinite(sendMinor) || sendMinor <= 0) {
    throw createHttpError(422, "sendAmountMajor must be a positive number.", {
      code: "invalid_amount",
    });
  }
  const quote = buildQuote(sendMinor, unitPerMajorFor(sendCurrency));
  if (!quote) {
    throw createHttpError(422, "Could not price this amount.", {
      code: "quote_failed",
    });
  }
  // Server-captured rate: explicit override (tests) else bundled corridor
  // table. Same-currency corridors convert 1:1.
  const rate =
    fxRate ??
    (sendCurrency === receiveCurrency
      ? 1
      : getFallbackRate(sendCurrency, receiveCurrency));
  if (!Number.isFinite(Number(rate)) || Number(rate) <= 0) {
    throw createHttpError(422, `No rate available for ${sendCurrency}→${receiveCurrency}.`, {
      code: "corridor_unavailable",
    });
  }
  const receiveMinor = Math.round(sendMinor * Number(rate));
  const receiveMajor = receiveMinor / unitPerMajorFor(receiveCurrency);
  const ttlMin = getQuoteTtlMinutes(env);
  const createdAt = new Date(nowMs).toISOString();
  const expiresAt = new Date(nowMs + ttlMin * 60_000).toISOString();

  // Fee-column split for the quotes table (all minor units of send currency).
  const platformPercentBps = envInt("NEXA_PLATFORM_PERCENT_BPS", 0);
  const payoutPercentBps = envInt("NEXA_PAYOUT_PERCENT_BPS", 0);
  const fxMarkupBps = envInt("NEXA_FX_MARKUP_BPS", 40);
  const platformPercentMinor = Math.ceil(sendMinor * (platformPercentBps / 10000));
  const payoutPercentMinor = Math.ceil(sendMinor * (payoutPercentBps / 10000));

  return {
    user_id: String(userId),
    status: QUOTE_STATUS.ISSUED,
    recipient_id: UUID_RE.test(String(recipientId)) ? String(recipientId) : null,
    recipient_ref: String(recipientId),
    send_currency: sendCurrency,
    send_amount_major: sendAmountMajor,
    send_amount_minor: sendMinor,
    receive_currency: receiveCurrency,
    receive_amount_major: receiveMajor,
    receive_amount_minor: receiveMinor,
    fx_rate: Number(rate),
    platform_fixed_minor: envInt("NEXA_PLATFORM_FIXED_FEE_CENTS", 99),
    platform_percent_minor: platformPercentMinor,
    platform_fee_minor: quote.platformFeeMinor,
    fx_markup_minor: quote.fxMarkupMinor,
    payout_fixed_minor: envInt("NEXA_PAYOUT_FIXED_FEE_CENTS", 0),
    payout_percent_minor: payoutPercentMinor,
    payout_cost_minor: quote.payoutCostMinor,
    compliance_buffer_minor: quote.complianceBufferMinor,
    stripe_fee_minor: quote.stripeFeeMinor,
    total_charge_minor: quote.totalChargeMinor,
    total_charge_major: quote.totalChargeMajor,
    expires_at: expiresAt,
    created_at: createdAt,
    consumed_at: null,
    idempotency_key: null,
  };
}

/** Shape a stored quote row for the API (client never sees internals). */
export function toClientQuote(row) {
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    recipientId: row.recipient_id || row.recipient_ref || null,
    sendCurrency: row.send_currency,
    sendAmountMajor: Number(row.send_amount_major),
    sendAmountMinor: Number(row.send_amount_minor),
    receiveCurrency: row.receive_currency,
    receiveAmountMajor: Number(row.receive_amount_major),
    receiveAmountMinor: Number(row.receive_amount_minor),
    fxRate: row.fx_rate == null ? null : Number(row.fx_rate),
    fees: {
      platformFeeMinor: Number(row.platform_fee_minor ?? row.platform_fixed_minor ?? 0),
      fxMarkupMinor: Number(row.fx_markup_minor ?? 0),
      payoutCostMinor: Number(row.payout_cost_minor ?? row.payout_fixed_minor ?? 0),
      complianceBufferMinor: Number(row.compliance_buffer_minor ?? 0),
      stripeFeeMinor: Number(row.stripe_fee_minor ?? 0),
    },
    totalChargeMinor: Number(row.total_charge_minor),
    totalChargeMajor:
      row.total_charge_major == null ? null : Number(row.total_charge_major),
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    consumedAt: row.consumed_at || null,
  };
}

/**
 * Issue a quote: validate → duplicate-idempotency replay → snapshot → persist.
 * All gate results (kyc/sanctions/risk/recipient/corridor) arrive via the
 * injected `gates` callback so this module never touches the network:
 *   gates({ normalized, user }) -> { ok, failures, recipient, ... }
 * A failing gate throws 403 with the failures. The recipient object returned
 * by gates is server-owned (corridor/limit/risk) and stored on the row.
 */
export async function issueQuote({ user, body, store, gates }) {
  if (!store) {
    throw createHttpError(503, "Quotes are unavailable because the database is not configured.", {
      reason: "db_not_configured",
    });
  }
  const normalized = validateQuoteInput(body);

  // Idempotency replay: same key returns the existing quote, never a second.
  if (normalized.idempotencyKey) {
    const existing = await store.getQuoteByIdempotencyKey(
      normalized.idempotencyKey,
      user.id
    );
    if (existing?.error) {
      throw createHttpError(503, "Could not check for a duplicate quote.", {
        reason: "db_error",
      });
    }
    if (existing?.data) {
      if (String(existing.data.user_id) !== String(user.id)) {
        throw createHttpError(403, "This quote belongs to another customer.", {
          code: "forbidden",
        });
      }
      return { quote: toClientQuote(existing.data), replayed: true };
    }
  }

  // Full safety gates BEFORE pricing (approved KYC, clear sanctions, risk not
  // blocked, recipient owned+active, corridor allowlist, amount in limits).
  let gateResult = { ok: true, recipient: null, failures: [], warnings: [] };
  if (typeof gates === "function") {
    gateResult = await gates({ normalized, user });
  }
  if (!gateResult?.ok) {
    throw createHttpError(403, "This transfer is blocked by safety or compliance checks.", {
      code: "gate_failed",
      failures: gateResult?.failures || ["Safety checks failed."],
    });
  }

  const row = buildQuoteSnapshot({
    userId: user.id,
    recipientId: normalized.recipientId,
    sendCurrency: normalized.sendCurrency,
    receiveCurrency: normalized.receiveCurrency,
    sendAmountMajor: normalized.sendAmountMajor,
  });
  if (normalized.idempotencyKey) row.idempotency_key = normalized.idempotencyKey;
  if (gateResult?.recipient) {
    row.recipient_snapshot = {
      corridor: gateResult.recipient.corridor || null,
      limit: gateResult.recipient.limit ?? null,
      risk: gateResult.recipient.risk || null,
    };
  }

  const created = await store.createQuote(row);
  if (created?.error || !created?.data) {
    // Unique-violation on idempotency key = concurrent duplicate: fetch winner.
    if (normalized.idempotencyKey && isUniqueViolation(created?.error)) {
      const winner = await store.getQuoteByIdempotencyKey(
        normalized.idempotencyKey,
        user.id
      );
      if (winner?.data) return { quote: toClientQuote(winner.data), replayed: true };
    }
    if (isUniqueViolation(created?.error)) {
      throw createHttpError(409, "A quote with this idempotency key already exists.", {
        code: "duplicate_idempotency_key",
      });
    }
    throw createHttpError(503, "Could not create the quote. Please try again.", {
      reason: "db_error",
    });
  }
  return { quote: toClientQuote(created.data), replayed: false };
}

export async function getQuoteForUser({ user, quoteId, store }) {
  if (!store) {
    throw createHttpError(503, "Quotes are unavailable because the database is not configured.", {
      reason: "db_not_configured",
    });
  }
  const id = String(quoteId || "").trim();
  if (!id) throw createHttpError(404, "Quote not found.", { code: "not_found" });
  const found = await store.getQuoteById(id);
  if (found?.error) {
    throw createHttpError(503, "Could not read the quote. Please try again.", {
      reason: "db_error",
    });
  }
  if (!found?.data || String(found.data.user_id) !== String(user.id)) {
    // Cross-user reads are 404 (not 403) so one customer cannot enumerate
    // another's quote ids.
    throw createHttpError(404, "Quote not found.", { code: "not_found" });
  }
  return toClientQuote(found.data);
}

/**
 * Atomically consume a quote (single-use + expiry guard in one conditional
 * write). Returns the consumed row. Throws 409 when already consumed/expired
 * (concurrent double-submit serializes to one winner) and 404 when not yours.
 */
export async function consumeQuoteOwned({ user, quoteId, store, nowMs = Date.now() }) {
  if (!store) {
    throw createHttpError(503, "Quotes are unavailable because the database is not configured.", {
      reason: "db_not_configured",
    });
  }
  // Ownership check first (404 when not yours — no cross-user oracle).
  const found = await store.getQuoteById(String(quoteId || "").trim());
  if (found?.error) {
    throw createHttpError(503, "Could not read the quote. Please try again.", {
      reason: "db_error",
    });
  }
  if (!found?.data || String(found.data.user_id) !== String(user.id)) {
    throw createHttpError(404, "Quote not found.", { code: "not_found" });
  }
  if (isQuoteExpired(found.data, nowMs)) {
    throw createHttpError(409, "This quote has expired. Create a fresh quote and try again.", {
      code: "quote_expired",
    });
  }
  if (String(found.data.status) !== QUOTE_STATUS.ISSUED) {
    throw createHttpError(409, "This quote has already been used. Create a fresh quote and try again.", {
      code: "quote_already_used",
    });
  }
  // The conditional UPDATE is the guard: only a row still issued + unexpired
  // flips to consumed. A concurrent winner leaves zero rows for the loser.
  const consumed = await store.consumeQuote({
    id: found.data.id,
    userId: user.id,
    nowIso: new Date(nowMs).toISOString(),
  });
  if (consumed?.error) {
    throw createHttpError(503, "Could not consume the quote. Please try again.", {
      reason: "db_error",
    });
  }
  if (!consumed?.data) {
    throw createHttpError(409, "This quote has already been used. Create a fresh quote and try again.", {
      code: "quote_already_used",
    });
  }
  return toClientQuote(consumed.data);
}

export async function cancelQuoteOwned({ user, quoteId, store, nowMs = Date.now() }) {
  if (!store) {
    throw createHttpError(503, "Quotes are unavailable because the database is not configured.", {
      reason: "db_not_configured",
    });
  }
  const found = await store.getQuoteById(String(quoteId || "").trim());
  if (found?.error) {
    throw createHttpError(503, "Could not read the quote. Please try again.", {
      reason: "db_error",
    });
  }
  if (!found?.data || String(found.data.user_id) !== String(user.id)) {
    throw createHttpError(404, "Quote not found.", { code: "not_found" });
  }
  if (String(found.data.status) !== QUOTE_STATUS.ISSUED) {
    throw createHttpError(409, "Only an issued quote can be cancelled.", {
      code: "quote_not_cancellable",
    });
  }
  const cancelled = await store.cancelQuote({
    id: found.data.id,
    userId: user.id,
    nowIso: new Date(nowMs).toISOString(),
  });
  if (cancelled?.error) {
    throw createHttpError(503, "Could not cancel the quote. Please try again.", {
      reason: "db_error",
    });
  }
  if (!cancelled?.data) {
    throw createHttpError(409, "Only an issued quote can be cancelled.", {
      code: "quote_not_cancellable",
    });
  }
  return toClientQuote(cancelled.data);
}

function isUniqueViolation(error) {
  if (!error) return false;
  return (
    error.code === "23505" ||
    /duplicate|unique/i.test(String(error.message || ""))
  );
}

export default {
  issueQuote,
  getQuoteForUser,
  consumeQuoteOwned,
  cancelQuoteOwned,
  validateQuoteInput,
  buildQuoteSnapshot,
  toClientQuote,
  isQuoteExpired,
  QUOTE_STATUS,
};
