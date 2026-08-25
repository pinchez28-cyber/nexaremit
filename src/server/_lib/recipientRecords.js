// src/server/_lib/recipientRecords.js
//
// Recipient storage, scoped to the customer who created them.
//
// Replaces the twelve hardcoded demo people that shipped in the browser
// bundle. Those were visible in production to anyone who opened the send
// flow — including, this week, three payout partners assessing whether this is
// a real product.
//
// Account numbers go in but never come back out in full. Every read path
// returns them masked, so a compromised session or a logged response body
// cannot leak a recipient's bank details.

import { getSupabaseAdminClient } from "./supabaseClient.js";
import { createHttpError } from "./http.js";

const ALLOWED_METHODS = new Set(["bank", "mobile_money", "wallet", "cash_pickup"]);
const ALLOWED_STATUSES = new Set(["active", "review_required", "blocked"]);

function maskIdentifier(value) {
  const raw = String(value || "").replace(/\s+/g, "");
  if (!raw) return "";
  if (raw.length <= 4) return `••${raw.slice(-2)}`;
  return `••••${raw.slice(-4)}`;
}

/**
 * Shape a database row for the browser.
 *
 * Field names match what the send flow already expects (corridor, limit,
 * receiveCurrency, risk) so safetyEngine keeps receiving the same object it
 * was written against.
 */
function toClientRecipient(row, { deliveryEstimates, payoutMethodLabels }) {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    countryCode: row.country_code,
    corridor: row.corridor,
    payoutMethod: row.payout_method,
    method: payoutMethodLabels[row.payout_method] || row.payout_method,
    receiveCurrency: row.receive_currency,
    accountName: row.account_name || "",
    accountMasked: maskIdentifier(row.account_identifier),
    limit: Number(row.transfer_limit || 0),
    deliveryEstimate: deliveryEstimates[row.payout_method] || "Same day",
    // safetyEngine reads this exact string when deciding whether a recipient
    // needs manual compliance review.
    risk: row.status === "active" ? "Verified" : "Review required",
    status: row.status,
    createdAt: row.created_at
  };
}

function requireSupabase() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw createHttpError(
      503,
      "Recipients are unavailable because Supabase is not configured on this deployment.",
      { reason: "supabase_not_configured" }
    );
  }
  return supabase;
}

export async function listRecipients(user, labels) {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from("recipients")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => toClientRecipient(row, labels));
}

export async function createRecipient(user, input, labels) {
  const supabase = requireSupabase();

  if (!ALLOWED_METHODS.has(input.payoutMethod)) {
    throw createHttpError(400, `Unsupported payout method: ${input.payoutMethod}`);
  }

  const status = ALLOWED_STATUSES.has(input.status) ? input.status : "active";

  const row = {
    user_id: user.id,
    name: input.name,
    country: input.country,
    country_code: input.countryCode,
    corridor: input.corridor,
    payout_method: input.payoutMethod,
    receive_currency: input.receiveCurrency,
    account_identifier: input.accountIdentifier || null,
    account_name: input.accountName || null,
    bank_code: input.bankCode || null,
    transfer_limit: input.transferLimit,
    status
  };

  const { data, error } = await supabase
    .from("recipients")
    .insert(row)
    .select()
    .single();

  if (error) throw error;

  return toClientRecipient(data, labels);
}

/**
 * Archive rather than delete.
 *
 * A recipient referenced by past transfers has to stay resolvable for the
 * audit trail and for receipts, so removal is a status change.
 */
export async function archiveRecipient(user, id) {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from("recipients")
    .update({ status: "deleted", updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw createHttpError(404, "Recipient not found.");

  return { id, archived: true };
}

/**
 * Fetch one recipient for server-side use.
 *
 * The payment route needs the real corridor and limit rather than whatever the
 * browser claims they are, so it re-reads the recipient here instead of
 * trusting the request body.
 */
export async function getRecipientForUser(user, id, labels) {
  const supabase = requireSupabase();

  const { data, error } = await supabase
    .from("recipients")
    .select("*")
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return toClientRecipient(data, labels);
}
