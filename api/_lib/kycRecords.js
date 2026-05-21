import { getSupabaseAdminClient } from "./supabaseClient.js";

const APPROVED_STATUSES = new Set(["approved", "completed", "passed"]);

export function normalizeKycStatus(status) {
  const normalized = String(status || "required").toLowerCase();
  if (APPROVED_STATUSES.has(normalized)) return "approved";
  if (["declined", "failed", "rejected"].includes(normalized)) return "declined";
  if (["needs_review", "requires_review", "manual_review"].includes(normalized)) return "needs_review";
  if (["pending", "created", "initiated"].includes(normalized)) return "pending";
  return normalized;
}

function toKycRow(record) {
  return {
    user_id: record.userId,
    provider: record.provider,
    provider_inquiry_id: record.providerInquiryId || null,
    status: normalizeKycStatus(record.status),
    metadata: record.metadata || {},
    updated_at: new Date().toISOString()
  };
}

function fromKycRow(row) {
  return {
    userId: row.user_id,
    provider: row.provider,
    providerInquiryId: row.provider_inquiry_id || "",
    status: normalizeKycStatus(row.status),
    metadata: row.metadata || {},
    updatedAt: row.updated_at,
    createdAt: row.created_at
  };
}

export async function getKycRecord(user) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      configured: false,
      record: {
        userId: user.id,
        provider: process.env.KYC_PROVIDER || "sandbox-kyc",
        status: normalizeKycStatus(user.kycStatus)
      }
    };
  }

  const { data, error } = await supabase
    .from("kyc_records")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  return {
    configured: true,
    record: data ? fromKycRow(data) : {
      userId: user.id,
      provider: process.env.KYC_PROVIDER || "persona",
      status: "required"
    }
  };
}

export async function upsertKycRecord(record) {
  const supabase = getSupabaseAdminClient();
  const normalized = {
    userId: record.userId,
    provider: record.provider || process.env.KYC_PROVIDER || "persona",
    providerInquiryId: record.providerInquiryId || "",
    status: normalizeKycStatus(record.status),
    metadata: record.metadata || {}
  };

  if (!supabase) return { configured: false, record: normalized };

  const { data, error } = await supabase
    .from("kyc_records")
    .upsert(toKycRow(normalized), { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw error;
  return { configured: true, record: fromKycRow(data) };
}
