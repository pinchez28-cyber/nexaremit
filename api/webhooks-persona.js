import crypto from "node:crypto";
import { requireMethod, sendJson } from "../src/server/_lib/http.js";
import { upsertKycRecord } from "../src/server/_lib/kycRecords.js";
import { parsePersonaEvent } from "../src/server/_lib/persona.js";

function verifyPersonaSignature(rawBody, signature) {
  if (!process.env.PERSONA_WEBHOOK_SECRET) return false;
  if (!signature) return false;

  try {
    const signatureSets = String(signature).split(" ");
    const timestamp = signatureSets[0]?.split(",")?.[0]?.split("=")?.[1];
    const signatures = signatureSets
      .map((pair) => pair.match(/v1=([^,]+)/)?.[1])
      .filter(Boolean);

    if (!timestamp || !signatures.length) return false;

    const expected = crypto
      .createHmac("sha256", process.env.PERSONA_WEBHOOK_SECRET)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    return signatures.some((provided) => {
      try {
        return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  const signature = request.headers["persona-signature"] || request.headers["x-persona-signature"];

  if (!process.env.PERSONA_WEBHOOK_SECRET) {
    sendJson(response, 202, {
      received: true,
      verified: false,
      mode: "sandbox",
      message: "Webhook received. Add PERSONA_WEBHOOK_SECRET to verify Persona signatures."
    });
    return;
  }

  if (!verifyPersonaSignature(rawBody, signature)) {
    sendJson(response, 400, {
      error: "invalid_webhook_signature",
      message: "Persona webhook signature could not be verified."
    });
    return;
  }

  const event = parsePersonaEvent(JSON.parse(rawBody));
  if (!event.referenceId) {
    sendJson(response, 422, {
      error: "missing_reference_id",
      message: "Persona event did not include a NexaRemit user reference."
    });
    return;
  }

  const saved = await upsertKycRecord({
    userId: event.referenceId,
    provider: "persona",
    providerInquiryId: event.inquiryId,
    status: event.status,
    metadata: {
      eventName: event.eventName,
      receivedAt: new Date().toISOString()
    }
  });

  sendJson(response, 200, {
    received: true,
    verified: true,
    userId: event.referenceId,
    status: saved.record.status
  });
}

