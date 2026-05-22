import { getSupabaseAdminClient } from "./supabaseClient.js";
import { isMissingTableError } from "./supabaseErrors.js";

const REVIEW_STATUSES = ["required", "pending", "needs_review", "manual_review", "blocked", "declined"];

function normalizeItem({ id, type, status, userId, title, description, createdAt, metadata }) {
  return {
    id,
    type,
    status,
    userId,
    title,
    description,
    createdAt,
    metadata: metadata || {}
  };
}

async function fetchTableReviews(supabase, table, select, mapRow) {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .in("status", REVIEW_STATUSES)
    .order("created_at", { ascending: false })
    .limit(25);

  if (isMissingTableError(error)) return { schemaReady: false, items: [] };
  if (error) throw error;
  return { schemaReady: true, items: data.map(mapRow) };
}

export async function listReviewQueue() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      configured: false,
      schemaReady: false,
      items: []
    };
  }

  const [kyc, sanctions, risk] = await Promise.all([
    fetchTableReviews(
      supabase,
      "kyc_records",
      "user_id, provider, provider_inquiry_id, status, metadata, created_at, updated_at",
      (row) => normalizeItem({
        id: row.provider_inquiry_id || row.user_id,
        type: "KYC",
        status: row.status,
        userId: row.user_id,
        title: "Identity verification review",
        description: `${row.provider} status is ${row.status}`,
        createdAt: row.updated_at || row.created_at,
        metadata: row.metadata
      })
    ),
    fetchTableReviews(
      supabase,
      "sanctions_screenings",
      "id, user_id, provider, status, subject, metadata, created_at, updated_at",
      (row) => normalizeItem({
        id: row.id,
        type: "Sanctions",
        status: row.status,
        userId: row.user_id,
        title: "Sanctions screening review",
        description: `${row.subject?.recipientName || "Recipient"} requires screening attention`,
        createdAt: row.updated_at || row.created_at,
        metadata: { provider: row.provider, subject: row.subject, ...row.metadata }
      })
    ),
    fetchTableReviews(
      supabase,
      "risk_assessments",
      "id, user_id, status, score, reasons, metadata, created_at",
      (row) => normalizeItem({
        id: row.id,
        type: "Risk",
        status: row.status,
        userId: row.user_id,
        title: `Risk score ${row.score}`,
        description: Array.isArray(row.reasons) && row.reasons.length ? row.reasons.join(" ") : "Risk assessment requires attention",
        createdAt: row.created_at,
        metadata: { score: row.score, reasons: row.reasons, ...row.metadata }
      })
    )
  ]);

  return {
    configured: true,
    schemaReady: kyc.schemaReady && sanctions.schemaReady && risk.schemaReady,
    items: [...kyc.items, ...sanctions.items, ...risk.items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50)
  };
}
