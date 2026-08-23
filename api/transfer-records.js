// api/transfer-records.js
//
// Server-side storage for transfer history and receipts.
//
// The client has always called this route; it never existed. Because
// vercel.json rewrites unmatched paths to index.html, the request came back as
// HTTP 200 with a page of HTML, the JSON parse failed, and lib/transfer-records
// silently fell back to localStorage. Every receipt therefore lived only in the
// browser that created it and was lost when site data was cleared.
//
// IDENTITY, AND WHAT IT IS NOT
// This app has no authentication — AuthContext is a stub. Records are scoped by
// a random device id the browser generates and sends in x-nexa-device-id. That
// keeps one visitor's history separate from another's, and it is NOT
// authentication: anyone presenting a device id gets that device's records.
// Ids are random v4 UUIDs so they cannot be enumerated, and the format is
// enforced below so the header cannot be used to probe for other values. Before
// this app moves real money, replace this with Supabase Auth and check the JWT
// here — the row scoping stays the same shape.

import {
  sendJson,
  sendError,
  assertMethod,
  getJsonBody,
  createHttpError,
} from "../src/server/_lib/http.js";
import {
  listTransferRecords,
  getTransferRecordById,
  saveTransferRecord,
} from "../src/server/_lib/transferRecords.js";

const DEVICE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireDeviceUser(req) {
  const raw = req.headers?.["x-nexa-device-id"];
  const deviceId = String(Array.isArray(raw) ? raw[0] : raw || "").trim();

  if (!DEVICE_ID_PATTERN.test(deviceId)) {
    throw createHttpError(
      400,
      "A valid x-nexa-device-id header (UUID v4) is required."
    );
  }

  return { id: `device:${deviceId.toLowerCase()}` };
}

// Supabase is optional. Returning configured:false rather than an error lets
// the client keep using its local store, which is what it already does when
// this route is unreachable.
function isSupabaseMissing(result) {
  return result?.configured === false;
}

export default async function handler(req, res) {
  try {
    assertMethod(req, res, ["GET", "POST"]);

    const user = requireDeviceUser(req);

    if (req.method === "GET") {
      const id = String(req.query?.id || "").trim();

      if (id) {
        const result = await getTransferRecordById(user, id);
        return sendJson(res, 200, {
          configured: !isSupabaseMissing(result),
          record: result.record || null,
        });
      }

      const result = await listTransferRecords(user);
      return sendJson(res, 200, {
        configured: !isSupabaseMissing(result),
        records: result.records || [],
      });
    }

    const body = getJsonBody(req);
    const input = body.record || body;

    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw createHttpError(400, "A transfer record object is required.");
    }

    const result = await saveTransferRecord(user, input);

    return sendJson(res, 200, {
      configured: !isSupabaseMissing(result),
      record: result.record,
    });
  } catch (error) {
    // A Supabase failure should not cost the user their receipt: the client
    // keeps a local copy either way, so surface the error and let it fall back.
    return sendError(res, error);
  }
}
