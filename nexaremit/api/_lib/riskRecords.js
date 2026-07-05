import crypto from "node:crypto";
import { getSupabaseAdminClient } from "./supabaseClient.js";
import { isMissingTableError } from "./supabaseErrors.js";

const HIGH_RISK_CORRIDORS = new Set(["US-NG", "GB-NG", "EU-ZA"]);
const REVIEW_THRESHOLD = 45;
const BLOCK_THRESHOLD = 80;

function nowIso() {
  return new Date().toISOString();
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function isSandboxMode() {
  return (process.env.TRANSFER_MODE || "sandbox") === "sandbox";
}

function createRiskId({ user, amount, currency, recipient }) {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify({
      userId: user?.id,
      amount,
      currency,
      recipientName: recipient?.name,
      corridor: recipient?.corridor,
      at: Math.floor(Date.now() / 60_000)
    }))
    .digest("hex")
    .slice(0, 24);

  return `risk_${hash}`;
}

async function getRecentTransferStats(user) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { configured: false, count24h: 0, amount24h: 0 };

  const { data, error } = await supabase
    .from("transfer_records")
    .select("send_amount")
    .eq("user_id", user.id)
    .gte("created_at", hoursAgo(24));

  if (isMissingTableError(error)) return { configured: false, schemaReady: false, count24h: 0, amount24h: 0 };
  if (error) throw error;

  return {
    configured: true,
    count24h: data.length,
    amount24h: data.reduce((sum, row) => sum + Number(row.send_amount || 0), 0)
  };
}

function calculateRisk({ user, amount, currency, recipient, kyc, sanctions, stats }) {
  const numericAmount = Number(amount || 0);
  const reasons = [];
  let score = 0;

  if (!user?.id) {
    score += 60;
    reasons.push("User identity is missing.");
  }

  if (kyc?.status !== "approved") {
    score += 35;
    reasons.push("KYC is not approved.");
  }

  if (sanctions?.status !== "clear") {
    score += 80;
    reasons.push("Sanctions screening is not clear.");
  }

  if (numericAmount >= 1000) {
    score += 18;
    reasons.push("Large transfer requires enhanced review.");
  }

  if (numericAmount >= 2500) {
    score += 28;
    reasons.push("Transfer amount is near or above standard sandbox limits.");
  }

  if (HIGH_RISK_CORRIDORS.has(recipient?.corridor || "")) {
    score += 12;
    reasons.push("Corridor has higher compliance risk.");
  }

  if (stats.count24h >= 4) {
    score += 25;
    reasons.push("Multiple transfers attempted in the last 24 hours.");
  }

  if (stats.amount24h + numericAmount >= 5000) {
    score += 30;
    reasons.push(`Daily transfer volume exceeds ${currency} 5,000.`);
  }

  let status = score >= BLOCK_THRESHOLD ? "blocked" : score >= REVIEW_THRESHOLD ? "manual_review" : "clear";

  if (isSandboxMode() && recipient?.risk !== "Review required" && sanctions?.status === "clear" && status === "blocked") {
    status = "manual_review";
    reasons.push("Sandbox verified recipient downgraded from blocked to review so test transfers can continue.");
  }

  return {
    score: Math.min(score, 100),
    status,
    reasons
  };
}

function toRiskRow(record) {
  return {
    id: record.id,
    user_id: record.userId,
    status: record.status,
    score: record.score,
    reasons: record.reasons || [],
    metadata: record.metadata || {},
    created_at: record.createdAt || nowIso()
  };
}

function fromRiskRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    score: Number(row.score || 0),
    reasons: row.reasons || [],
    metadata: row.metadata || {},
    createdAt: row.created_at
  };
}

export async function saveRiskAssessment(record) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { configured: false, record };

  const { data, error } = await supabase
    .from("risk_assessments")
    .insert(toRiskRow(record))
    .select("*")
    .single();

  if (isMissingTableError(error)) return { configured: false, schemaReady: false, record };
  if (error) throw error;

  return { configured: true, record: fromRiskRow(data) };
}

export async function assessTransferRisk({ user, amount, currency, recipient, kyc, sanctions }) {
  const stats = await getRecentTransferStats(user);
  const calculated = calculateRisk({ user, amount, currency, recipient, kyc, sanctions, stats });
  const record = {
    id: createRiskId({ user, amount, currency, recipient }),
    userId: user?.id || "sandbox-user",
    status: calculated.status,
    score: calculated.score,
    reasons: calculated.reasons,
    metadata: {
      mode: process.env.TRANSFER_MODE || "sandbox",
      corridor: recipient?.corridor || "",
      stats
    },
    createdAt: nowIso()
  };

  return saveRiskAssessment(record);
}
