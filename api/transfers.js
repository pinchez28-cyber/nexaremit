// api/transfers.js
//
// P1-2: server-owned transfers.
//
//   POST  /api/transfers             { quoteId, idempotencyKey } -> create
//   GET   /api/transfers/:id         server-owned status (owner only)
//   GET   /api/transfers             list (owner only)
//   POST  /api/transfers/:id/cancel  cancel only while pending_funding
//
// Auth-first (requireAuthenticatedUser before anything). Every amount, fee,
// rate and status is read from the stored quote/transfer — the request body
// carries ids + an idempotency key only. Fail-closed: with no Supabase, every
// mutation returns 503; there is no silent local fallback on the money path.
//
// :id routes are served by this single function because Vercel's Hobby plan
// caps the number of serverless functions; `/api/transfers/:id/cancel` is
// matched by the `:id` path segment with an internal action dispatch.

import {
  sendJson,
  sendError,
  createHttpError,
  getJsonBody,
} from "../src/server/_lib/http.js";
import { requireAuthenticatedUser } from "../src/server/_lib/requireUser.js";
import { assertSandboxOverridesAllowed } from "../src/server/_lib/sandboxGuard.js";
import { getSupabaseAdminClient } from "../src/server/_lib/supabaseClient.js";
import {
  createTransfer,
  getTransferForUser,
  listTransfersForUser,
  cancelTransfer,
  getTransferReceiptForUser,
} from "../src/server/_lib/transferService.js";
import { runPretransferGates } from "../src/server/_lib/transferGates.js";

const ID_RE = /^[A-Za-z0-9_-]+$/;

function parseTransferId(value) {
  const id = String(value || "").trim();
  if (!id || !ID_RE.test(id)) {
    throw createHttpError(404, "Transfer not found.", { code: "not_found" });
  }
  return id;
}

/**
 * Transfer-store adapter over the real Supabase client. Business rules live in
 * transferService; this adapter only turns service calls into rows.
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
    async getByIdempotencyKey({ key, userId }) {
      const { data, error } = await supabase
        .from("transfer_records")
        .select("*")
        .eq("idempotency_key", String(key))
        .eq("user_id", String(userId))
        .maybeSingle();
      return { data, error };
    },
    async createTransfer(row) {
      const { data, error } = await supabase
        .from("transfer_records")
        .insert(row)
        .select("*")
        .single();
      return { data, error };
    },
    async getTransferById(id) {
      const { data, error } = await supabase
        .from("transfer_records")
        .select("*")
        .eq("id", String(id))
        .maybeSingle();
      return { data, error };
    },
    async listTransfers({ userId, limit }) {
      const { data, error } = await supabase
        .from("transfer_records")
        .select("*")
        .eq("user_id", String(userId))
        .order("created_at", { ascending: false })
        .limit(limit || 50);
      return { data, error };
    },
    async updateTransferStatus({ id, userId, fromStatus, toStatus, patch }) {
      const { data, error } = await supabase
        .from("transfer_records")
        .update({ status: toStatus, ...patch })
        .eq("id", String(id))
        .eq("user_id", String(userId))
        .eq("status", fromStatus)
        .select("*")
        .maybeSingle();
      return { data, error };
    },
    async audit({ action, user, status, transferId = null, metadata = {} }) {
      if (!supabase) return { persisted: false, reason: "supabase_not_configured" };
      const { error } = await supabase.from("transfer_audit_logs").insert({
        transfer_id: transferId,
        user_id: String(user?.id || "anonymous"),
        action,
        status,
        metadata,
      });
      if (error) {
        console.error(`[transfers] audit write failed: ${error.message}`);
        return { persisted: false, reason: "write_failed" };
      }
      return { persisted: true };
    },
  };
}

export default async function handler(req, res) {
  try {
    assertSandboxOverridesAllowed();

    const method = String(req.method || "GET").toUpperCase();
    if (!["GET", "POST"].includes(method)) {
      res.setHeader("Allow", "GET, POST");
      return sendJson(res, 405, {
        ok: false,
        error: "Method not allowed.",
      });
    }

    // AUTH FIRST: no body parsing, no gates, no storage before the caller is
    // resolved. Unauthenticated callers get 401 and never learn anything.
    const user = await requireAuthenticatedUser(req);

    const store = makeStore();

    // Route dispatch: /api/transfers/:id/cancel via the `id` + `action` query
    // params (the SPA calls /api/transfers/:id/cancel as a POST body action
    // when it cannot express path segments; both arrive here as one function).
    const pathId = String(req.query?.id || req.params?.id || "").trim();
    const pathAction = String(req.query?.action || req.params?.action || "").trim();
    const body =
      method === "POST" && !pathAction ? getJsonBody(req) : {};

    if (method === "GET" && pathId) {
      // P0-6: /api/transfers/:id?action=receipt returns the SERVER-computed
      // receipt (derived from the stored quote/transfer — never client math).
      // The receipt total equals the charged total (exact minor equality).
      const action = String(req.query?.action || "").trim();
      if (action === "receipt") {
        const receipt = await getTransferReceiptForUser({
          user,
          transferId: parseTransferId(pathId),
          store,
        });
        return sendJson(res, 200, { ok: true, receipt });
      }

      const transfer = await getTransferForUser({
        user,
        transferId: parseTransferId(pathId),
        store,
      });
      return sendJson(res, 200, { ok: true, transfer });
    }

    if (method === "GET") {
      const transfers = await listTransfersForUser({ user, store });
      return sendJson(res, 200, { ok: true, transfers });
    }

    // POST with an action = /api/transfers/:id/cancel (or /api/transfers/cancel
    // with { transferId } in the body).
    const action = pathAction || String(body.action || "").trim();
    if (action === "cancel") {
      const cancelId = pathId || String(body.transferId || "").trim();
      if (!cancelId) {
        throw createHttpError(422, "transferId is required.", {
          code: "transfer_id_required",
        });
      }
      const transfer = await cancelTransfer({
        user,
        transferId: parseTransferId(cancelId),
        store,
      });
      await store.audit({
        action: "transfer.cancelled",
        user,
        status: "cancelled",
        transferId: transfer.id,
        metadata: { reason: "user_requested" },
      });
      return sendJson(res, 200, { ok: true, transfer });
    }

    // POST without an action = create.
    const result = await createTransfer({
      user,
      body,
      store,
      gates: (args) => runPretransferGates({ user, args }),
    });

    return sendJson(res, result.replayed ? 200 : 201, {
      ok: true,
      transfer: result.transfer,
      replayed: result.replayed,
    });
  } catch (error) {
    return sendError(res, error);
  }
}