// src/lib/transfer-records.js
//
// Batch 2 (UI honesty): this module is now READ-ONLY and server-owned.
//
// Previously it crafted local "sandbox" transfer records — inventing an id
// (NX-...), a status (payment_authorized / sandbox_complete), a timeline, and
// then persisted them to localStorage and POSTed them to /api/transfer-records.
// That fabricated a successful transfer from a locally-priced quote, so a
// sender could see "Payment authorized" and a receipt with no server transfer
// behind it, and the record vanished with site data.
//
// Now: no local record is created, no status is invented, and nothing is
// written to localStorage. Transfer status is owned by the server (/api/transfers
// and /api/transfers/:id?action=receipt). Reads fail closed to empty arrays —
// never to a fabricated local history. The honest terminal state is
// "Funding received — payout pending" (never success/paid).

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const DEVICE_KEY = "nexaremit:device-id";

// Scopes server-side reads to this browser. There is no login yet, so this is
// deliberately not a security boundary — the server prefers the access token.
function getDeviceId() {
  if (typeof window === "undefined" || !window.localStorage) return "";
  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

async function getAccessToken() {
  const client = getSupabaseBrowserClient();
  if (!client) return "";
  try {
    const { data } = await client.auth.getSession();
    return data?.session?.access_token || "";
  } catch {
    return "";
  }
}

async function recordsRequestInit(extra = {}) {
  const deviceId = getDeviceId();
  const accessToken = await getAccessToken();
  return {
    ...extra,
    headers: {
      ...(extra.headers || {}),
      "x-nexa-device-id": deviceId,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  };
}

// Server-owned status vocabulary. payout_pending is the honest terminal state
// for Batch 2: funding received, recipient owed, no payout provider yet.
// There is deliberately NO success/paid/completed label here.
export const transferStatuses = {
  pending_funding: "Funding authorized — awaiting confirmation",
  funded: "Funding received — payout pending",
  payout_pending: "Funding received — payout pending",
  cancelled: "Cancelled",
  expired: "Expired",
  reconciliation_failed: "Reconciliation failed — review required",
  payout_unavailable: "Not delivered — no payout provider",
  failed: "Failed",
  refunded: "Refunded"
};

// No seeded history. This previously injected an invented completed transfer
// into every new browser's local storage.
const EMPTY_RECORDS = [];

// The local record path is GONE. getTransferRecords returns nothing locally —
// history lives only on the server.
export function getTransferRecords() {
  return EMPTY_RECORDS;
}

export function getTransferRecord() {
  return null;
}

// Server-owned read: fetch transfer history from /api/transfers (the server
// — never a local store). Fails closed to an empty list.
export async function fetchTransferRecords() {
  try {
    const response = await fetch("/api/transfers", await recordsRequestInit());
    if (!response.ok) return EMPTY_RECORDS;
    const result = await response.json();
    const transfers = Array.isArray(result?.transfers) ? result.transfers : [];
    return transfers.map((transfer) => toTransferRecord(transfer));
  } catch {
    return EMPTY_RECORDS;
  }
}

// Server-owned read: fetch one transfer's receipt from
// /api/transfers/:id?action=receipt (server-computed from the stored
// quote/transfer — never client math). Fails closed to null.
export async function fetchTransferRecord(id) {
  try {
    const response = await fetch(
      `/api/transfers/${encodeURIComponent(id)}?action=receipt`,
      await recordsRequestInit()
    );
    if (!response.ok) return null;
    const result = await response.json();
    if (!result?.receipt) return null;
    return toRecordFromReceipt(result.receipt, id);
  } catch {
    return null;
  }
}

// Map a server-owned transfer (toClientTransfer shape) to the display shape
// the history/receipt pages render. All money/status is server-owned.
function toTransferRecord(transfer) {
  const quote = transfer?.metadata?.quote || {};
  return {
    id: transfer.id,
    createdAt: transfer.createdAt,
    recipientName: transfer.recipientName || "Recipient",
    destination: transfer.destination || "",
    sendAmount: Number(transfer.sendAmountMajor || 0),
    sendCurrency: transfer.sendCurrency || "USD",
    receiveAmount: Number(transfer.receiveAmountMajor || 0),
    receiveCurrency: transfer.receiveCurrency || "",
    paymentMethod: transfer.paymentMethod || "card",
    paymentIntentId: transfer.paymentIntentId || null,
    status: transfer.status || "pending_funding",
    totalChargeMinor: transfer.expectedChargeMinor || quote.totalChargeMinor || 0,
    events: [
      { label: "Transfer created", at: transfer.createdAt },
      ...(transfer.fundedAt
        ? [{ label: "Funding received — payout pending", at: transfer.fundedAt }]
        : []),
    ],
  };
}

function toRecordFromReceipt(receipt, id) {
  return {
    id: receipt.transferId || id,
    createdAt: receipt.createdAt,
    recipientName: receipt.recipientName || "Recipient",
    destination: receipt.destination || "",
    sendAmount: Number(receipt.sendAmountMajor || 0),
    sendCurrency: receipt.sendCurrency || "USD",
    receiveAmount: Number(receipt.receiveAmountMajor || 0),
    receiveCurrency: receipt.receiveCurrency || "",
    paymentMethod: receipt.paymentMethod || "card",
    paymentIntentId: receipt.paymentIntentId || null,
    status: receipt.status || "pending_funding",
    totalChargeMinor: Number(receipt.totalChargeMinor || 0),
    events: [
      { label: "Transfer created", at: receipt.createdAt },
      ...(receipt.fundedAt
        ? [{ label: "Funding received — payout pending", at: receipt.fundedAt }]
        : []),
    ],
  };
}

export function formatTransferDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateValue));
}