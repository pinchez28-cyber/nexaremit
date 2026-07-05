// api/_lib/providerGateway.js

import {
  requireUrl,
  requireEnum,
  normalizeTransferMode,
} from "../../src/lib/env.js";
import { createHttpError, sendJson, sendError, assertMethod, getJsonBody } from "./http.js";

const runtimeConfig = Object.freeze({
  transferMode: normalizeTransferMode(process.env, "TRANSFER_MODE"),
  settlementProvider: requireEnum(process.env, "SETTLEMENT_PROVIDER", [
    "xrpl-mainnet",
  ]),
  xrplNetwork: requireEnum(process.env, "XRPL_NETWORK", ["mainnet"]),
  kycVerifySenderUrl: requireUrl(process.env, "KYC_VERIFY_SENDER_URL", [
    "https:",
  ]),
  sanctionsScreenTransferUrl: requireUrl(
    process.env,
    "SANCTIONS_SCREEN_TRANSFER_URL",
    ["https:"]
  ),
  fundingEstimateUrl: requireUrl(process.env, "FUNDING_ESTIMATE_URL", [
    "https:",
  ]),
  exchangeQuoteUrl: requireUrl(process.env, "EXCHANGE_QUOTE_URL", [
    "https:",
  ]),
  payoutEstimateUrl: requireUrl(process.env, "PAYOUT_ESTIMATE_URL", [
    "https:",
  ]),
});

export function getBackendRuntimeConfig() {
  return runtimeConfig;
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

export function createProxyRouteHandler({
  routeName,
  upstreamUrl,
  validate,
}) {
  return async function handler(req, res) {
    try {
      assertMethod(req, res, ["POST"]);

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
