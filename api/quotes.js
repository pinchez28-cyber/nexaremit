// api/quotes.js
//
// P1-1: server-owned immutable quotes.
//
// POST   create a quote   { recipientId, sendCurrency, sendAmountMajor,
//                           receiveCurrency?, idempotencyKey? }
// GET    fetch a quote by id (owner only)
//
// Auth-first (requireAuthenticatedUser before anything). The quote snapshot is
// built server-side (fees/rate/amounts), stored in `quotes`, and only its
// status ever mutates (issued -> consumed | expired | cancelled). The browser
// never computes the money; it only supplies ids + validated choices.

import {
  sendJson,
  sendError,
  requireMethod,
  getJsonBody,
} from "../src/server/_lib/http.js";
import { requireAuthenticatedUser } from "../src/server/_lib/requireUser.js";
import { createHttpError } from "../src/server/_lib/http.js";
import { assertSandboxOverridesAllowed } from "../src/server/_lib/sandboxGuard.js";
import { getSupabaseAdminClient } from "../src/server/_lib/supabaseClient.js";
import {
  issueQuote,
  getQuoteForUser,
} from "../src/server/_lib/quoteService.js";
import { runPretransferGates } from "../src/server/_lib/transferGates.js";

/**
 * Quote-store adapter over the real Supabase client. The service holds the
 * business rules; this thin adapter only turns service calls into rows.
 */
function makeStore() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  return {
    async getQuoteById(id) {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", String(id))
        .maybeSingle();
      return { data, error };
    },
    async getQuoteByIdempotencyKey(key, userId) {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("idempotency_key", String(key))
        .eq("user_id", String(userId))
        .maybeSingle();
      return { data, error };
    },
    async createQuote(row) {
      const { data, error } = await supabase
        .from("quotes")
        .insert(row)
        .select("*")
        .single();
      return { data, error };
    },
    async consumeQuote({ id, userId, nowIso }) {
      const { data, error } = await supabase
        .from("quotes")
        .update({ status: "consumed", consumed_at: nowIso })
        .eq("id", String(id))
        .eq("user_id", String(userId))
        .eq("status", "issued")
        .gt("expires_at", nowIso)
        .select("*")
        .maybeSingle();
      return { data, error };
    },
    async cancelQuote({ id, userId, nowIso }) {
      const { data, error } = await supabase
        .from("quotes")
        .update({ status: "cancelled" })
        .eq("id", String(id))
        .eq("user_id", String(userId))
        .eq("status", "issued")
        .select("*")
        .maybeSingle();
      return { data, error };
    },
    async audit({ action, user, status, transferId = null, metadata = {} }) {
      // Best-effort on this route; the money path itself enforces audit
      // persistence (transferService throws 503 when unpersisted).
      if (!supabase) return { persisted: false, reason: "supabase_not_configured" };
      const { error } = await supabase.from("transfer_audit_logs").insert({
        transfer_id: transferId,
        user_id: String(user?.id || "anonymous"),
        action,
        status,
        metadata,
      });
      if (error) {
        console.error(`[quotes] audit write failed: ${error.message}`);
        return { persisted: false, reason: "write_failed" };
      }
      return { persisted: true };
    },
  };
}

export default async function handler(req, res) {
  try {
    // Sandbox overrides must be mutually exclusive with live keys /
    // production mode BEFORE any quote work (P0-3 fail-closed guard).
    assertSandboxOverridesAllowed();

    if (!requireMethod(req, res, ["GET", "POST"])) return;

    // AUTH FIRST (P0-1): resolve the caller before any body parsing, gate
    // check, pricing or storage. Unauthenticated callers get 401 and never
    // learn anything about quotes.
    const user = await requireAuthenticatedUser(req);

    const store = makeStore();

    if (req.method === "GET") {
      const quoteId = String(req.query?.id || "").trim();
      if (!quoteId) {
        return sendJson(res, 400, {
          ok: false,
          error: "A quote id is required.",
        });
      }
      const quote = await getQuoteForUser({ user, quoteId, store });
      return sendJson(res, 200, { ok: true, quote });
    }

    const body = getJsonBody(req);
    const result = await issueQuote({
      user,
      body,
      store,
      gates: (args) => runPretransferGates({ user, args }),
    });

    return sendJson(res, result.replayed ? 200 : 201, {
      ok: true,
      quote: result.quote,
      replayed: result.replayed,
    });
  } catch (error) {
    return sendError(res, error);
  }
}