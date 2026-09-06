import { PERSONA_INQUIRIES_URL } from "./persona-endpoints.js";

// Terminal, explicit Persona statuses and decisions used by the normalizer.
const TERMINAL_REJECT_STATUSES = new Set([
  "declined",
  "failed",
  "expired",
  "canceled",
  "cancelled",
]);
const FAILING_DECISIONS = new Set(["declined", "failed", "rejected"]);
const ACCEPTABLE_DECISIONS = new Set(["approved", "passed"]);
const ACCEPTABLE_TERMINAL_STATUSES = new Set(["approved", "completed", "passed"]);
const NON_APPROVED_STATUSES = new Set([
  "pending",
  "needs_review",
  "requires_review",
  "manual_review",
]);

/**
 * Decision-aware KYC normalization (authoritative Persona outcome only).
 *
 * An inquiry may ONLY become "approved" when it is both terminal AND carries an
 * explicit acceptable Persona decision. A superficially successful status
 * ("completed") with a declined/rejected decision, or with no decision at all,
 * is never approved. pending / needs_review / expired / canceled and any
 * ambiguous or missing outcome fail closed to a non-approved state.
 *
 * Returns the normalized status string: "approved", "declined", "needs_review",
 * "pending", or "unknown" for ambiguous/missing outcomes.
 */
export function normalizePersonaOutcome(event = {}) {
  const status = String(event.status || "").trim().toLowerCase();
  const decision = String(event.decision || "").trim().toLowerCase();

  if (TERMINAL_REJECT_STATUSES.has(status)) return "declined";

  if (FAILING_DECISIONS.has(decision)) return "declined";

  if (
    ACCEPTABLE_DECISIONS.has(decision) &&
    ACCEPTABLE_TERMINAL_STATUSES.has(status)
  ) {
    return "approved";
  }

  if (NON_APPROVED_STATUSES.has(status)) {
    return status === "needs_review" ||
      status === "requires_review" ||
      status === "manual_review"
      ? "needs_review"
      : "pending";
  }

  // Anything else — status present without an acceptable decision, or decision
  // without a terminal status, or nothing usable at all — fails closed.
  return "unknown";
}

export function isPersonaConfigured() {
  return Boolean(process.env.PERSONA_API_KEY && process.env.PERSONA_TEMPLATE_ID);
}

/**
 * Resolve the Persona environment label reported to clients.
 *
 * The configured PERSONA_ENVIRONMENT wins when present; otherwise the label
 * defaults from TRANSFER_MODE so sandbox reports "sandbox" and production
 * reports "production". Never returns credential material — a label only.
 */
export function resolvePersonaMode({ personaEnvironment, transferMode } = {}) {
  const env = String(personaEnvironment || "")
    .trim()
    .toLowerCase();
  if (env) return env;
  const transfer = String(transferMode || "")
    .trim()
    .toLowerCase();
  return transfer === "production" ? "production" : "sandbox";
}

export async function createPersonaInquiry({ user }) {
  if (!isPersonaConfigured()) {
    return {
      provider: "sandbox-kyc",
      mode: "sandbox",
      status: "ready_to_connect",
      inquiryId: `sandbox_inq_${user.id}`,
      sessionToken: null,
      verificationUrl: null,
      message: "Persona is not configured yet. Add Persona server variables in Vercel to create real sandbox inquiries."
    };
  }

  const response = await fetch(PERSONA_INQUIRIES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERSONA_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `nexaremit-kyc-${user.id}`
    },
    body: JSON.stringify({
      data: {
        attributes: {
          "inquiry-template-id": process.env.PERSONA_TEMPLATE_ID,
          "reference-id": user.id
        }
      }
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      provider: "persona",
      mode: process.env.PERSONA_ENVIRONMENT || "sandbox",
      status: "error",
      error: payload?.errors?.[0]?.title || payload?.errors?.[0]?.detail || "Persona inquiry could not be created."
    };
  }

  return {
    provider: "persona",
    mode: process.env.PERSONA_ENVIRONMENT || "sandbox",
    status: payload?.data?.attributes?.status || "pending",
    inquiryId: payload?.data?.id,
    sessionToken: payload?.meta?.["session-token"] || null,
    verificationUrl: payload?.meta?.["one-time-link"] || payload?.meta?.["one-time-link-short"] || null,
    message: "Persona inquiry created. Keep this in sandbox until webhooks and database status updates are verified."
  };
}

export function parsePersonaEvent(payload = {}) {
  const data = payload.data || {};
  const attributes = data.attributes || {};
  const eventName = attributes.name || data.type || payload.type || "unknown";
  const inquiry = attributes.payload?.data || attributes.inquiry || data;
  const inquiryAttributes = inquiry?.attributes || {};
  const referenceId = inquiryAttributes["reference-id"] || inquiryAttributes.referenceId || attributes["reference-id"];
  const status = inquiryAttributes.status || attributes.status || "pending";
  const decision = inquiryAttributes.decision || attributes.decision || "";
  const templateVersion =
    attributes["template-version"] ||
    attributes.templateVersion ||
    inquiryAttributes["template-version"] ||
    "";

  return {
    eventName,
    inquiryId: inquiry?.id || data.id || "",
    referenceId,
    status,
    decision,
    templateVersion,
    raw: payload
  };
}
