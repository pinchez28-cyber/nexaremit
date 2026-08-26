// src/server/_lib/audit.js
//
// Append-only record of decisions taken on the money path.
//
// The transfer_audit_logs table has existed since the first schema and nothing
// had ever written a row to it. AML record-keeping is a retention obligation,
// not a debugging aid, so these writes are treated as part of the transaction
// rather than as best-effort logging: see recordAuditEvent below.

import { getSupabaseAdminClient } from "./supabaseClient.js";

export function createAuditEvent({ action, user, status, metadata = {} }) {
  return {
    action: String(action || "unknown"),
    status: String(status || "unknown"),
    userId: String(user?.id || "anonymous"),
    metadata,
    createdAt: new Date().toISOString()
  };
}

/**
 * Write one audit row.
 *
 * Returns { persisted } rather than throwing, so the caller decides how much a
 * failed write matters. On the payment path the caller refuses the charge —
 * if the decision cannot be recorded, the money should not move. Elsewhere a
 * failed write is worth logging and continuing.
 *
 * transferId is stored as a plain reference. It deliberately carries no
 * foreign key to transfer_records: audit rows are written before a transfer
 * record exists, and an audit trail that disappears when its subject is
 * deleted is not an audit trail.
 */
export async function recordAuditEvent({
  action,
  user,
  status,
  transferId = null,
  metadata = {}
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    console.error(
      `[audit] NOT PERSISTED (supabase unconfigured): ${action} ${status} user=${user?.id || "anonymous"}`
    );
    return { persisted: false, reason: "supabase_not_configured" };
  }

  const row = {
    transfer_id: transferId ? String(transferId) : null,
    user_id: String(user?.id || "anonymous"),
    action: String(action || "unknown"),
    status: String(status || "unknown"),
    metadata
  };

  const { error } = await supabase.from("transfer_audit_logs").insert(row);

  if (error) {
    console.error(
      `[audit] write failed: ${action} ${status} user=${row.user_id}: ${error.message}`
    );
    return { persisted: false, reason: "write_failed", error: error.message };
  }

  return { persisted: true };
}

export default recordAuditEvent;
