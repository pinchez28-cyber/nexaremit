import crypto from "node:crypto";
import { getSupabaseAdminClient } from "./supabaseClient.js";

const CLEAR_STATUSES = new Set(["clear", "approved", "passed"]);

export function normalizeScreeningStatus(status) {
  const normalized = String(status || "required").toLowerCase();
  if (CLEAR_STATUSES.has(normalized)) return "clear";
  if (["manual_review", "needs_review", "possible_match", "review"].includes(normalized)) return "manual_review";
  if (["blocked", "match", "confirmed_match", "denied"].includes(normalized)) return "blocked";
  return normalized;
}

export function createScreeningSubject({ user, recipient }) {
  const subject = {
    userId: user?.id || "sandbox-user",
    senderEmail: user?.email || "",
    recipientName: recipient?.name || "",
    recipientCountry: recipient?.country || recipient?.destination || "",
    corridor: recipient?.corridor || "",
    payoutMethod: recipient?.method || ""
  };

  return subject;
}

export function createScreeningId(subject) {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(subject))
    .digest("hex")
    .slice(0, 24);

  return `screen_${hash}`;
}

function toScreeningRow(record) {
  return {
    id: record.id,
    user_id: record.userId,
    provider: record.provider,
    status: normalizeScreeningStatus(record.status),
    subject: record.subject || {},
    metadata: record.metadata || {},
    updated_at: new Date().toISOString()
  };
}

function fromScreeningRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    provider: row.provider,
    status: normalizeScreeningStatus(row.status),
    subject: row.subject || {},
    metadata: row.metadata || {},
    updatedAt: row.updated_at,
    createdAt: row.created_at
  };
}

export async function upsertSanctionsRecord(record) {
  const supabase = getSupabaseAdminClient();
  const normalized = {
    id: record.id,
    userId: record.userId,
    provider: record.provider || process.env.SANCTIONS_PROVIDER || "sandbox-screening",
    status: normalizeScreeningStatus(record.status),
    subject: record.subject || {},
    metadata: record.metadata || {}
  };

  if (!supabase) return { configured: false, record: normalized };

  const { data, error } = await supabase
    .from("sanctions_screenings")
    .upsert(toScreeningRow(normalized), { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return { configured: true, record: fromScreeningRow(data) };
}

export async function getSanctionsRecord(screeningId) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { configured: false, record: null };

  const { data, error } = await supabase
    .from("sanctions_screenings")
    .select("*")
    .eq("id", screeningId)
    .maybeSingle();

  if (error) throw error;
  return { configured: true, record: data ? fromScreeningRow(data) : null };
}

export async function screenSanctionsSubject({ user, recipient }) {
  const subject = createScreeningSubject({ user, recipient });
  const id = createScreeningId(subject);
  const stored = await getSanctionsRecord(id);

  if (stored.record) return stored;

  const requiresReview = recipient?.risk === "Review required";
  const status = requiresReview ? "manual_review" : "clear";

  return upsertSanctionsRecord({
    id,
    userId: subject.userId,
    provider: process.env.SANCTIONS_PROVIDER || "sandbox-screening",
    status,
    subject,
    metadata: {
      mode: process.env.TRANSFER_MODE || "sandbox",
      reason: requiresReview ? "Recipient marked for review in sandbox data." : "Sandbox screening returned no match."
    }
  });
}
