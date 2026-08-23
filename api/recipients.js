// api/recipients.js

import {
  normalizeTransferMode,
  requireEnum,
  requireUrl,
} from "../src/lib/env.js";
import { lazyConfig } from "../src/server/_lib/runtimeConfig.js";

// Resolved per request rather than at import: an unset variable used to crash
// this function before the handler existed, which Vercel could only report as
// an opaque HTML 500.
const getRuntimeConfig = lazyConfig({
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
  recipientsApiUrl: [
    "RECIPIENTS_API_URL",
    (env) => requireUrl(env, "RECIPIENTS_API_URL", ["https:"]),
  ],
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

function ensurePlainObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw createHttpError(400, `${fieldName} must be an object`);
  }
  return value;
}

function ensureNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw createHttpError(400, `${fieldName} is required`);
  }
  return value.trim();
}

function ensureOptionalNonEmptyString(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return ensureNonEmptyString(value, fieldName);
}

function normalizeOptionalBoolean(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") return value;

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  throw createHttpError(400, `${fieldName} must be a boolean`);
}

function normalizeOptionalInteger(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw createHttpError(400, `${fieldName} must be a non-negative integer`);
  }

  return parsed;
}

function getJsonBody(req) {
  let body;

  try {
    body = req.body;
  } catch (error) {
    throw createHttpError(400, "Malformed JSON request body", error?.message);
  }

  if (body == null) {
    throw createHttpError(400, "Request body is required");
  }

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      throw createHttpError(400, "Request body must be valid JSON");
    }
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createHttpError(400, "Request body must be a JSON object");
  }

  return body;
}

function containsForbiddenValue(value) {
  const normalized = String(value).trim().toLowerCase();

  return (
    normalized.includes("testnet") ||
    normalized.includes("sandbox") ||
    normalized.includes("mock") ||
    normalized.includes("pk_test_")
  );
}

function assertNoForbiddenStringsInValue(value, fieldPath) {
  if (value === undefined || value === null) return;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    if (containsForbiddenValue(value)) {
      throw createHttpError(
        400,
        `${fieldPath} contains a non-production value: ${value}`
      );
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertNoForbiddenStringsInValue(item, `${fieldPath}[${index}]`)
    );
    return;
  }

  if (typeof value === "object") {
    for (const [key, nestedValue] of Object.entries(value)) {
      assertNoForbiddenStringsInValue(nestedValue, `${fieldPath}.${key}`);
    }
  }
}

function assertProductionContextFromQuery(query) {
  const transferMode = query.transferMode ?? query.mode;
  const settlementProvider = query.settlementProvider ?? query.provider;
  const xrplNetwork = query.xrplNetwork;
  const publishableKey = query.stripePublishableKey ?? query.publishableKey;

  [transferMode, settlementProvider, xrplNetwork, publishableKey].forEach(
    (value, index) => {
      const names = ["transferMode", "settlementProvider", "xrplNetwork", "publishableKey"];
      if (value !== undefined) {
        assertNoForbiddenStringsInValue(value, names[index]);
      }
    }
  );

  if (transferMode !== undefined) {
    const raw = ensureNonEmptyString(transferMode, "transferMode").toLowerCase();
    const normalized = raw === "live" ? "production" : raw;

    if (normalized !== getRuntimeConfig().transferMode) {
      throw createHttpError(
        400,
        `Invalid transferMode. Expected "${getRuntimeConfig().transferMode}", received "${transferMode}"`
      );
    }
  }

  if (settlementProvider !== undefined) {
    const normalized = ensureNonEmptyString(
      settlementProvider,
      "settlementProvider"
    );
    if (normalized !== getRuntimeConfig().settlementProvider) {
      throw createHttpError(
        400,
        `Invalid settlementProvider. Expected "${getRuntimeConfig().settlementProvider}", received "${settlementProvider}"`
      );
    }
  }

  if (xrplNetwork !== undefined) {
    const normalized = ensureNonEmptyString(xrplNetwork, "xrplNetwork");
    if (normalized !== getRuntimeConfig().xrplNetwork) {
      throw createHttpError(
        400,
        `Invalid xrplNetwork. Expected "${getRuntimeConfig().xrplNetwork}", received "${xrplNetwork}"`
      );
    }
  }
}

function assertProductionContextFromBody(body) {
  assertNoForbiddenStringsInValue(body, "body");

  if (body.transferMode !== undefined) {
    const raw = ensureNonEmptyString(body.transferMode, "transferMode").toLowerCase();
    const normalized = raw === "live" ? "production" : raw;

    if (normalized !== getRuntimeConfig().transferMode) {
      throw createHttpError(
        400,
        `Invalid transferMode. Expected "${getRuntimeConfig().transferMode}", received "${body.transferMode}"`
      );
    }
  }

  if (body.settlementProvider !== undefined) {
    if (body.settlementProvider !== getRuntimeConfig().settlementProvider) {
      throw createHttpError(
        400,
        `Invalid settlementProvider. Expected "${getRuntimeConfig().settlementProvider}", received "${body.settlementProvider}"`
      );
    }
  }

  if (body.provider !== undefined) {
    if (body.provider !== getRuntimeConfig().settlementProvider) {
      throw createHttpError(
        400,
        `Invalid provider. Expected "${getRuntimeConfig().settlementProvider}", received "${body.provider}"`
      );
    }
  }

  if (body.xrplNetwork !== undefined) {
    if (body.xrplNetwork !== getRuntimeConfig().xrplNetwork) {
      throw createHttpError(
        400,
        `Invalid xrplNetwork. Expected "${getRuntimeConfig().xrplNetwork}", received "${body.xrplNetwork}"`
      );
    }
  }
}

function buildRecipientsUrl(query = {}) {
  const url = new URL(getRuntimeConfig().recipientsApiUrl);

  const id = ensureOptionalNonEmptyString(query.id, "id");
  if (id) {
    url.pathname = `${url.pathname.replace(/\/$/, "")}/${encodeURIComponent(id)}`;
  }

  const filters = {
    userId: ensureOptionalNonEmptyString(query.userId, "userId"),
    country: ensureOptionalNonEmptyString(query.country, "country"),
    currency: ensureOptionalNonEmptyString(query.currency, "currency"),
    status: ensureOptionalNonEmptyString(query.status, "status"),
    corridor: ensureOptionalNonEmptyString(query.corridor, "corridor"),
    search: ensureOptionalNonEmptyString(query.search, "search"),
    limit: normalizeOptionalInteger(query.limit, "limit"),
    offset: normalizeOptionalInteger(query.offset, "offset"),
    archived: normalizeOptionalBoolean(query.archived, "archived"),
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  url.searchParams.set("transferMode", getRuntimeConfig().transferMode);
  url.searchParams.set("settlementProvider", getRuntimeConfig().settlementProvider);
  url.searchParams.set("xrplNetwork", getRuntimeConfig().xrplNetwork);

  return url.toString();
}

function normalizeMetadata(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  ensurePlainObject(value, "metadata");

  const normalized = {};

  for (const [key, rawValue] of Object.entries(value)) {
    const normalizedKey = ensureNonEmptyString(key, "metadata key");
    if (rawValue === undefined || rawValue === null) continue;
    normalized[normalizedKey] =
      typeof rawValue === "string" ? rawValue : String(rawValue);
  }

  return normalized;
}

function buildCreateOrUpdatePayload(body) {
  const recipient = ensurePlainObject(body.recipient ?? body, "recipient");

  const payload = {
    transferMode: getRuntimeConfig().transferMode,
    settlementProvider: getRuntimeConfig().settlementProvider,
    provider: getRuntimeConfig().settlementProvider,
    xrplNetwork: getRuntimeConfig().xrplNetwork,
    recipient: {
      id: ensureOptionalNonEmptyString(recipient.id, "recipient.id"),
      userId: ensureOptionalNonEmptyString(recipient.userId, "recipient.userId"),
      name: ensureNonEmptyString(recipient.name, "recipient.name"),
      country: ensureNonEmptyString(recipient.country, "recipient.country"),
      receiveCurrency: ensureOptionalNonEmptyString(
        recipient.receiveCurrency,
        "recipient.receiveCurrency"
      ),
      destinationAddress: ensureOptionalNonEmptyString(
        recipient.destinationAddress,
        "recipient.destinationAddress"
      ),
      bankAccountNumber: ensureOptionalNonEmptyString(
        recipient.bankAccountNumber,
        "recipient.bankAccountNumber"
      ),
      bankCode: ensureOptionalNonEmptyString(
        recipient.bankCode,
        "recipient.bankCode"
      ),
      mobileMoneyNumber: ensureOptionalNonEmptyString(
        recipient.mobileMoneyNumber,
        "recipient.mobileMoneyNumber"
      ),
      payoutMethod: ensureOptionalNonEmptyString(
        recipient.payoutMethod,
        "recipient.payoutMethod"
      ),
      relationship: ensureOptionalNonEmptyString(
        recipient.relationship,
        "recipient.relationship"
      ),
      status: ensureOptionalNonEmptyString(recipient.status, "recipient.status"),
      metadata: normalizeMetadata(recipient.metadata),
    },
    metadata: normalizeMetadata(body.metadata),
  };

  return payload;
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

function extractUpstreamErrorMessage(body, fallbackMessage) {
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

function withRuntimeContext(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return {
      result,
      transferMode: getRuntimeConfig().transferMode,
      settlementProvider: getRuntimeConfig().settlementProvider,
      provider: getRuntimeConfig().settlementProvider,
      xrplNetwork: getRuntimeConfig().xrplNetwork,
    };
  }

  return {
    ...result,
    transferMode: getRuntimeConfig().transferMode,
    settlementProvider: getRuntimeConfig().settlementProvider,
    provider: getRuntimeConfig().settlementProvider,
    xrplNetwork: getRuntimeConfig().xrplNetwork,
  };
}

export default async function handler(req, res) {
  try {
    assertMethod(req, res, ["GET", "POST"]);

    if (req.method === "GET") {
      assertProductionContextFromQuery(req.query || {});

      const response = await fetch(buildRecipientsUrl(req.query || {}), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const upstreamBody = await parseUpstreamResponse(response);

      if (!response.ok) {
        throw createHttpError(
          response.status,
          extractUpstreamErrorMessage(
            upstreamBody,
            `[recipients] Upstream GET failed: ${response.status} ${response.statusText}`
          ),
          upstreamBody
        );
      }

      return sendJson(res, 200, withRuntimeContext(upstreamBody));
    }

    const body = getJsonBody(req);
    assertProductionContextFromBody(body);

    const response = await fetch(buildRecipientsUrl(req.query || {}), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildCreateOrUpdatePayload(body)),
    });

    const upstreamBody = await parseUpstreamResponse(response);

    if (!response.ok) {
      throw createHttpError(
        response.status,
        extractUpstreamErrorMessage(
          upstreamBody,
          `[recipients] Upstream POST failed: ${response.status} ${response.statusText}`
        ),
        upstreamBody
      );
    }

    return sendJson(res, 200, withRuntimeContext(upstreamBody));
  } catch (error) {
    return sendError(res, error);
  }
}
