// src/server/_lib/webhookReconciliation.js
//
// P1-2 + P0-6: Stripe webhook reconciliation (Batch 2, sandbox-only).
//
// A signature-verified payment_intent.succeeded only advances a transfer when
// every minor-unit anchor matches exactly:
//   PI.amount === transfer.payment_intent_amount_minor
//             === transfer.expected_charge_minor
//             === quote.total_charge_minor   (copy-anchored at creation)
// and the currencies agree. Canonical money is minor units everywhere; all
// comparisons are exact integer equality — no floats.
//
// Idempotent: duplicate/late events are a no-op (conditional transition only
// fires from pending_funding; last_webhook_event_id dedupes; payouts unique on
// transfer_id). A mismatch sets reconciliation_failed with NO obligation and
// the transfer is never marked funded.
//
// store adapter:
//   store.getTransferByPaymentIntentId(piId) -> { data, error }
//   store.updateTransferStatus({ id, fromStatus, toStatus, patch }) -> { data }
//   store.recordPayout({ transfer, ... }) -> { payout, created } (idempotent)

import { createHttpError } from "./http.js";
import { TRANSFER_STATUS } from "./transferStateMachine.js";

export function reconcileAmounts({ paymentIntentAmount, transferAmountMinor }) {
  const pi = Number(paymentIntentAmount);
  const tr = Number(transferAmountMinor);
  if (!Number.isFinite(pi) || !Number.isFinite(tr)) return false;
  return Number.isInteger(pi) && Number.isInteger(tr) && pi === tr;
}

/**
 * Attempt the pending_funding -> funded -> payout_pending advancement after an
 * exact reconciliation. Returns a result object; never throws for a mismatch
 * (fail-soft acknowledge so Stripe does not retry forever).
 */
export async function reconcileFundingWebhook({
  store,
  paymentIntent,
  eventId,
  nowIso = new Date().toISOString(),
}) {
  if (!store) {
    return { ok: false, reason: "db_not_configured", acknowledged: true };
  }

  // 1. Find the transfer by the SERVER-stored PI id (never the client's).
  const piId = String(paymentIntent?.id || "");
  const found = await store.getTransferByPaymentIntentId(piId).catch(() => ({ data: null, error: null }));
  if (found?.error) {
    return { ok: false, reason: "db_error", acknowledged: true };
  }
  if (!found?.data) {
    // Unknown PI: acknowledge (idempotent no-op) — never fabricate funding.
    return { ok: false, reason: "transfer_not_found", acknowledged: true, paymentIntentId: piId };
  }
  const transfer = found.data;

  // 2. Dedupe: an already-processed event id is a no-op.
  if (transfer.last_webhook_event_id && transfer.last_webhook_event_id === String(eventId || "")) {
    return { ok: true, acknowledged: true, deduped: true, transferId: transfer.id };
  }
  if (String(transfer.status) === TRANSFER_STATUS.FUNDED ||
      String(transfer.status) === TRANSFER_STATUS.PAYOUT_PENDING) {
    return { ok: true, acknowledged: true, alreadyFunded: true, transferId: transfer.id };
  }
  if (String(transfer.status) !== TRANSFER_STATUS.PENDING_FUNDING) {
    return { ok: false, acknowledged: true, reason: "wrong_state", transferId: transfer.id };
  }

  // 3. Exact minor reconciliation + currency.
  const piAmount = Number(paymentIntent?.amount);
  const piCurrency = String(paymentIntent?.currency || "").toUpperCase();
  const transferCurrency = String(transfer.send_currency || "").toUpperCase();
  const expected = Number(transfer.expected_charge_minor);
  const storedPiAmount = Number(transfer.payment_intent_amount_minor);
  const centsMatch =
    Number.isInteger(piAmount) &&
    Number.isInteger(storedPiAmount) &&
    Number.isInteger(expected) &&
    piAmount === storedPiAmount &&
    storedPiAmount === expected &&
    piAmount === expected;

  if (!centsMatch || piCurrency !== transferCurrency) {
    // Mismatch -> reconciliation_failed, NO obligation, never funded.
    const updated = await store
      .updateTransferStatus({
        id: transfer.id,
        fromStatus: TRANSFER_STATUS.PENDING_FUNDING,
        toStatus: TRANSFER_STATUS.RECONCILIATION_FAILED,
        patch: { last_webhook_event_id: String(eventId || "") },
      })
      .catch(() => ({ data: null, error: true }));
    return {
      ok: false,
      acknowledged: true,
      reason: "amount_mismatch",
      mismatch: {
        paymentIntentAmount: piAmount,
        storedPiAmount,
        expectedChargeMinor: expected,
        currencyMismatch: piCurrency !== transferCurrency,
      },
      reconciliationFailed: true,
      transferId: transfer.id,
      updated: Boolean(updated?.data),
    };
  }

  // 4. Advance pending_funding -> funded (conditional UPDATE).
  const funded = await store
    .updateTransferStatus({
      id: transfer.id,
      fromStatus: TRANSFER_STATUS.PENDING_FUNDING,
      toStatus: TRANSFER_STATUS.FUNDED,
      patch: { funded_at: nowIso, last_webhook_event_id: String(eventId || "") },
    })
    .catch(() => ({ data: null, error: true }));
  if (!funded?.data) {
    // Concurrent advance / wrong state already handled above; acknowledge.
    return { ok: false, acknowledged: true, reason: "transition_failed", transferId: transfer.id };
  }

  // 5. Record the payout obligation (awaiting_provider, idempotent on
  //    transfer_id). Money is now taken; a failure here must not 500-loop.
  let payout = null;
  let payoutCreated = false;
  if (store.recordPayout) {
    try {
      const result = await store.recordPayout({ transfer, nowIso });
      payout = result?.payout || null;
      payoutCreated = Boolean(result?.created);
    } catch {
      payout = null;
    }
  }

  // 6. funded -> payout_pending ("Funding received — payout pending").
  await store
    .updateTransferStatus({
      id: transfer.id,
      fromStatus: TRANSFER_STATUS.FUNDED,
      toStatus: TRANSFER_STATUS.PAYOUT_PENDING,
      patch: { funded_at: nowIso },
    })
    .catch(() => null);

  return {
    ok: true,
    acknowledged: true,
    funded: true,
    transferId: transfer.id,
    payoutCreated,
    payoutStatus: payout?.status || "awaiting_provider",
    reconciliationFailed: false,
  };
}

export default reconcileFundingWebhook;