// api/health.js
//
// Reports whether this deployment is configured to move money.
//
// This route used to validate its own configuration at module scope, so the
// one endpoint whose job is to explain a broken deployment was the endpoint
// that crashed first — an unset variable produced an opaque HTML 500 naming
// nothing. Validation now runs per request and every check is reported, so a
// misconfigured deploy can be diagnosed in one call.

import {
  normalizeTransferMode,
  requireEnum,
  requireUrl,
  requireLiveStripeSecretKey,
} from "../src/lib/env.js";
import { inspectConfig } from "../src/server/_lib/runtimeConfig.js";
import { sendJson, sendError, assertMethod, createHttpError } from "../src/server/_lib/http.js";

const healthConfigSpec = {
  transferMode: [
    "TRANSFER_MODE",
    (env) => normalizeTransferMode(env, "TRANSFER_MODE"),
  ],
  settlementProvider: [
    "SETTLEMENT_PROVIDER",
    (env) => requireEnum(env, "SETTLEMENT_PROVIDER", ["xrpl-mainnet"]),
  ],
  xrplNetwork: [
    "XRPL_NETWORK",
    (env) => requireEnum(env, "XRPL_NETWORK", ["mainnet"]),
  ],
  xrplServerUrl: [
    "XRPL_SERVER_URL",
    (env) => requireUrl(env, "XRPL_SERVER_URL", ["wss:", "https:"]),
  ],
  stripeSecretKey: [
    "STRIPE_SECRET_KEY",
    (env) => requireLiveStripeSecretKey(env, "STRIPE_SECRET_KEY"),
  ],
};

function redactSecret(secret) {
  if (typeof secret !== "string" || secret.length < 8) {
    return "configured";
  }
  return `${secret.slice(0, 7)}***`;
}

function assertNoUnsafeProbeValues(req) {
  const valuesToCheck = [
    req.query?.mode,
    req.query?.transferMode,
    req.query?.provider,
    req.query?.settlementProvider,
    req.query?.xrplNetwork,
    req.query?.stripePublishableKey,
    req.query?.publishableKey,
  ].filter((value) => value !== undefined && value !== null && value !== "");

  for (const value of valuesToCheck) {
    const normalized = String(value).trim().toLowerCase();

    if (
      normalized.includes("testnet") ||
      normalized.includes("sandbox") ||
      normalized.includes("mock") ||
      normalized.includes("pk_test_")
    ) {
      throw createHttpError(400, `Invalid health probe value: ${value}`);
    }
  }
}

export default async function handler(req, res) {
  try {
    assertMethod(req, res, ["GET"]);
    assertNoUnsafeProbeValues(req);

    const { ok, values, checks } = inspectConfig(healthConfigSpec);

    // A failing check is the answer, not an error: report which variables are
    // wrong and let the caller (or a deploy gate) decide what to do.
    if (!ok) {
      return sendJson(res, 503, {
        status: "misconfigured",
        environment: "production",
        checks,
        misconfigured: Object.values(checks)
          .filter((check) => check.status === "fail")
          .map((check) => check.env),
        timestamp: new Date().toISOString(),
      });
    }

    return sendJson(res, 200, {
      status: "ok",
      environment: "production",
      transferMode: values.transferMode,
      settlementProvider: values.settlementProvider,
      xrplNetwork: values.xrplNetwork,
      xrplServerUrl: values.xrplServerUrl,
      stripe: {
        configured: true,
        keyType: "live_secret",
        keyPreview: redactSecret(values.stripeSecretKey),
      },
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return sendError(res, error);
  }
}
