// api/settlement/submit-signed.js

import { sendJson, sendError, assertMethod, getJsonBody } from "../_lib/http.js";
import {
  assertProductionRequestContext,
  ensureNonEmptyString,
  withProductionResponseContext,
} from "../_lib/providerGateway.js";
import { submitSignedSettlement } from "../_lib/xrplSettlement.js";

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
