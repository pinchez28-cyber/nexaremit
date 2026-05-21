import { getRequestUser, readJson, requireMethod, sendJson } from "./_lib/http.js";
import { screenSanctionsSubject } from "./_lib/sanctionsRecords.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  try {
    const body = await readJson(request);
    const user = getRequestUser(request);
    const screening = await screenSanctionsSubject({
      user,
      recipient: body.recipient || body
    });

    sendJson(response, 200, {
      configured: screening.configured,
      screening: screening.record
    });
  } catch (error) {
    sendJson(response, error.code === "invalid_json" ? 400 : 500, {
      error: error.code || "sanctions_screening_failed",
      message: error.message
    });
  }
}
