// api/providers.js
//
// Route consolidation (Batch 2, P0-4): the three unauthenticated pass-through
// proxies (api/exchange/quote.js, api/kyc/verify-sender.js,
// api/sanctions/screen-transfer.js) fold into ONE authenticated handler that
// dispatches on `action`. This frees two function slots for quotes/transfers
// AND closes the P0-4 unauth-proxy surface: every upstream call now requires a
// verified bearer session first.
//
// Auth-first: requireAuthenticatedUser before anything, mirroring every other
// Batch 2 route. Fail-closed 503 when the backend config (upstream URLs) is
// missing. Keeps providerGateway's request-context guards + the lazy runtime
// config so a misconfigured deploy returns JSON, not FUNCTION_INVOCATION_FAILED.

import {
  sendJson,
  sendError,
  getJsonBody,
  createHttpError,
} from "../src/server/_lib/http.js";
import { requireAuthenticatedUser } from "../src/server/_lib/requireUser.js";
import {
  getBackendRuntimeConfig,
  proxyJsonToUpstream,
  ensurePositiveNumberLike,
  ensureNonEmptyString,
  ensurePlainObject,
  withProductionResponseContext,
  assertProductionRequestContext,
} from "../src/server/_lib/providerGateway.js";

const ACTIONS = Object.freeze({
  EXCHANGE_QUOTE: "exchange/quote",
  KYC_VERIFY_SENDER: "kyc/verify-sender",
  SANCTIONS_SCREEN_TRANSFER: "sanctions/screen-transfer",
});

function resolveUpstream(action, runtime) {
  switch (action) {
    case ACTIONS.EXCHANGE_QUOTE:
      return runtime.exchangeQuoteUrl;
    case ACTIONS.KYC_VERIFY_SENDER:
      return runtime.kycVerifySenderUrl;
    case ACTIONS.SANCTIONS_SCREEN_TRANSFER:
      return runtime.sanctionsScreenTransferUrl;
    default:
      throw createHttpError(400, `Unknown provider action: ${action}`);
  }
}

function validateForAction(action, body) {
  switch (action) {
    case ACTIONS.EXCHANGE_QUOTE:
      ensurePositiveNumberLike(body.sourceAmount, "sourceAmount");
      ensureNonEmptyString(body.sourceCurrency, "sourceCurrency");
      ensureNonEmptyString(body.destinationCurrency, "destinationCurrency");
      break;
    case ACTIONS.KYC_VERIFY_SENDER:
      ensurePlainObject(body.sender, "sender");
      break;
    case ACTIONS.SANCTIONS_SCREEN_TRANSFER:
      ensurePlainObject(body.sender, "sender");
      ensurePlainObject(body.recipient, "recipient");
      break;
    default:
      throw createHttpError(400, `Unknown provider action: ${action}`);
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return sendJson(res, 405, { ok: false, error: "Use POST." });
    }

    // AUTH FIRST: no upstream call happens before a verified session.
    await requireAuthenticatedUser(req);

    const body = getJsonBody(req);
    const action = String(body.action || body.providerAction || "").trim();

    if (!Object.values(ACTIONS).includes(action)) {
      throw createHttpError(400, `Unknown provider action: ${action || "(none given)"}`);
    }

    validateForAction(action, body);
    assertProductionRequestContext(body);

    const runtime = getBackendRuntimeConfig();
    const upstreamUrl = resolveUpstream(action, runtime);

    // Strip the action/context fields before forwarding so upstreams receive
    // their original payload shape.
    const { action: _action, transferMode: _mode, ...payload } = body;

    const result = await proxyJsonToUpstream(upstreamUrl, payload, `providers/${action}`);
    return sendJson(res, 200, withProductionResponseContext(result));
  } catch (error) {
    return sendError(res, error);
  }
}