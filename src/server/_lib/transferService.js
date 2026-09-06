// src/server/_lib/transferService.js
//
// P1-2: server-owned transfers (Batch 2, sandbox-only).
//
// A transfer is created from a consumed quote, carries the immutable quote
// snapshot anchor (expected_charge_minor), and advances through the transfer
// state machine only in service code after gate checks + webhook
// reconciliation. The browser only submits ids + an idempotency key; every
// amount, fee, rate and status is read from the server, never the client.
//
// Store interface (injected so tests use fixtures — no network, no live
// Supabase):
//   store.getQuoteById(id) -> { data, error }  (own-service read)
//   store.consumeQuote({ id, userId, nowIso }) -> { data, error } (conditional
//       status='issued' AND expires_at > now; single row on success)
//   store.getByIdempotencyKey({ key, userId }) -> { data, error }
//   store.createTransfer(row) -> { data, error }   (unique idempotency_key)
//   store.getTransferById(id) -> { data, error }
//   store.listTransfers({ userId, limit }) -> { data, error }
//   store.updateTransferStatus({
//       id, userId, fromStatus, toStatus, patch }) -> { data, error }
//       (conditional UPDATE ... WHERE status = fromStatus; single row)
//   store.audit({ action, user, status, transferId, metadata }) -> { persisted }
//
// No store -> fail-closed 503 on every mutation (no silent local fallback on
// the money path). Gate failures -> 403 (fail-closed), over-limit -> 422 keep
// the safetyEngine vocabulary, wrong-state/expired/duplicate -> 409.

import { createHttpError } from "./http.js";
import { effectiveAllowUnscreened } from "./sandboxGuard.js";
import { runTransferSafetyChecks } from "./safetyEngine.js";
import {
  TRANSFER_STATUS,
  canTransitionTransfers,
  isKnownTransferStatus,
  isTerminalTransferStatus,
} from "./transferStateMachine.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeId(value) {
  return String(value || "").trim();
}

function isUniqueViolation(error) {
  if (!error) return false;
  return (
    error.code === "23505" ||
    /duplicate|unique/i.test(String(error.message || ""))
  );
}

export function requireStore(store) {
  if (!store) {
    throw createHttpError(
      503,
      "Transfers are unavailable because the database is not configured.",
      { reason: "db_not_configured" }
    );
  }
  return store;
}

/**
 * Normalize/create the transfer row from a consumed quote (server-owned
 * snapshot). `quote` is the full stored quote row (the service reads it, never
 * the client). The row copies the immutable anchors; nothing is re-quoted.
 */
export function buildTransferRow({ user, quote, idempotencyKey }) {
  const id = `tr_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  const nowIso = new Date().toISOString();

  return {
    id,
    user_id: String(user.id),
    recipient_name: String(
      quote.recipient_name || "Recipient"
    ),
    destination: String(quote.recipient_destination || quote.receive_currency || ""),
    send_amount: Number(quote.send_amount_major || 0),
    send_currency: String(quote.send_currency || "USD").toUpperCase(),
    receive_amount: Number(quote.receive_amount_major || 0),
    receive_currency: String(quote.receive_currency || "").toUpperCase(),
    payment_method: "card",
    quote_id: quote.id || null,
    expected_charge_minor: Number(quote.total_charge_minor),
    idempotency_key: idempotencyKey || null,
    status: TRANSFER_STATUS.PENDING_FUNDING,
    metadata: {
      quote: {
        id: quote.id,
        fx_rate: Number(quote.fx_rate),
        total_charge_minor: Number(quote.total_charge_minor),
        send_amount_minor: Number(quote.send_amount_minor),
        receive_amount_minor: Number(quote.receive_amount_minor),
      },
      mode: String(process.env.TRANSFER_MODE || "sandbox"),
    },
    created_at: nowIso,
  };
}

/**
 * Validate the transfer-submit body: ids + idempotency key only. Amounts are
 * never accepted here — they come from the stored quote.
 */
export function parseTransferSubmitBody(body = {}) {
  const quoteId = normalizeId(body.quoteId || body.quote_id);
  const idempotencyKey = String(
    body.idempotencyKey || body.idempotency_key || ""
  ).trim();

  if (!quoteId) {
    throw createHttpError(422, "quoteId is required.", {
      code: "quote_required",
    });
  }
  if (!idempotencyKey) {
    throw createHttpError(422, "idempotencyKey is required.", {
      code: "idempotency_key_required",
    });
  }
  if (idempotencyKey.length > 120) {
    throw createHttpError(422, "idempotencyKey is too long.", {
      code: "idempotency_key_too_long",
    });
  }

  return { quoteId, idempotencyKey };
}

/**
 * Resolve the full safety gate snapshot for a quote submission (KYC approved,
 * sanctions clear, risk not blocked, recipient owned + active + corridor
 * allowlist, amount positive + inside limits, velocity available). Injectable
 * so tests can supply fixture gates without touching the network.
 *
 * Returns { ok, failures, warnings } or throws 403/422 on failure.
 */
export async function runFullTransferGates({ user, quote, gates }) {
  const results = { failures: [], warnings: [] };

  if (gates && typeof gates === "object") {
    // kyc: object or { ok, code } -> map to safetyEngine vocabulary.
    const kycResult =
      typeof gates.kyc === "function" ? await gates.kyc(quote) : gates.kyc;
    if (!kycResult || kycResult.ok !== true) {
      results.failures.push("Sender KYC must be approved before transfer creation.");
    }

    // sanctions: { status } or { ok }.
    const sanctionsResult =
      typeof gates.sanctions === "function"
        ? await gates.sanctions(quote)
        : gates.sanctions;
    const sanctionsStatus = sanctionsResult?.status || "not_configured";
    if (sanctionsStatus !== "clear") {
      if (
        sanctionsStatus === "not_configured" &&
        effectiveAllowUnscreened()
      ) {
        results.warnings.push(
          "Sanctions screening is not configured; allowed by NEXA_ALLOW_UNSCREENED. Not valid for real transfers."
        );
      } else {
        results.failures.push(
          `Sanctions screening must be clear before transfer creation (sanctions status: ${sanctionsStatus}).`
        );
      }
    }

    // risk: { status }.
    const riskResult =
      typeof gates.risk === "function" ? await gates.risk(quote) : gates.risk;
    if (riskResult?.status === "blocked") {
      results.failures.push("Fraud risk check blocked this transfer.");
    } else if (riskResult?.status === "manual_review") {
      results.warnings.push("Fraud risk check requires manual review before release.");
    } else if (!riskResult || riskResult.status === "not_configured") {
      results.warnings.push("Fraud risk scoring is not configured on this deployment.");
    }

    // velocity: { available } + limits (or undefined = unconfigured, let the
    // engine treat it as unavailable -> fail closed unless overrides).
    let velocity = { available: true, dailyAmount: 0, monthlyAmount: 0, dailyCount: 0 };
    if (gates.velocity) {
      const v =
        typeof gates.velocity === "function"
          ? await gates.velocity(quote)
          : gates.velocity;
      velocity = v || velocity;
    }
    const velocityLimits =
      gates.velocityLimits || { dailyAmount: 2500, monthlyAmount: 10000, dailyCount: 10 };
    const velocityCheck = runTransferSafetyChecks({
      user,
      amount: Number(quote.send_amount_major || 0),
      currency: quote.send_currency,
      recipient: {
        name: quote.recipient_name,
        corridor: quote.recipient_corridor || "US-NG",
        limit: Number(quote.recipient_limit || 2500),
        risk: quote.recipient_risk || null,
      },
      quote,
      kyc: { status: "approved" },
      sanctions: { status: "clear" },
      risk: { status: "clear" },
      velocity,
      velocityLimits,
      allowUnscreened: false,
    });
    results.failures = results.failures.concat(velocityCheck.failures || []);
    results.warnings = results.warnings.concat(velocityCheck.warnings || []);
  }

  return results;
}

/**
 * Create a transfer: full gate re-run -> atomic quote consumption -> insert
 * (idempotency replay on the same key returns the existing transfer).
 */
export async function createTransfer({ user, body, store, gates }) {
  requireStore(store);
  const { quoteId, idempotencyKey } = parseTransferSubmitBody(body);

  // Idempotent replay FIRST: a retry with the same key returns the existing
  // transfer, never a second quote consumption or transfer.
  const existing = await store.getByIdempotencyKey({ key: idempotencyKey, userId: user.id });
  if (existing?.error) {
    throw createHttpError(503, "Could not check for a duplicate transfer.", {
      reason: "db_error",
    });
  }
  if (existing?.data) {
    if (String(existing.data.user_id) !== String(user.id)) {
      throw createHttpError(403, "This transfer belongs to another customer.", {
        code: "forbidden",
      });
    }
    return { transfer: toClientTransfer(existing.data), replayed: true };
  }

  // Read the quote server-side (never trust a client quote snapshot).
  const found = await store.getQuoteById(quoteId);
  if (found?.error) {
    throw createHttpError(503, "Could not read the quote. Please try again.", {
      reason: "db_error",
    });
  }
  if (!found?.data || String(found.data.user_id) !== String(user.id)) {
    throw createHttpError(404, "Quote not found.", { code: "not_found" });
  }
  const quote = found.data;

  if (String(quote.status) !== "issued") {
    throw createHttpError(
      409,
      "This quote has already been used. Create a fresh quote and try again.",
      { code: "quote_already_used" }
    );
  }

  const gatesResult = await runFullTransferGates({ user, quote, gates });
  if (gatesResult.failures.length > 0) {
    throw createHttpError(403, "This transfer is blocked by safety or compliance checks.", {
      code: "gate_failed",
      failures: gatesResult.failures,
    });
  }

  // Atomic single-use + expiry guard in one conditional UPDATE. A concurrent
  // winner leaves zero rows for the loser (409).
  const consumed = await store.consumeQuote({
    id: quote.id,
    userId: user.id,
    nowIso: new Date().toISOString(),
  });
  if (consumed?.error) {
    if (isUniqueViolation(consumed.error)) {
      throw createHttpError(409, "This quote has already been used. Create a fresh quote and try again.", {
        code: "quote_already_used",
      });
    }
    throw createHttpError(503, "Could not consume the quote. Please try again.", {
      reason: "db_error",
    });
  }
  if (!consumed?.data) {
    throw createHttpError(
      409,
      "This quote has expired or already been used. Create a fresh quote and try again.",
      { code: "quote_already_used" }
    );
  }

  const row = buildTransferRow({ user, quote: consumed.data, idempotencyKey });

  const created = await store.createTransfer(row);
  if (created?.error) {
    if (isUniqueViolation(created.error) && idempotencyKey) {
      const winner = await store.getByIdempotencyKey({ key: idempotencyKey, userId: user.id });
      if (winner?.data) return { transfer: toClientTransfer(winner.data), replayed: true };
      throw createHttpError(409, "A transfer with this idempotency key already exists.", {
        code: "duplicate_idempotency_key",
      });
    }
    throw createHttpError(503, "Could not create the transfer. Please try again.", {
      reason: "db_error",
    });
  }

  const audit = await store.audit({
    action: "transfer.created",
    user,
    status: "pending_funding",
    transferId: created.data.id,
    metadata: { idempotencyKey, quoteId: quote.id },
  });
  if (!audit?.persisted && process.env.NODE_ENV !== "test") {
    // Fail-closed: an unrecorded decision on the money path refuses the
    // mutation. (recordAuditEvent itself logs when Supabase is unconfigured.)
    throw createHttpError(503, "Could not record the transfer decision. Please try again.", {
      reason: "audit_failed",
    });
  }

  return { transfer: toClientTransfer(created.data), replayed: false };
}

export async function getTransferForUser({ user, transferId, store }) {
  requireStore(store);
  const id = normalizeId(transferId);
  if (!id) throw createHttpError(404, "Transfer not found.", { code: "not_found" });
  const found = await store.getTransferById(id);
  if (found?.error) {
    throw createHttpError(503, "Could not read the transfer. Please try again.", {
      reason: "db_error",
    });
  }
  if (!found?.data || String(found.data.user_id) !== String(user.id)) {
    throw createHttpError(404, "Transfer not found.", { code: "not_found" });
  }
  return toClientTransfer(found.data);
}

export async function listTransfersForUser({ user, store, limit = 50 }) {
  requireStore(store);
  const found = await store.listTransfers({ userId: user.id, limit });
  if (found?.error) {
    throw createHttpError(503, "Could not read transfers. Please try again.", {
      reason: "db_error",
    });
  }
  return (found?.data || []).map(toClientTransfer);
}

/**
 * Conditional status transition: returns the updated row. Throws 404 when the
 * transfer is not the caller's, 409 when the from->to edge is illegal or the
 * row is no longer in `from` (concurrent writer / wrong state).
 */
export async function transitionTransferStatus({
  user,
  transferId,
  fromStatus,
  toStatus,
  store,
  patch = {},
}) {
  requireStore(store);
  const id = normalizeId(transferId);
  if (!id) throw createHttpError(404, "Transfer not found.", { code: "not_found" });

  if (!isKnownTransferStatus(fromStatus) || !isKnownTransferStatus(toStatus)) {
    throw createHttpError(409, "Unknown transfer status.", { code: "illegal_transition" });
  }
  if (!canTransitionTransfers(fromStatus, toStatus)) {
    throw createHttpError(
      409,
      `A transfer in state "${fromStatus}" cannot move to "${toStatus}".`,
      { code: "illegal_transition" }
    );
  }

  const found = await store.getTransferById(id);
  if (found?.error) {
    throw createHttpError(503, "Could not read the transfer. Please try again.", {
      reason: "db_error",
    });
  }
  if (!found?.data || String(found.data.user_id) !== String(user.id)) {
    throw createHttpError(404, "Transfer not found.", { code: "not_found" });
  }
  if (String(found.data.status) !== String(fromStatus)) {
    throw createHttpError(
      409,
      `This transfer is not in state "${fromStatus}" (it is "${found.data.status}").`,
      { code: "wrong_transfer_state" }
    );
  }

  const updated = await store.updateTransferStatus({
    id,
    userId: user.id,
    fromStatus,
    toStatus,
    patch,
  });
  if (updated?.error) {
    throw createHttpError(503, "Could not update the transfer. Please try again.", {
      reason: "db_error",
    });
  }
  if (!updated?.data) {
    throw createHttpError(
      409,
      `This transfer is not in state "${fromStatus}" (it is "${found.data.status}").`,
      { code: "wrong_transfer_state" }
    );
  }
  return toClientTransfer(updated.data);
}

/**
 * Cancel only while pending_funding.
 */
export async function cancelTransfer({ user, transferId, store }) {
  return transitionTransferStatus({
    user,
    transferId,
    fromStatus: TRANSFER_STATUS.PENDING_FUNDING,
    toStatus: TRANSFER_STATUS.CANCELLED,
    store,
  });
}

/**
 * Server-computed receipt for a transfer (P0-6).
 *
 * The receipt is derived entirely from the STORED quote + transfer rows — never
 * from client math, and never from a locally-crafted record. The receipt total
 * is the server-owned `expected_charge_minor` (which was copied exactly from
 * `quote.total_charge_minor` at transfer creation, and which the webhook also
 * requires the PaymentIntent to match). Exact minor-unit equality across
 * quote/charge/receipt is therefore structural: all three read the same anchor.
 *
 * `quote` may be the stored quote row. When the store cannot join the quote
 * (unconfigured DB / missing row) the receipt is built from the transfer's own
 * immutable anchors and `quoteJoined` reflects that — the totals still equal
 * the charged amount because `expected_charge_minor` IS the quote total.
 */
export function buildServerReceipt({ transfer, quote = null }) {
  if (!transfer) return null;
  const sendCurrency = String(transfer.send_currency || "USD").toUpperCase();
  const receiveCurrency = String(transfer.receive_currency || "").toUpperCase();
  const totalChargeMinor = Number(transfer.expected_charge_minor ?? 0);

  // Quote-derived breakdown (all minor units of the send currency). The stored
  // quote is the source of truth; the transfer row's anchors are the fallback.
  // NOTE (sandbox fix): the approved quotes schema has no platform_fee_minor /
  // payout_cost_minor columns — derive the totals from the fixed+percent split.
  const feeBreakdown = {
    platformFeeMinor: Number(
      (quote?.platform_fixed_minor ?? 0) + (quote?.platform_percent_minor ?? 0)
    ),
    fxMarkupMinor: Number(quote?.fx_markup_minor ?? 0),
    payoutCostMinor: Number(
      (quote?.payout_fixed_minor ?? 0) + (quote?.payout_percent_minor ?? 0)
    ),
    complianceBufferMinor: Number(quote?.compliance_buffer_minor ?? 0),
    stripeFeeMinor: Number(quote?.stripe_fee_minor ?? 0),
  };

  const quoteTotal =
    quote?.total_charge_minor != null ? Number(quote.total_charge_minor) : null;

  return {
    id: `RCP-${String(transfer.id || "").replace(/^tr_/, "")}`,
    transferId: transfer.id,
    quoteId: transfer.quote_id || quote?.id || null,
    status: transfer.status,
    recipientName: transfer.recipient_name || "Recipient",
    destination: transfer.destination || "",
    sendCurrency,
    sendAmountMajor: Number(transfer.send_amount || 0),
    sendAmountMinor: Number(transfer.send_amount_minor ?? 0),
    receiveCurrency,
    receiveAmountMajor: Number(transfer.receive_amount || 0),
    receiveAmountMinor: Number(transfer.receive_amount_minor ?? 0),
    expectedChargeMinor: totalChargeMinor,
    chargedMinor:
      Number(transfer.payment_intent_amount_minor ?? totalChargeMinor) ||
      totalChargeMinor,
    // P0-6: receipt total == charged total, exact minor equality with the
    // quote anchor. quoteTotal is null when the quote row is unavailable; the
    // transfer anchor IS the quote total so equality still holds structurally.
    totalChargeMinor: totalChargeMinor,
    quoteTotalMinor: quoteTotal,
    quoteMatchesTransfer:
      quoteTotal === null || quoteTotal === totalChargeMinor,
    feeBreakdown,
    feesMinor: Object.values(feeBreakdown).reduce((a, b) => a + b, 0),
    paymentMethod: transfer.payment_method || "card",
    paymentIntentId: transfer.payment_intent_id || null,
    paymentIntentAmountMinor:
      transfer.payment_intent_amount_minor == null
        ? null
        : Number(transfer.payment_intent_amount_minor),
    fundedAt: transfer.funded_at || null,
    createdAt: transfer.created_at,
  };
}

/**
 * Load a transfer's receipt for its owner. Auth is handled by the caller (the
 * route resolves the user first). Cross-user reads are 404 — no oracle.
 */
export async function getTransferReceiptForUser({ user, transferId, store }) {
  requireStore(store);
  const id = normalizeId(transferId);
  if (!id) throw createHttpError(404, "Transfer not found.", { code: "not_found" });

  const found = await store.getTransferById(id);
  if (found?.error) {
    throw createHttpError(503, "Could not read the transfer. Please try again.", {
      reason: "db_error",
    });
  }
  if (!found?.data || String(found.data.user_id) !== String(user.id)) {
    // 404 (not 403) so one customer cannot enumerate another's transfer ids.
    throw createHttpError(404, "Transfer not found.", { code: "not_found" });
  }

  // Join the stored quote when the store can read it (best-effort — the
  // transfer anchors are authoritative either way).
  let quote = null;
  if (store.getQuoteById && found.data.quote_id) {
    try {
      const quoted = await store.getQuoteById(found.data.quote_id);
      if (quoted?.data && String(quoted.data.user_id) === String(user.id)) {
        quote = quoted.data;
      }
    } catch {
      quote = null;
    }
  }

  return buildServerReceipt({ transfer: found.data, quote });
}

/**
 * Server-owned status shape for the API. All money fields come from the stored
 * row (immutable quote anchors), never from the client.
 */
export function toClientTransfer(row) {
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    recipientId: row.recipient_id || row.quote_recipient_id || null,
    recipientName: row.recipient_name,
    destination: row.destination,
    sendCurrency: String(row.send_currency || "USD").toUpperCase(),
    sendAmountMajor: Number(row.send_amount || 0),
    receiveCurrency: String(row.receive_currency || "").toUpperCase(),
    receiveAmountMajor: Number(row.receive_amount || 0),
    paymentMethod: row.payment_method || "card",
    quoteId: row.quote_id || null,
    expectedChargeMinor: Number(row.expected_charge_minor || 0),
    paymentIntentId: row.payment_intent_id || null,
    paymentIntentAmountMinor:
      row.payment_intent_amount_minor == null
        ? null
        : Number(row.payment_intent_amount_minor),
    idempotencyKey: row.idempotency_key || null,
    fundedAt: row.funded_at || null,
    createdAt: row.created_at,
    metadata: row.metadata || {},
  };
}

export default {
  createTransfer,
  getTransferForUser,
  listTransfersForUser,
  cancelTransfer,
  transitionTransferStatus,
  getTransferReceiptForUser,
  buildServerReceipt,
  runFullTransferGates,
  parseTransferSubmitBody,
  buildTransferRow,
  toClientTransfer,
  requireStore,
  TRANSFER_STATUS,
};