// api/settlement/[action].js
//
// The three settlement steps share one function. They were three route files,
// which is three of the twelve serverless functions the Vercel Hobby plan
// allows — a cap this project had already hit once, and which a previous
// commit dealt with by deleting routes. The public URLs are unchanged:
// /api/settlement/prepare, /api/settlement/submit-signed, and
// /api/settlement/submit-and-wait.

import {
  sendJson,
  sendError,
  assertMethod,
  getJsonBody,
  createHttpError,
} from "../../src/server/_lib/http.js";
import {
  assertProductionRequestContext,
  ensureNonEmptyString,
  ensureAtLeastOneDefined,
  withProductionResponseContext,
} from "../../src/server/_lib/providerGateway.js";
import {
  prepareSettlement,
  submitSignedSettlement,
  submitAndWaitSignedSettlement,
} from "../../src/server/_lib/xrplSettlement.js";

const ACTIONS = {
  prepare(body) {
    const sourceAddress = ensureNonEmptyString(body.sourceAddress, "sourceAddress");
    const destinationAddress = ensureNonEmptyString(
      body.destinationAddress,
      "destinationAddress"
    );

    ensureAtLeastOneDefined(
      [body.amountDrops, body.amountXrp],
      "Either amountDrops or amountXrp must be provided"
    );

    return prepareSettlement({
      sourceAddress,
      destinationAddress,
      amountDrops: body.amountDrops,
      amountXrp: body.amountXrp,
      memo: body.memo,
      destinationTag: body.destinationTag,
      feeDrops: body.feeDrops,
      lastLedgerSequence: body.lastLedgerSequence,
    });
  },

  "submit-signed"(body) {
    return submitSignedSettlement({
      signedTransaction: ensureNonEmptyString(
        body.signedTransaction,
        "signedTransaction"
      ),
      failHard: body.failHard === true,
    });
  },

  "submit-and-wait"(body) {
    return submitAndWaitSignedSettlement({
      signedTransaction: ensureNonEmptyString(
        body.signedTransaction,
        "signedTransaction"
      ),
      failHard: body.failHard === true,
    });
  },
};

export default async function handler(req, res) {
  try {
    assertMethod(req, res, ["POST"]);

    const action = String(req.query?.action || "").trim();
    const run = ACTIONS[action];

    if (!run) {
      throw createHttpError(404, `Unknown settlement action: ${action}`, {
        supportedActions: Object.keys(ACTIONS),
      });
    }

    const body = assertProductionRequestContext(getJsonBody(req));
    const result = await run(body);

    return sendJson(res, 200, withProductionResponseContext(result));
  } catch (error) {
    return sendError(res, error);
  }
}
