// src/server/_lib/persona-endpoints.js
//
// Single source of truth for Persona API endpoint URLs.
//
// Previously the base URL was hard-coded twice — and the two copies disagreed:
// kycGate.js pointed at https://withpersona.com/api/v1/inquiries (missing the
// api. subdomain, so verification requests hit the wrong host and returned
// 404) while persona.js used the correct https://api.withpersona.com. Keeping
// one constant here means a fix cannot drift again: both files import it.

export const PERSONA_API_BASE = "https://api.withpersona.com/api/v1";

export const PERSONA_INQUIRIES_URL = `${PERSONA_API_BASE}/inquiries`;

/** URL for fetching/verifying a single inquiry, e.g. by its inquiry id. */
export function personaInquiryUrl(inquiryId) {
  return `${PERSONA_INQUIRIES_URL}/${encodeURIComponent(String(inquiryId || ""))}`;
}