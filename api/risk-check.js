import { getRequestUser, readJson, requireMethod, sendJson } from "../src/server/_lib/http.js";
import { providerRegistry } from "../src/server/_lib/providerRegistry.js";
import { assessTransferRisk } from "../src/server/_lib/riskRecords.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  try {
    const body = await readJson(request);
    const user = getRequestUser(request);
    const recipient = body.recipient || {};
    const [kyc, sanctions] = await Promise.all([
      providerRegistry.verifyKyc({ user }),
      providerRegistry.screenSanctions({ user, recipient })
    ]);
    const assessment = await assessTransferRisk({
      user,
      amount: body.amount,
      currency: body.currency || "USD",
      recipient,
      kyc,
      sanctions
    });

    sendJson(response, 200, {
      configured: assessment.configured,
      risk: assessment.record
    });
  } catch (error) {
    sendJson(response, error.code === "invalid_json" ? 400 : 500, {
      error: error.code || "risk_check_failed",
      message: error.message
    });
  }
}

