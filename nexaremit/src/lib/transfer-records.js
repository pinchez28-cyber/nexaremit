import { calculateSandboxQuote } from "@/lib/transfer-pricing";
import { getPaymentIntentLabel, getPaymentMethodLabel } from "@/lib/payment-labels";

const STORAGE_KEY = "nexaremit_sandbox_transfers";

export const transferStatuses = {
  payment_authorized: "Payment authorized",
  compliance_review: "Compliance review",
  payout_pending: "Payout pending",
  sandbox_complete: "Sandbox complete",
  failed: "Failed",
  refunded: "Refunded"
};

const starterTransfers = [
  {
    id: "NX-DEMO-1001",
    createdAt: "2026-05-16T14:20:00.000Z",
    recipientName: "Daniel Mwangi",
    destination: "Kenya - Mobile money",
    sendAmount: 250,
    sendCurrency: "USD",
    receiveAmount: 32250,
    receiveCurrency: "KES",
    paymentMethod: "Debit/Credit Card",
    paymentIntentId: "pi_demo_sandbox",
    status: "payment_authorized",
    events: [
      { label: "Quote created", at: "2026-05-16T14:18:00.000Z" },
      { label: "Stripe test payment authorized", at: "2026-05-16T14:20:00.000Z" },
      { label: "Payout not sent in sandbox mode", at: "2026-05-16T14:20:01.000Z" }
    ]
  }
];

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
  const quote = calculateSandboxQuote(transferData);
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
      { label: hasPayment ? "Stripe test payment authorized" : "Sandbox record created", at: new Date().toISOString() },
      { label: "Payout not sent in sandbox mode", at: new Date().toISOString() }
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
    const response = await fetch("/api/transfer-records");
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
    const response = await fetch(`/api/transfer-records?id=${encodeURIComponent(id)}`);
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
    const response = await fetch("/api/transfer-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record })
    });
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
