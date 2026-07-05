// api/settlement/prepare.js

import { sendJson, sendError, assertMethod, getJsonBody } from "../_lib/http.js";
import {
  assertProductionRequestContext,
  ensureNonEmptyString,
  ensureAtLeastOneDefined,
  withProductionResponseContext,
} from "../_lib/providerGateway.js";
import { prepareSettlement } from "../_lib/xrplSettlement.js";

export default async function handler(req, res) {
  try {
    assertMethod(req, res, ["POST"]);

    const body = assertProductionRequestContext(getJsonBody(req));

    const sourceAddress = ensureNonEmptyString(body.sourceAddress, "sourceAddress");
    const destinationAddress = ensureNonEmptyString(
      body.destinationAddress,
      "destinationAddress"
    );

    ensureAtLeastOneDefined(
      [body.amountDrops, body.amountXrp],
      "Either amountDrops or amountXrp must be provided"
    );

    const result = await prepareSettlement({
      sourceAddress,
      destinationAddress,
      amountDrops: body.amountDrops,
      amountXrp: body.amountXrp,
      memo: body.memo,
      destinationTag: body.destinationTag,
      feeDrops: body.feeDrops,
      lastLedgerSequence: body.lastLedgerSequence,
    });

    return sendJson(res, 200, withProductionResponseContext(result));
  } catch (error) {
    return sendError(res, error);
  }
}
