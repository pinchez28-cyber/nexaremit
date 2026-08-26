// src/server/_lib/payoutRecords.js
//
// What is owed to whom, and how far along paying it has got.
//
// Written when funding is confirmed, not when a provider accepts the payout —
// so a transfer funded today is recorded as owed even though nothing can
// deliver it yet. The awaiting_provider rows are the backlog that a signed
// partner works through.

import { getSupabaseAdminClient } from "./supabaseClient.js";
import { PAYOUT_STATUS } from "./payoutProvider.js";

function requireSupabase() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("[payout] Supabase is not configured; payouts cannot be recorded.");
  }
  return supabase;
}

/**
 * Record a funded transfer as owed.
 *
 * Idempotent on transfer_id: Stripe retries webhooks, and a retry must not
 * create a second obligation to pay the same person twice. The unique
 * constraint is the guard; this turns a duplicate into a no-op that returns
 * the existing row.
 */
export async function recordFundedPayout(input) {
  const supabase = requireSupabase();

  const row = {
    transfer_id: String(input.transferId),
    user_id: String(input.userId || ""),
    recipient_id: input.recipientId || null,
    recipient_name: String(input.recipientName || "Unknown recipient"),
    corridor: String(input.corridor || ""),
    payout_method: String(input.payoutMethod || ""),
    destination_masked: input.destinationMasked || null,
    send_amount_minor: Math.round(Number(input.sendAmountMinor) || 0),
    send_currency: String(input.sendCurrency || "USD").toUpperCase(),
    receive_amount_minor: Math.round(Number(input.receiveAmountMinor) || 0),
    receive_currency: String(input.receiveCurrency || "").toUpperCase(),
    quoted_rate: Number(input.quotedRate) || null,
    status: PAYOUT_STATUS.AWAITING_PROVIDER,
    funded_at: new Date().toISOString(),
    metadata: input.metadata || {},
  };

  const { data, error } = await supabase
    .from("payouts")
    .upsert(row, { onConflict: "transfer_id", ignoreDuplicates: true })
    .select()
    .maybeSingle();

  if (error) throw error;

  // ignoreDuplicates returns no row when one already existed. That is the
  // expected path on a webhook retry, not a failure.
  if (!data) {
    const existing = await supabase
      .from("payouts")
      .select("*")
      .eq("transfer_id", row.transfer_id)
      .maybeSingle();
    return { payout: existing.data, created: false };
  }

  return { payout: data, created: true };
}

export async function markPayoutSubmitted(transferId, { provider, providerReference }) {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from("payouts")
    .update({
      status: PAYOUT_STATUS.PENDING,
      provider,
      provider_reference: providerReference,
      updated_at: new Date().toISOString(),
    })
    .eq("transfer_id", String(transferId))
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function markPayoutResult(transferId, { status, failureReason }) {
  const supabase = requireSupabase();

  const patch = {
    status,
    failure_reason: failureReason || null,
    updated_at: new Date().toISOString(),
  };

  if (status === PAYOUT_STATUS.PAID) patch.paid_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("payouts")
    .update(patch)
    .eq("transfer_id", String(transferId))
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * The backlog: funded transfers with nothing able to deliver them.
 *
 * This is the number worth watching before launch, and the queue to drain the
 * day a partner goes live.
 */
export async function listAwaitingProvider({ limit = 100 } = {}) {
  const supabase = requireSupabase();

  const { data, error, count } = await supabase
    .from("payouts")
    .select("*", { count: "exact" })
    .eq("status", PAYOUT_STATUS.AWAITING_PROVIDER)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return { payouts: data || [], total: count ?? (data || []).length };
}

export async function getPayoutForTransfer(transferId) {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from("payouts")
    .select("*")
    .eq("transfer_id", String(transferId))
    .maybeSingle();

  if (error) throw error;
  return data;
}
