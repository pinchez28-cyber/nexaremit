import { getSupabaseAdminClient } from "./supabaseClient.js";

const MAX_RECORDS = 50;

function nowIso() {
  return new Date().toISOString();
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeEvent(event) {
  return {
    label: String(event?.label || "Transfer event"),
    at: event?.at || nowIso()
  };
}

export function normalizeTransferRecord(input, user) {
  const record = input?.record || input || {};
  const createdAt = record.createdAt || nowIso();
  const paymentIntentId = record.paymentIntentId || "";

  return {
    id: String(record.id || `NX-${Date.now().toString().slice(-8)}`),
    userId: String(user?.id || record.userId || "sandbox-user"),
    createdAt,
    recipientName: String(record.recipientName || "Unknown receiver"),
    destination: String(record.destination || "Unknown payout destination"),
    sendAmount: toNumber(record.sendAmount),
    sendCurrency: String(record.sendCurrency || "USD").toUpperCase(),
    receiveAmount: toNumber(record.receiveAmount),
    receiveCurrency: String(record.receiveCurrency || "NGN").toUpperCase(),
    paymentMethod: String(record.paymentMethod || "Not selected"),
    paymentIntentId,
    status: String(record.status || (paymentIntentId ? "payment_authorized" : "sandbox_complete")),
    events: Array.isArray(record.events) && record.events.length
      ? record.events.map(normalizeEvent)
      : [
          { label: "Transfer record created", at: createdAt },
          { label: "Payout not sent in sandbox mode", at: createdAt }
        ]
  };
}

function toTransferRow(record) {
  return {
    id: record.id,
    user_id: record.userId,
    recipient_name: record.recipientName,
    destination: record.destination,
    send_amount: record.sendAmount,
    send_currency: record.sendCurrency,
    receive_amount: record.receiveAmount,
    receive_currency: record.receiveCurrency,
    payment_method: record.paymentMethod,
    payment_intent_id: record.paymentIntentId || null,
    status: record.status,
    metadata: { events: record.events },
    created_at: record.createdAt
  };
}

function fromTransferRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    recipientName: row.recipient_name,
    destination: row.destination,
    sendAmount: toNumber(row.send_amount),
    sendCurrency: row.send_currency,
    receiveAmount: toNumber(row.receive_amount),
    receiveCurrency: row.receive_currency,
    paymentMethod: row.payment_method,
    paymentIntentId: row.payment_intent_id || "",
    status: row.status,
    events: Array.isArray(row.metadata?.events) ? row.metadata.events.map(normalizeEvent) : []
  };
}

export async function listTransferRecords(user) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { configured: false, records: [] };

  const { data, error } = await supabase
    .from("transfer_records")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(MAX_RECORDS);

  if (error) throw error;
  return { configured: true, records: data.map(fromTransferRow) };
}

export async function getTransferRecordById(user, id) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { configured: false, record: null };

  const { data, error } = await supabase
    .from("transfer_records")
    .select("*")
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return { configured: true, record: data ? fromTransferRow(data) : null };
}

export async function saveTransferRecord(user, input) {
  const record = normalizeTransferRecord(input, user);
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { configured: false, record };

  const { data, error } = await supabase
    .from("transfer_records")
    .upsert(toTransferRow(record), { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return { configured: true, record: fromTransferRow(data) };
}
