// api/health.js

import {
  normalizeTransferMode,
  requireEnum,
  requireUrl,
  requireLiveStripeSecretKey,
} from "../src/lib/env.js";

const runtimeConfig = Object.freeze({
  transferMode: normalizeTransferMode(process.env, "TRANSFER_MODE"),
  settlementProvider: requireEnum(process.env, "SETTLEMENT_PROVIDER", [
    "xrpl-mainnet",
  ]),
  xrplNetwork: requireEnum(process.env, "XRPL_NETWORK", ["mainnet"]),
  xrplServerUrl: requireUrl(process.env, "XRPL_SERVER_URL", ["wss:", "https:"]),
  stripeSecretKey: requireLiveStripeSecretKey(
    process.env,
    "STRIPE_SECRET_KEY"
  ),
});

function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details !== undefined) {
    error.details = details;
  }
  return error;
}

function sendJson(res, statusCode, payload) {
  return res.status(statusCode).json(payload);
}

function sendError(res, error) {
  const statusCode =
    Number.isInteger(error?.statusCode) && error.statusCode >= 400
      ? error.statusCode
      : 500;

  return res.status(statusCode).json({
    status: "error",
    error:
      typeof error?.message === "string" && error.message.trim()
        ? error.message
        : "Internal Server Error",
    ...(error?.details !== undefined ? { details: error.details } : {}),
  });
}

function assertMethod(req, res, allowedMethods) {
  if (!allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods.join(", "));
    throw createHttpError(
      405,
      `Method ${req.method} not allowed. Expected one of: ${allowedMethods.join(", ")}`
    );
  }
}

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

    return sendJson(res, 200, {
      status: "ok",
      environment: "production",
      transferMode: runtimeConfig.transferMode,
      settlementProvider: runtimeConfig.settlementProvider,
      xrplNetwork: runtimeConfig.xrplNetwork,
      xrplServerUrl: runtimeConfig.xrplServerUrl,
      stripe: {
        configured: true,
        keyType: "live_secret",
        keyPreview: redactSecret(runtimeConfig.stripeSecretKey),
      },
      checks: {
        transferMode: "pass",
        settlementProvider: "pass",
        xrplNetwork: "pass",
        xrplServerUrl: "pass",
        stripeSecretKey: "pass",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return sendError(res, error);
  }
}
