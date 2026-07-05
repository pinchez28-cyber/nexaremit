// api/settlement/submit-signed.js

import { sendJson, sendError, assertMethod, getJsonBody } from "../../src/server/_lib/http.js";
import {
  assertProductionRequestContext,
  ensureNonEmptyString,
  withProductionResponseContext,
} from "../../src/server/_lib/providerGateway.js";
import { submitSignedSettlement } from "../../src/server/_lib/xrplSettlement.js";

export default async function handler(req, res) {
  try {
    assertMethod(req, res, ["POST"]);

    const body = assertProductionRequestContext(getJsonBody(req));

    const signedTransaction = ensureNonEmptyString(
      body.signedTransaction,
      "signedTransaction"
    );

    const result = await submitSignedSettlement({
      signedTransaction,
      failHard: body.failHard === true,
    });

    return sendJson(res, 200, withProductionResponseContext(result));
  } catch (error) {
    return sendError(res, error);
  }
}

