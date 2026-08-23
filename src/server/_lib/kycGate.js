// src/server/_lib/kycGate.js
//
// Server-side identity gate. Nothing here trusts the browser: the client may
// only supply a Persona inquiry ID, and that ID is then verified against
// Persona's API (and/or the kyc_records table written by the signed Persona
// webhook). A caller cannot mark themselves approved by editing localStorage
// or the request body.

import { getSupabaseAdminClient } from "./supabaseClient.js";
import { normalizeKycStatus } from "./kycRecords.js";

const PERSONA_INQUIRY_URL = "https://withpersona.com/api/v1/inquiries";
const PERSONA_VERSION = "2023-01-05";

// Persona inquiry states that mean "identity check finished successfully".
const PASSING_STATUSES = new Set(["approved", "completed"]);
// Explicit rejections — never allow these through, whatever the status says.
const FAILING_DECISIONS = new Set(["declined", "failed", "rejected"]);

/**
 * KYC is enforced by default. Set NEXA_REQUIRE_KYC=false to disable it while
 * testing — this is deliberately an explicit opt-out, so the secure behaviour
 * is what you get if nobody configures anything.
 */
export function isKycRequired() {
  return (
    String(process.env.NEXA_REQUIRE_KYC || "true").trim().toLowerCase() !==
    "false"
  );
}

async function verifyWithPersona(inquiryId) {
  if (!process.env.PERSONA_API_KEY) return null;

  let response;
  try {
    response = await fetch(
      `${PERSONA_INQUIRY_URL}/${encodeURIComponent(inquiryId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PERSONA_API_KEY}`,
          Accept: "application/json",
          "Persona-Version": PERSONA_VERSION,
        },
      }
    );
  } catch (error) {
    return {
      ok: false,
      code: "kyc_provider_unreachable",
      message: "Identity provider could not be reached. Please try again.",
    };
  }

  if (response.status === 404) {
    return {
      ok: false,
      code: "kyc_inquiry_not_found",
      message: "That identity verification could not be found.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      code: "kyc_provider_error",
      message: "Identity verification could not be confirmed. Please try again.",
    };
  }

  const payload = await response.json().catch(() => ({}));
  const attributes = payload?.data?.attributes || {};
  const status = String(attributes.status || "").toLowerCase();
  const decision = String(attributes.decision || "").toLowerCase();

  if (decision && FAILING_DECISIONS.has(decision)) {
    return {
      ok: false,
      code: "kyc_declined",
      status,
      decision,
      message: "Identity verification was not approved.",
    };
  }

  if (!PASSING_STATUSES.has(status)) {
    return {
      ok: false,
      code: "kyc_incomplete",
      status,
      decision,
      message:
        "Identity verification is not complete yet. Finish verification before sending money.",
    };
  }

  return {
    ok: true,
    source: "persona",
    status,
    decision,
    referenceId: attributes["reference-id"] || null,
  };
}

async function verifyWithDatabase(inquiryId) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("kyc_records")
    .select("*")
    .eq("provider_inquiry_id", inquiryId)
    .maybeSingle();

  if (error || !data) return null;

  const status = normalizeKycStatus(data.status);

  if (status !== "approved") {
    return {
      ok: false,
      code: "kyc_incomplete",
      status,
      message:
        "Identity verification is not approved yet. Finish verification before sending money.",
    };
  }

  return { ok: true, source: "database", status, referenceId: data.user_id };
}

/**
 * Verify that the supplied Persona inquiry represents a completed, approved
 * identity check.
 *
 * Returns { ok: true, ... } or { ok: false, code, message, ... }.
 * Fails closed: if verification cannot be performed, access is denied.
 */
export async function verifyKycInquiry(inquiryId) {
  if (!isKycRequired()) {
    return { ok: true, source: "disabled", skipped: true };
  }

  const id = String(inquiryId || "").trim();

  if (!id) {
    return {
      ok: false,
      code: "kyc_required",
      message:
        "Identity verification is required before sending money. Complete verification on the Start Here page, then try again.",
    };
  }

  // Persona is the authoritative source when it is configured.
  const personaResult = await verifyWithPersona(id);
  if (personaResult) return personaResult;

  // Otherwise fall back to the record written by the signed Persona webhook.
  const databaseResult = await verifyWithDatabase(id);
  if (databaseResult) return databaseResult;

  // Neither source available: fail closed rather than let money move
  // unverified. Set NEXA_REQUIRE_KYC=false if this is intentional.
  return {
    ok: false,
    code: "kyc_unverifiable",
    message:
      "Identity verification cannot be confirmed because the verification provider is not configured on the server.",
  };
}

export default verifyKycInquiry;
