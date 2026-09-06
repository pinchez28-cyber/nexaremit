// src/server/_lib/kycGate.js
//
// Server-side identity gate. Nothing here trusts the browser: the client may
// only supply a Persona inquiry ID, and that ID is then verified against
// Persona's API (and/or the kyc_records table written by the signed Persona
// webhook). A caller cannot mark themselves approved by editing localStorage
// or the request body.
//
// Ownership binding (Batch hardening): an inquiry may only satisfy KYC for the
// authenticated user whose id appears in the inquiry's server-owned
// reference-id. The authenticated user id is supplied by the route from the
// verified session — never from the request body — and a missing or foreign
// reference-id fails closed. A caller's own claims are never proof of
// ownership.

import { getSupabaseAdminClient } from "./supabaseClient.js";
import { normalizeKycStatus } from "./kycRecords.js";
import { personaInquiryUrl } from "./persona-endpoints.js";

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

async function verifyWithPersona(inquiryId, userId) {
  if (!process.env.PERSONA_API_KEY) return null;

  let response;
  try {
    response = await fetch(personaInquiryUrl(inquiryId), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PERSONA_API_KEY}`,
        Accept: "application/json",
        "Persona-Version": PERSONA_VERSION,
      },
    });
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

  // Ownership is proven against the inquiry's server-owned reference-id BEFORE
  // any outcome can be accepted. A missing or foreign reference-id fails
  // closed: another user's approved inquiry can never satisfy this user's KYC,
  // and the caller's own claims are never evidence of ownership.
  const ownership = assertPersonaOwnership(userId, attributes);
  if (!ownership.ok) {
    return {
      ok: false,
      code: ownership.code,
      message: ownership.message,
    };
  }

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
    referenceId: ownership.referenceId,
  };
}

async function verifyWithDatabase(inquiryId, userId) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("kyc_records")
    .select("*")
    .eq("provider_inquiry_id", inquiryId)
    .maybeSingle();

  if (error || !data) return null;

  // The stored record is only authoritative for the user it belongs to. A
  // record with a missing or different owner must never approve this caller.
  if (String(data.user_id || "") !== String(userId || "")) {
    return {
      ok: false,
      code: "kyc_ownership_mismatch",
      message:
        "This identity verification is not bound to your account and cannot be used.",
    };
  }

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
 * Prove that a Persona inquiry was issued for this exact user.
 *
 * The authoritative reference-id lives on the Persona inquiry (set server-side
 * by kyc-start / createPersonaInquiry). `userId` must come from the verified
 * session, never from the request body. Missing reference-id or a mismatch
 * fails closed so one user's approved inquiry can never satisfy another's KYC.
 */
function assertPersonaOwnership(userId, inquiryAttributes) {
  const referenceId = String(
    inquiryAttributes["reference-id"] || inquiryAttributes.referenceId || ""
  ).trim();

  if (!referenceId) {
    return {
      ok: false,
      code: "kyc_ownership_unverifiable",
      message:
        "This identity verification is not bound to your account and cannot be used.",
    };
  }

  if (referenceId !== String(userId || "")) {
    return {
      ok: false,
      code: "kyc_ownership_mismatch",
      message:
        "This identity verification is not bound to your account and cannot be used.",
    };
  }

  return { ok: true, referenceId };
}

/**
 * Verify that the supplied Persona inquiry represents a completed, approved
 * identity check FOR the authenticated user whose id is passed here.
 *
 * `userId` MUST come from the verified session (requireAuthenticatedUser), not
 * from the request body or any client-supplied claim. The inquiry's
 * server-owned reference-id must match it exactly, or the check fails closed.
 *
 * Returns { ok: true, ... } or { ok: false, code, message, ... }.
 * Fails closed: if verification cannot be performed, access is denied.
 */
export async function verifyKycInquiry(inquiryId, userId) {
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

  const caller = String(userId || "").trim();

  if (!caller) {
    // No authenticated identity: refuse. Ownership can never be proven.
    return {
      ok: false,
      code: "kyc_required",
      message: "You must be signed in before completing identity verification.",
    };
  }

  // Persona is the authoritative source when it is configured. Its owning
  // reference-id is matched against the authenticated user id.
  const personaResult = await verifyWithPersona(id, caller);
  if (personaResult) return personaResult;

  // Otherwise fall back to the record written by the signed Persona webhook.
  // The record must likewise be owned by the authenticated user.
  const databaseResult = await verifyWithDatabase(id, caller);
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
