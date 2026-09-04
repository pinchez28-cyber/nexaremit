// src/server/_lib/velocity.js
//
// Per-customer transfer velocity.
//
// The only spending control until now was a per-recipient cap, which a sender
// could clear repeatedly, or spread across several recipients, without ever
// tripping anything. Structuring transfers to stay under a single-transaction
// limit is the oldest pattern in money laundering, and per-transaction limits
// alone do not see it.
//
// Usage is counted from the transfer.safety_check rows that
// create-payment-intent writes before authorising a charge. Those are the only
// audit rows guaranteed to exist: the route refuses the charge outright if one
// cannot be written, whereas the post-charge payment_intent.created row is
// best-effort. Counting the best-effort row would mean a single failed write
// silently granted that customer unlimited headroom from then on.
//
// The trade is that a transfer which passes checks and then fails at Stripe
// still consumes headroom until the window rolls forward. For a spending
// control, over-counting is the safe direction to be wrong in.

import { getSupabaseAdminClient } from "./supabaseClient.js";
import { minorToMajor } from "../../lib/money.js";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Deliberately modest. These are starting caps for a product that has never
// moved money; a payout partner will impose their own, and those should
// replace these rather than sit alongside them.
export const DEFAULT_VELOCITY_LIMITS = Object.freeze({
  dailyAmount: 2500,
  monthlyAmount: 10000,
  dailyCount: 10,
});

function readPositiveNumber(envSource, name, fallback) {
  const raw = Number(envSource?.[name]);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

export function getVelocityLimits(envSource = process.env) {
  return Object.freeze({
    dailyAmount: readPositiveNumber(
      envSource,
      "NEXA_DAILY_LIMIT",
      DEFAULT_VELOCITY_LIMITS.dailyAmount
    ),
    monthlyAmount: readPositiveNumber(
      envSource,
      "NEXA_MONTHLY_LIMIT",
      DEFAULT_VELOCITY_LIMITS.monthlyAmount
    ),
    dailyCount: readPositiveNumber(
      envSource,
      "NEXA_DAILY_COUNT_LIMIT",
      DEFAULT_VELOCITY_LIMITS.dailyCount
    ),
  });
}

/**
 * Sum what this customer has already committed in the trailing windows.
 *
 * Amounts are compared only against transfers in the same currency. Summing
 * mixed currencies would produce a meaningless total, and converting them here
 * would mean applying an exchange rate to a compliance decision — better to
 * scope the window than to guess.
 *
 * Returns amounts in major units to match safetyEngine, which compares against
 * recipient limits expressed the same way.
 */
export async function getVelocityUsage(user, { currency, now = Date.now() } = {}, deps = {}) {
  // Dependency injection keeps this pure-testable: tests pass a fake Supabase
  // client here instead of monkey-patching module exports (ESM live bindings
  // cannot be patched) and without any network access.
  const getSupabase = deps.getSupabaseAdminClient || getSupabaseAdminClient;
  const supabase = getSupabase();

  if (!supabase) {
    return { available: false, dailyAmount: 0, monthlyAmount: 0, dailyCount: 0 };
  }

  const since = new Date(now - 30 * DAY_MS).toISOString();

  const { data, error } = await supabase
    .from("transfer_audit_logs")
    .select("metadata, created_at")
    .eq("user_id", user.id)
    .eq("action", "transfer.safety_check")
    .eq("status", "passed")
    .gte("created_at", since);

  if (error) {
    // Fail loudly rather than silently reporting zero usage, which would let
    // every limit through on a database hiccup.
    console.error(`[velocity] usage query failed: ${error.message}`);
    return { available: false, dailyAmount: 0, monthlyAmount: 0, dailyCount: 0 };
  }

  const dayCutoff = now - DAY_MS;
  const wanted = String(currency || "").toLowerCase();

  let dailyAmount = 0;
  let monthlyAmount = 0;
  let dailyCount = 0;

  for (const row of data || []) {
    const rowCurrency = String(row.metadata?.currency || "").toLowerCase();
    if (wanted && rowCurrency && rowCurrency !== wanted) continue;

    const major = minorToMajor(row.metadata?.amountMinor, row.metadata?.currency);
    const at = new Date(row.created_at).getTime();

    monthlyAmount += major;

    if (at >= dayCutoff) {
      dailyAmount += major;
      dailyCount += 1;
    }
  }

  return {
    available: true,
    dailyAmount: Math.round(dailyAmount * 100) / 100,
    monthlyAmount: Math.round(monthlyAmount * 100) / 100,
    dailyCount,
  };
}
