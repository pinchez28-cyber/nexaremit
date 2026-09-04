import { PERSONA_INQUIRIES_URL } from "./persona-endpoints.js";

export function isPersonaConfigured() {
  return Boolean(process.env.PERSONA_API_KEY && process.env.PERSONA_TEMPLATE_ID);
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

  return {
    eventName,
    inquiryId: inquiry?.id || data.id || "",
    referenceId,
    status,
    raw: payload
  };
}
