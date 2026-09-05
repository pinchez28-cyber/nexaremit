// src/server/_lib/transferStateMachine.js
//
// P1-2: server-owned transfer state machine (Batch 2, sandbox-only).
//
// A transfer's status is owned by the server. The browser never sets it and
// never advances it; every transition runs in service code after gate checks
// and webhook reconciliation, and every transition is a conditional UPDATE so
// a concurrent writer cannot double-advance the same row.
//
// Legal transitions (Batch 2 reachable states):
//
//   pending_funding ──(webhook: verified + exact-minor reconcile)──▶ funded
//        funded ──(payout obligation recorded, awaiting_provider)──▶ payout_pending
//   pending_funding ──(user cancel)──▶ cancelled
//   pending_funding ──(quote expired before funding)──▶ expired
//   pending_funding ──(webhook amount/currency mismatch)──▶ reconciliation_failed
//
// payout_pending is the honest terminal state for Batch 2: funding has been
// received and the recipient is owed money, but no payout provider exists to
// deliver it. Reserved states (payout_submitted, paid, payout_failed,
// refunded) are declared here but are NOT reachable until a provider exists.

import { createHttpError } from "./http.js";

export const TRANSFER_STATUS = Object.freeze({
  PENDING_FUNDING: "pending_funding",
  FUNDED: "funded",
  PAYOUT_PENDING: "payout_pending",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  RECONCILIATION_FAILED: "reconciliation_failed",
  // Reserved for a future payout provider (not reachable in Batch 2).
  PAYOUT_SUBMITTED: "payout_submitted",
  PAID: "paid",
  PAYOUT_FAILED: "payout_failed",
  REFUNDED: "refunded",
});

// One direction map; reverse edges are never legal.
const LEGAL_TRANSITIONS = Object.freeze({
  [TRANSFER_STATUS.PENDING_FUNDING]: new Set([
    TRANSFER_STATUS.FUNDED,
    TRANSFER_STATUS.CANCELLED,
    TRANSFER_STATUS.EXPIRED,
    TRANSFER_STATUS.RECONCILIATION_FAILED,
  ]),
  [TRANSFER_STATUS.FUNDED]: new Set([
    TRANSFER_STATUS.PAYOUT_PENDING,
    TRANSFER_STATUS.REFUNDED,
  ]),
  [TRANSFER_STATUS.PAYOUT_PENDING]: new Set([]),
  [TRANSFER_STATUS.CANCELLED]: new Set([]),
  [TRANSFER_STATUS.EXPIRED]: new Set([]),
  [TRANSFER_STATUS.RECONCILIATION_FAILED]: new Set([]),
});

const TERMINAL_STATUSES = new Set([
  TRANSFER_STATUS.PAYOUT_PENDING,
  TRANSFER_STATUS.CANCELLED,
  TRANSFER_STATUS.EXPIRED,
  TRANSFER_STATUS.RECONCILIATION_FAILED,
  TRANSFER_STATUS.PAID,
  TRANSFER_STATUS.PAYOUT_FAILED,
  TRANSFER_STATUS.REFUNDED,
]);

export function isKnownTransferStatus(value) {
  return Object.values(TRANSFER_STATUS).includes(String(value || ""));
}

export function isTerminalTransferStatus(value) {
  return TERMINAL_STATUSES.has(String(value || ""));
}

export function canTransitionTransfers(from, to) {
  const allowed = LEGAL_TRANSITIONS[String(from || "")];
  return Boolean(allowed && allowed.has(String(to || "")));
}

/**
 * Refuse an illegal transition with a 409 — the same status code the routes
 * use for wrong-state operations (create-payment-intent on a non-pending
 * transfer, cancel on a funded transfer, webhook reconcile on a terminal row).
 */
export function assertLegalTransferTransition(from, to) {
  if (!canTransitionTransfers(from, to)) {
    throw createHttpError(
      409,
      `A transfer in state "${String(from || "")}" cannot move to "${String(
        to || ""
      )}".`,
      { code: "illegal_transition" }
    );
  }
}

export default {
  TRANSFER_STATUS,
  isKnownTransferStatus,
  isTerminalTransferStatus,
  canTransitionTransfers,
  assertLegalTransferTransition,
};