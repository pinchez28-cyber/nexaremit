import { calculateSandboxQuote } from "@/lib/transfer-pricing";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getPaymentIntentLabel, getPaymentMethodLabel } from "@/lib/payment-labels";

const STORAGE_KEY = "nexaremit_sandbox_transfers";
const DEVICE_KEY = "nexaremit:device-id";

// Scopes server-side records to this browser. There is no login yet, so this
// is the only thing separating one visitor's history from another's — it is
// deliberately not a security boundary. See api/transfer-records.js.
function getDeviceId() {
  if (!canUseStorage()) return "";

  let id = window.localStorage.getItem(DEVICE_KEY);

  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
            (
              c ^
              (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
            ).toString(16)
          );
    window.localStorage.setItem(DEVICE_KEY, id);
  }

  return id;
}

// Read straight from the live session rather than through React, because this
// module is imported by plain functions as well as components.
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

// The device id is still sent so a sender who has not signed in yet keeps the
// history they built before. Once signed in the server prefers the token and
// ignores it.
async function recordsRequestInit(extra = {}) {
  const deviceId = getDeviceId();
  const accessToken = await getAccessToken();

  return {
    ...extra,
    headers: {
      ...(extra.headers || {}),
      "x-nexa-device-id": deviceId,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    }
  };
}

export const transferStatuses = {
  payment_authorized: "Payment authorized",
  compliance_review: "Compliance review",
  payout_pending: "Payout pending",
  payout_unavailable: "Not delivered - no payout provider",
  sandbox_complete: "Sandbox complete",
  failed: "Failed",
  refunded: "Refunded"
};

// No seeded history. This previously injected an invented completed transfer
// into every new browser's local storage, which then appeared in the dashboard
// and history as though the sender had used the product before.
const starterTransfers = [];

function canUseStorage() {
  return typeof window !== "undefined" && window.localStorage;
}

function storeTransferRecords(records) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 50)));
}

export function getTransferRecords() {
  if (!canUseStorage()) return starterTransfers;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(starterTransfers));
    return starterTransfers;
  }
  try {
    return JSON.parse(stored);
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(starterTransfers));
    return starterTransfers;
  }
}

export function getTransferRecord(id) {
  return getTransferRecords().find((record) => record.id === id);
}

export function buildTransferRecord(transferData) {
  // Use the quote the sender actually saw and accepted. Recomputing it here
  // silently dropped the live rate - a $200 transfer to India was quoted at
  // 95.43 and recorded at 83.20, understating the recipient amount by 13%.
  const quote = transferData.quote || calculateSandboxQuote(transferData);
  const paymentIntentId = getPaymentIntentLabel(transferData.paymentMethod);
  const hasPayment = Boolean(paymentIntentId);
  return {
    id: `NX-${Date.now().toString().slice(-8)}`,
    createdAt: new Date().toISOString(),
    recipientName: transferData.recipient?.name || "Unknown receiver",
    destination: `${transferData.recipient?.country || "Unknown"} - ${transferData.recipient?.method || "Payout"}`,
    sendAmount: Number(transferData.amount || 0),
    sendCurrency: transferData.currency,
    receiveAmount: quote.receivedAmount,
    receiveCurrency: quote.receiveCurrency,
    paymentMethod: getPaymentMethodLabel(transferData.paymentMethod),
    paymentIntentId,
    status: hasPayment ? "payment_authorized" : "sandbox_complete",
    events: [
      { label: "Quote created", at: new Date(Date.now() - 90_000).toISOString() },
      { label: hasPayment ? "Card authorized in Stripe test mode" : "Transfer recorded", at: new Date().toISOString() },
      { label: "Not delivered - no payout provider is connected", at: new Date().toISOString() }
    ]
  };
}

export function saveTransferRecord(transferDataOrRecord) {
  const record = transferDataOrRecord?.recipient
    ? buildTransferRecord(transferDataOrRecord)
    : transferDataOrRecord;

  if (!record) return null;
  if (canUseStorage()) {
    const records = getTransferRecords();
    const withoutDuplicate = records.filter((item) => item.id !== record.id);
    storeTransferRecords([record, ...withoutDuplicate]);
  }

  return record;
}

export async function fetchTransferRecords() {
  const localRecords = getTransferRecords();
  try {
    const response = await fetch("/api/transfer-records", await recordsRequestInit());
    if (!response.ok) throw new Error("Could not load transfer records");
    const result = await response.json();
    if (!result.configured) return localRecords;
    storeTransferRecords(result.records);
    return result.records;
  } catch {
    return localRecords;
  }
}

export async function fetchTransferRecord(id) {
  const localRecord = getTransferRecord(id);
  try {
    const response = await fetch(
      `/api/transfer-records?id=${encodeURIComponent(id)}`,
      await recordsRequestInit()
    );
    if (!response.ok) throw new Error("Could not load transfer receipt");
    const result = await response.json();
    if (!result.configured) return localRecord;
    if (result.record) saveTransferRecord(result.record);
    return result.record || localRecord;
  } catch {
    return localRecord;
  }
}

export async function persistTransferRecord(transferDataOrRecord) {
  const record = transferDataOrRecord?.recipient
    ? buildTransferRecord(transferDataOrRecord)
    : transferDataOrRecord;
  saveTransferRecord(record);

  try {
    const response = await fetch(
      "/api/transfer-records",
      await recordsRequestInit({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record })
      })
    );
    if (!response.ok) throw new Error("Could not save transfer record");
    const result = await response.json();
    const savedRecord = result.record || record;
    saveTransferRecord(savedRecord);
    return savedRecord;
  } catch {
    return record;
  }
}

export function formatTransferDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(dateValue));
}
