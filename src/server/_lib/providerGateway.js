// api/_lib/providerGateway.js

import {
  requireUrl,
  requireEnum,
  normalizeTransferMode,
} from "../../lib/env.js";
import { createHttpError, sendJson, sendError, assertMethod, getJsonBody } from "./http.js";
import { lazyConfig } from "./runtimeConfig.js";

// Resolved on the first request, not at import. Building this at module scope
// meant a single unset variable crashed the function before the handler
// existed, leaving Vercel nothing to call and the caller an opaque HTML 500.
export const backendConfigSpec = {
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
  kycVerifySenderUrl: [
    "KYC_VERIFY_SENDER_URL",
    (env) => requireUrl(env, "KYC_VERIFY_SENDER_URL", ["https:"]),
  ],
  sanctionsScreenTransferUrl: [
    "SANCTIONS_SCREEN_TRANSFER_URL",
    (env) => requireUrl(env, "SANCTIONS_SCREEN_TRANSFER_URL", ["https:"]),
  ],
  fundingEstimateUrl: [
    "FUNDING_ESTIMATE_URL",
    (env) => requireUrl(env, "FUNDING_ESTIMATE_URL", ["https:"]),
  ],
  exchangeQuoteUrl: [
    "EXCHANGE_QUOTE_URL",
    (env) => requireUrl(env, "EXCHANGE_QUOTE_URL", ["https:"]),
  ],
  payoutEstimateUrl: [
    "PAYOUT_ESTIMATE_URL",
    (env) => requireUrl(env, "PAYOUT_ESTIMATE_URL", ["https:"]),
  ],
};

const getRuntimeConfig = lazyConfig(backendConfigSpec);

export function getBackendRuntimeConfig() {
  return getRuntimeConfig();
}

export function ensurePlainObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw createHttpError(400, `${fieldName} must be an object`);
  }
  return value;
}

export function ensureNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw createHttpError(400, `${fieldName} is required`);
  }
  return value.trim();
}

export function ensurePositiveNumberLike(value, fieldName) {
  if (value == null || value === "") {
    throw createHttpError(400, `${fieldName} is required`);
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw createHttpError(
      400,
      `${fieldName} must be a positive number. Received: ${value}`
    );
  }

  return value;
}

export function ensureAtLeastOneDefined(values, errorMessage) {
  const hasAny = values.some(
    (value) => value !== undefined && value !== null && value !== ""
  );

  if (!hasAny) {
    throw createHttpError(400, errorMessage);
  }
}

export function assertProductionRequestContext(body) {
  const runtimeConfig = getRuntimeConfig();
  const payload = ensurePlainObject(body, "request body");

  const rawTransferMode = String(payload.transferMode ?? "").trim().toLowerCase();
  const normalizedTransferMode =
    rawTransferMode === "live" ? "production" : rawTransferMode;

  if (normalizedTransferMode !== runtimeConfig.transferMode) {
    throw createHttpError(
      400,
      `Invalid transferMode. Expected "${runtimeConfig.transferMode}", received "${payload.transferMode}"`
    );
  }

  if (payload.settlementProvider !== runtimeConfig.settlementProvider) {
    throw createHttpError(
      400,
      `Invalid settlementProvider. Expected "${runtimeConfig.settlementProvider}", received "${payload.settlementProvider}"`
    );
  }

  if (
    payload.provider !== undefined &&
    payload.provider !== runtimeConfig.settlementProvider
  ) {
    throw createHttpError(
      400,
      `Invalid provider. Expected "${runtimeConfig.settlementProvider}", received "${payload.provider}"`
    );
  }

  if (payload.xrplNetwork !== runtimeConfig.xrplNetwork) {
    throw createHttpError(
      400,
      `Invalid xrplNetwork. Expected "${runtimeConfig.xrplNetwork}", received "${payload.xrplNetwork}"`
    );
  }

  return payload;
}

export function withProductionResponseContext(result = {}) {
  const runtimeConfig = getRuntimeConfig();

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return {
      result,
      provider: runtimeConfig.settlementProvider,
      settlementProvider: runtimeConfig.settlementProvider,
      xrplNetwork: runtimeConfig.xrplNetwork,
      transferMode: runtimeConfig.transferMode,
    };
  }

  return {
    ...result,
    provider: runtimeConfig.settlementProvider,
    settlementProvider: runtimeConfig.settlementProvider,
    xrplNetwork: runtimeConfig.xrplNetwork,
    transferMode: runtimeConfig.transferMode,
  };
}

async function parseUpstreamResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

function getUpstreamErrorMessage(body, fallbackMessage) {
  if (!body) return fallbackMessage;

  if (typeof body === "string" && body.trim()) {
    return body.trim();
  }

  if (typeof body === "object") {
    const message =
      body.message || body.error || body.details || body.title || body.code;

    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  return fallbackMessage;
}

export async function proxyJsonToUpstream(upstreamUrl, payload, routeName) {
  const response = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await parseUpstreamResponse(response);

  if (!response.ok) {
    throw createHttpError(
      response.status,
      getUpstreamErrorMessage(
        body,
        `[${routeName}] Upstream request failed: ${response.status} ${response.statusText}`
      ),
      body
    );
  }

  return body;
}

/**
 * Build a proxy route.
 *
 * Takes upstreamUrlKey — a key of backendConfigSpec — rather than a resolved
 * URL, so a route module no longer has to read the config at import time just
 * to describe itself. The URL is looked up per request.
 */
export function createProxyRouteHandler({
  routeName,
  upstreamUrlKey,
  validate,
}) {
  return async function handler(req, res) {
    try {
      assertMethod(req, res, ["POST"]);

      const upstreamUrl = getRuntimeConfig()[upstreamUrlKey];
      const body = assertProductionRequestContext(getJsonBody(req));

      if (typeof validate === "function") {
        validate(body);
      }

      const result = await proxyJsonToUpstream(upstreamUrl, body, routeName);

      return sendJson(res, 200, withProductionResponseContext(result));
    } catch (error) {
      return sendError(res, error);
    }
  };
}
