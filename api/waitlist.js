// api/waitlist.js
//
// Captures demand for funding methods that are not live yet.
//
// The bank-account option is disabled because ACH settlement is not built, so
// a sender without a debit card previously hit a dead end at the payment step
// and left with nothing recorded. This turns that dead end into a signal: who
// wanted to pay by bank, for how much, to which corridor. That is the evidence
// worth taking into a payout-partner conversation.
//
// Identity follows the same device-id convention as transfer-records.js, and
// carries the same caveat: it separates browsers, it does not authenticate
// anyone. See that file for the reasoning.

import {
  sendJson,
  sendError,
  assertMethod,
  getJsonBody,
  createHttpError,
} from "../src/server/_lib/http.js";
import { getSupabaseAdminClient } from "../src/server/_lib/supabaseClient.js";

const SUPPORTED_METHODS = new Set(["bank", "card", "wallet"]);

// Deliberately permissive. Over-strict email regexes reject valid addresses,
// and the cost of a bad row in a demand list is close to zero.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MAX_LENGTH = 320;

function cleanString(value, max = 120) {
  return String(value ?? "").trim().slice(0, max);
}

function toAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export default async function handler(req, res) {
  try {
    assertMethod(req, res, ["POST"]);

    const body = getJsonBody(req);
    const email = cleanString(body.email, MAX_LENGTH).toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      throw createHttpError(400, "A valid email address is required.");
    }

    const method = cleanString(body.method, 20).toLowerCase() || "bank";

    if (!SUPPORTED_METHODS.has(method)) {
      throw createHttpError(400, `Unsupported funding method: ${method}`);
    }

    const supabase = getSupabaseAdminClient();

    // Say so plainly rather than thanking someone for joining a list that was
    // never written. A silent success here would quietly lose the signal this
    // route exists to collect.
    if (!supabase) {
      throw createHttpError(
        503,
        "The waitlist is not available right now. Please try again later.",
        { reason: "supabase_not_configured" }
      );
    }

    const row = {
      email,
      method,
      device_id: cleanString(req.headers?.["x-nexa-device-id"], 64) || null,
      send_amount: toAmount(body.sendAmount),
      send_currency: cleanString(body.sendCurrency, 8).toUpperCase() || null,
      receive_currency: cleanString(body.receiveCurrency, 8).toUpperCase() || null,
      destination: cleanString(body.destination, 160) || null,
    };

    const { error } = await supabase
      .from("funding_waitlist")
      .upsert(row, { onConflict: "email,method" });

    if (error) throw error;

    return sendJson(res, 200, { ok: true, email, method });
  } catch (error) {
    return sendError(res, error);
  }
}
