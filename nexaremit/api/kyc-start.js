import { getRequestUser, requireMethod, sendJson } from "./_lib/http.js";
import { upsertKycRecord } from "./_lib/kycRecords.js";
import { createPersonaInquiry } from "./_lib/persona.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  const user = getRequestUser(request);
  const inquiry = await createPersonaInquiry({ user }).catch((error) => ({
    provider: process.env.KYC_PROVIDER || "persona",
    mode: process.env.PERSONA_ENVIRONMENT || process.env.TRANSFER_MODE || "sandbox",
    status: "error",
    error: error?.message || "KYC provider request failed."
  }));
  const kycRecord = await upsertKycRecord({
    userId: user.id,
    provider: inquiry.provider,
    providerInquiryId: inquiry.inquiryId,
    status: inquiry.status === "ready_to_connect" ? "required" : inquiry.status,
    metadata: {
      mode: inquiry.mode,
      startedFrom: "kyc-start",
      message: inquiry.message
    }
  }).catch((error) => ({
    configured: false,
    error: error.message
  }));
  const statusCode = inquiry.status === "error" ? 502 : 200;

  sendJson(response, statusCode, {
    userId: user.id,
    kyc: inquiry,
    stored: kycRecord.configured
  });
}
