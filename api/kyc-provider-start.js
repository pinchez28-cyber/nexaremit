// api/kyc-provider-start.js

import {
  normalizeTransferMode,
  requireEnum,
  requireEnv,
  requireUrl,
} from "../src/lib/env.js";

const runtimeConfig = Object.freeze({
  transferMode: normalizeTransferMode(process.env, "TRANSFER_MODE"),
  settlementProvider: requireEnum(process.env, "SETTLEMENT_PROVIDER", [
    "xrpl-mainnet",
  ]),
  xrplNetwork: requireEnum(process.env, "XRPL_NETWORK", ["mainnet"]),
  personaApiKey: requireEnv(process.env, "PERSONA_API_KEY"),
  personaTemplateId: requireEnv(process.env, "PERSONA_TEMPLATE_ID"),
  personaCreateInquiryUrl: requireUrl(
    process.env,
    "PERSONA_CREATE_INQUIRY_URL",
    ["https:"]
  ),
});

function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details !== undefined) error.details = details;
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

function assertProductionContext(body) {
  if (body.transferMode !== undefined) {
    const raw = ensureNonEmptyString(body.transferMode, "transferMode").toLowerCase();
    const normalized = raw === "live" ? "production" : raw;
    if (normalized !== runtimeConfig.transferMode) {
      throw createHttpError(
        400,
        `Invalid transferMode. Expected "${runtimeConfig.transferMode}", received "${body.transferMode}"`
      );
    }
  }

  if (body.settlementProvider !== undefined) {
    if (body.settlementProvider !== runtimeConfig.settlementProvider) {
      throw createHttpError(
        400,
        `Invalid settlementProvider. Expected "${runtimeConfig.settlementProvider}", received "${body.settlementProvider}"`
      );
    }
  }

  if (body.provider !== undefined) {
    if (body.provider !== runtimeConfig.settlementProvider) {
      throw createHttpError(
        400,
        `Invalid provider. Expected "${runtimeConfig.settlementProvider}", received "${body.provider}"`
      );
    }
  }

  if (body.xrplNetwork !== undefined) {
    if (body.xrplNetwork !== runtimeConfig.xrplNetwork) {
      throw createHttpError(
        400,
        `Invalid xrplNetwork. Expected "${runtimeConfig.xrplNetwork}", received "${body.xrplNetwork}"`
      );
    }
  }
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

function buildPersonaPayload(body) {
  const user = ensurePlainObject(body.user, "user");

  const nameFirst = ensureOptionalNonEmptyString(
    user.firstName ?? user.first_name,
    "user.firstName"
  );
  const nameLast = ensureOptionalNonEmptyString(
    user.lastName ?? user.last_name,
    "user.lastName"
  );
  const email = ensureOptionalNonEmptyString(user.email, "user.email");

  return {
    data: {
      type: "inquiry",
      attributes: {
        "inquiry-template-id": runtimeConfig.personaTemplateId,
        referenceId: ensureOptionalNonEmptyString(
          body.referenceId ?? user.id,
          "referenceId"
        ),
        redirectUri: ensureOptionalNonEmptyString(
          body.redirectUrl,
          "redirectUrl"
        ),
        fields: {
          nameFirst,
          nameLast,
          email,
        },
        metadata: {
          transferMode: runtimeConfig.transferMode,
          settlementProvider: runtimeConfig.settlementProvider,
          xrplNetwork: runtimeConfig.xrplNetwork,
          ...(normalizeMetadata(body.metadata) || {}),
        },
      },
    },
  };
}

export default async function handler(req, res) {
  try {
    assertMethod(req, res, ["POST"]);

    const body = getJsonBody(req);
    assertProductionContext(body);

    const response = await fetch(runtimeConfig.personaCreateInquiryUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${runtimeConfig.personaApiKey}`,
      },
      body: JSON.stringify(buildPersonaPayload(body)),
    });

    const upstreamBody = await parseUpstreamResponse(response);

    if (!response.ok) {
      throw createHttpError(
        response.status,
        extractUpstreamErrorMessage(
          upstreamBody,
          `[kyc-provider-start] Upstream request failed: ${response.status} ${response.statusText}`
        ),
        upstreamBody
      );
    }

    return sendJson(res, 200, {
      ...(typeof upstreamBody === "object" && upstreamBody !== null
        ? upstreamBody
        : { result: upstreamBody }),
      transferMode: runtimeConfig.transferMode,
      settlementProvider: runtimeConfig.settlementProvider,
      provider: runtimeConfig.settlementProvider,
      xrplNetwork: runtimeConfig.xrplNetwork,
    });
  } catch (error) {
    return sendError(res, error);
  }
}
