// api/_lib/transferService.js

import { prepareSettlement as prepareXrplSettlement } from "./xrplSettlement.js";
import { backendConfigSpec } from "./providerGateway.js";
import { lazyConfig } from "./runtimeConfig.js";

// NOTE: nothing imports this module today — providerGateway.js serves the
// routes it was written for. It reuses that module's config spec rather than
// keeping a second copy, so the two cannot drift while it stays around.
const getRuntimeConfig = lazyConfig(backendConfigSpec);

function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details !== undefined) {
    error.details = details;
  }
  return error;
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

function ensurePositiveNumberLike(value, fieldName) {
  if (value === undefined || value === null || value === "") {
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

function ensureOptionalNonEmptyString(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return ensureNonEmptyString(value, fieldName);
}

function ensureOptionalBoolean(value, fieldName) {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "boolean") {
    throw createHttpError(400, `${fieldName} must be a boolean`);
  }
  return value;
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

function pickFirstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

function parseJsonIfNeeded(body) {
  if (body == null) {
    throw createHttpError(400, "Request body is required");
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      throw createHttpError(400, "Request body must be valid JSON");
    }
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createHttpError(400, "Request body must be a JSON object");
  }

  return body;
}

function assertProductionContext(input) {
  const body = parseJsonIfNeeded(input);

  if (body.transferMode !== undefined) {
    const rawTransferMode = ensureNonEmptyString(
      body.transferMode,
      "transferMode"
    ).toLowerCase();

    const normalizedTransferMode =
      rawTransferMode === "live" ? "production" : rawTransferMode;

    if (normalizedTransferMode !== getRuntimeConfig().transferMode) {
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

  return body;
}

function withRuntimeContext(payload = {}) {
  return {
    ...payload,
    transferMode: getRuntimeConfig().transferMode,
    settlementProvider: getRuntimeConfig().settlementProvider,
    provider: getRuntimeConfig().settlementProvider,
    xrplNetwork: getRuntimeConfig().xrplNetwork,
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

async function postJson(url, payload, routeName, options = {}) {
  const response = await fetch(url, {
    method: "POST",
    signal: options.signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(payload),
  });

  const body = await parseUpstreamResponse(response);

  if (!response.ok) {
    throw createHttpError(
      response.status,
      extractUpstreamErrorMessage(
        body,
        `[transferService:${routeName}] Upstream request failed: ${response.status} ${response.statusText}`
      ),
      body
    );
  }

  return body;
}

function normalizeVerificationInput(input) {
  const body = assertProductionContext(input);

  return withRuntimeContext({
    sender: ensurePlainObject(body.sender, "sender"),
    corridor: body.corridor,
    metadata: normalizeMetadata(body.metadata),
  });
}

function normalizeSanctionsInput(input) {
  const body = assertProductionContext(input);

  return withRuntimeContext({
    sender: ensurePlainObject(body.sender, "sender"),
    recipient: ensurePlainObject(body.recipient, "recipient"),
    sourceAmount: ensurePositiveNumberLike(body.sourceAmount, "sourceAmount"),
    sourceCurrency: ensureNonEmptyString(body.sourceCurrency, "sourceCurrency"),
    destinationCurrency: ensureNonEmptyString(
      body.destinationCurrency,
      "destinationCurrency"
    ),
    payoutMethod: ensureOptionalNonEmptyString(
      body.payoutMethod,
      "payoutMethod"
    ),
    corridor: body.corridor,
    metadata: normalizeMetadata(body.metadata),
  });
}

function normalizeFundingInput(input) {
  const body = assertProductionContext(input);

  return withRuntimeContext({
    sender: body.sender ? ensurePlainObject(body.sender, "sender") : undefined,
    sourceAmount: ensurePositiveNumberLike(body.sourceAmount, "sourceAmount"),
    sourceCurrency: ensureNonEmptyString(body.sourceCurrency, "sourceCurrency"),
    paymentMethod: ensureOptionalNonEmptyString(
      body.paymentMethod,
      "paymentMethod"
    ),
    corridor: body.corridor,
    metadata: normalizeMetadata(body.metadata),
  });
}

function normalizeQuoteInput(input) {
  const body = assertProductionContext(input);

  return withRuntimeContext({
    sender: body.sender ? ensurePlainObject(body.sender, "sender") : undefined,
    recipient: body.recipient
      ? ensurePlainObject(body.recipient, "recipient")
      : undefined,
    sourceAmount: ensurePositiveNumberLike(body.sourceAmount, "sourceAmount"),
    sourceCurrency: ensureNonEmptyString(body.sourceCurrency, "sourceCurrency"),
    destinationCurrency: ensureNonEmptyString(
      body.destinationCurrency,
      "destinationCurrency"
    ),
    payoutMethod: ensureOptionalNonEmptyString(
      body.payoutMethod,
      "payoutMethod"
    ),
    corridor: body.corridor,
    metadata: normalizeMetadata(body.metadata),
  });
}

function normalizePayoutInput(input) {
  const body = assertProductionContext(input);

  return withRuntimeContext({
    sender: body.sender ? ensurePlainObject(body.sender, "sender") : undefined,
    recipient: body.recipient
      ? ensurePlainObject(body.recipient, "recipient")
      : undefined,
    sourceAmount: ensurePositiveNumberLike(body.sourceAmount, "sourceAmount"),
    sourceCurrency: ensureNonEmptyString(body.sourceCurrency, "sourceCurrency"),
    destinationCurrency: ensureNonEmptyString(
      body.destinationCurrency,
      "destinationCurrency"
    ),
    payoutMethod: ensureOptionalNonEmptyString(
      body.payoutMethod,
      "payoutMethod"
    ),
    quoteId: ensureOptionalNonEmptyString(body.quoteId, "quoteId"),
    corridor: body.corridor,
    metadata: normalizeMetadata(body.metadata),
  });
}

function buildSettlementInput(input, quoteResult, payoutResult) {
  const body = assertProductionContext(input);

  const sourceAddress = ensureNonEmptyString(
    pickFirstDefined(body.sourceAddress, body.walletAddress, body.account),
    "sourceAddress"
  );

  const destinationAddress = ensureNonEmptyString(
    pickFirstDefined(
      body.destinationAddress,
      body.settlementAddress,
      body.recipientAddress
    ),
    "destinationAddress"
  );

  const amountDrops = pickFirstDefined(
    body.amountDrops,
    quoteResult?.settlementAmountDrops,
    quoteResult?.destinationAmountDrops,
    quoteResult?.amountDrops,
    payoutResult?.settlementAmountDrops,
    payoutResult?.amountDrops
  );

  const amountXrp = pickFirstDefined(
    body.amountXrp,
    quoteResult?.settlementAmountXrp,
    quoteResult?.destinationAmountXrp,
    quoteResult?.amountXrp,
    payoutResult?.settlementAmountXrp,
    payoutResult?.amountXrp
  );

  if (amountDrops === undefined && amountXrp === undefined) {
    throw createHttpError(
      400,
      "Settlement amount is required. Provide amountDrops or amountXrp, or return one from exchange/payout."
    );
  }

  return {
    sourceAddress,
    destinationAddress,
    amountDrops,
    amountXrp,
    memo: body.memo,
    destinationTag: body.destinationTag,
    feeDrops: body.feeDrops,
    lastLedgerSequence: body.lastLedgerSequence,
  };
}

export function getTransferRuntimeConfig() {
  return getRuntimeConfig();
}

export function getProviderContext() {
  return Object.freeze({
    transferMode: getRuntimeConfig().transferMode,
    settlementProvider: getRuntimeConfig().settlementProvider,
    provider: getRuntimeConfig().settlementProvider,
    xrplNetwork: getRuntimeConfig().xrplNetwork,
  });
}

export async function verifySender(input, options = {}) {
  const payload = normalizeVerificationInput(input);

  return postJson(
    getRuntimeConfig().kycVerifySenderUrl,
    payload,
    "verifySender",
    options
  );
}

export async function screenTransfer(input, options = {}) {
  const payload = normalizeSanctionsInput(input);

  return postJson(
    getRuntimeConfig().sanctionsScreenTransferUrl,
    payload,
    "screenTransfer",
    options
  );
}

export async function estimateFunding(input, options = {}) {
  const payload = normalizeFundingInput(input);

  return postJson(
    getRuntimeConfig().fundingEstimateUrl,
    payload,
    "estimateFunding",
    options
  );
}

export async function quoteExchange(input, options = {}) {
  const payload = normalizeQuoteInput(input);

  return postJson(
    getRuntimeConfig().exchangeQuoteUrl,
    payload,
    "quoteExchange",
    options
  );
}

export const quote = quoteExchange;
export const quoteTransfer = quoteExchange;
export const createQuote = quoteExchange;

export async function estimatePayout(input, options = {}) {
  const payload = normalizePayoutInput(input);

  return postJson(
    getRuntimeConfig().payoutEstimateUrl,
    payload,
    "estimatePayout",
    options
  );
}

export async function prepareSettlement(input, options = {}) {
  const body = assertProductionContext(input);

  return prepareXrplSettlement({
    sourceAddress: ensureNonEmptyString(body.sourceAddress, "sourceAddress"),
    destinationAddress: ensureNonEmptyString(
      body.destinationAddress,
      "destinationAddress"
    ),
    amountDrops: body.amountDrops,
    amountXrp: body.amountXrp,
    memo: body.memo,
    destinationTag: body.destinationTag,
    feeDrops: body.feeDrops,
    lastLedgerSequence: body.lastLedgerSequence,
    signal: options.signal,
  });
}

export async function buildTransferPlan(input, options = {}) {
  const body = assertProductionContext(input);

  ensurePlainObject(body.sender, "sender");
  ensurePlainObject(body.recipient, "recipient");
  ensurePositiveNumberLike(body.sourceAmount, "sourceAmount");
  ensureNonEmptyString(body.sourceCurrency, "sourceCurrency");
  ensureNonEmptyString(body.destinationCurrency, "destinationCurrency");

  const verification = await verifySender(
    {
      sender: body.sender,
      corridor: body.corridor,
      metadata: body.metadata,
      transferMode: getRuntimeConfig().transferMode,
      settlementProvider: getRuntimeConfig().settlementProvider,
      provider: getRuntimeConfig().settlementProvider,
      xrplNetwork: getRuntimeConfig().xrplNetwork,
    },
    options
  );

  const sanctions = await screenTransfer(
    {
      sender: body.sender,
      recipient: body.recipient,
      sourceAmount: body.sourceAmount,
      sourceCurrency: body.sourceCurrency,
      destinationCurrency: body.destinationCurrency,
      payoutMethod: body.payoutMethod,
      corridor: body.corridor,
      metadata: body.metadata,
      transferMode: getRuntimeConfig().transferMode,
      settlementProvider: getRuntimeConfig().settlementProvider,
      provider: getRuntimeConfig().settlementProvider,
      xrplNetwork: getRuntimeConfig().xrplNetwork,
    },
    options
  );

  const funding = await estimateFunding(
    {
      sender: body.sender,
      sourceAmount: body.sourceAmount,
      sourceCurrency: body.sourceCurrency,
      paymentMethod: body.paymentMethod,
      corridor: body.corridor,
      metadata: body.metadata,
      transferMode: getRuntimeConfig().transferMode,
      settlementProvider: getRuntimeConfig().settlementProvider,
      provider: getRuntimeConfig().settlementProvider,
      xrplNetwork: getRuntimeConfig().xrplNetwork,
    },
    options
  );

  const exchange = await quoteExchange(
    {
      sender: body.sender,
      recipient: body.recipient,
      sourceAmount: body.sourceAmount,
      sourceCurrency: body.sourceCurrency,
      destinationCurrency: body.destinationCurrency,
      payoutMethod: body.payoutMethod,
      corridor: body.corridor,
      metadata: body.metadata,
      transferMode: getRuntimeConfig().transferMode,
      settlementProvider: getRuntimeConfig().settlementProvider,
      provider: getRuntimeConfig().settlementProvider,
      xrplNetwork: getRuntimeConfig().xrplNetwork,
    },
    options
  );

  const payout = await estimatePayout(
    {
      sender: body.sender,
      recipient: body.recipient,
      sourceAmount: body.sourceAmount,
      sourceCurrency: body.sourceCurrency,
      destinationCurrency: body.destinationCurrency,
      payoutMethod: body.payoutMethod,
      quoteId: pickFirstDefined(body.quoteId, exchange?.quoteId, exchange?.id),
      corridor: body.corridor,
      metadata: body.metadata,
      transferMode: getRuntimeConfig().transferMode,
      settlementProvider: getRuntimeConfig().settlementProvider,
      provider: getRuntimeConfig().settlementProvider,
      xrplNetwork: getRuntimeConfig().xrplNetwork,
    },
    options
  );

  const settlementInput = buildSettlementInput(body, exchange, payout);

  const settlement = await prepareXrplSettlement({
    ...settlementInput,
    memo: pickFirstDefined(body.memo, exchange?.memo, payout?.memo),
    destinationTag: pickFirstDefined(
      body.destinationTag,
      exchange?.destinationTag,
      payout?.destinationTag
    ),
    feeDrops: pickFirstDefined(body.feeDrops, exchange?.feeDrops, payout?.feeDrops),
    lastLedgerSequence: pickFirstDefined(
      body.lastLedgerSequence,
      exchange?.lastLedgerSequence,
      payout?.lastLedgerSequence
    ),
  });

  return Object.freeze({
    provider: getRuntimeConfig().settlementProvider,
    settlementProvider: getRuntimeConfig().settlementProvider,
    xrplNetwork: getRuntimeConfig().xrplNetwork,
    transferMode: getRuntimeConfig().transferMode,
    verification,
    sanctions,
    funding,
    quote: exchange,
    payout,
    settlement,
  });
}

export async function createTransfer(input, options = {}) {
  return buildTransferPlan(input, options);
}

export async function prepareTransfer(input, options = {}) {
  return buildTransferPlan(input, options);
}

const transferService = Object.freeze({
  name: "production-transfer-service",
  getTransferRuntimeConfig,
  getProviderContext,
  verifySender,
  screenTransfer,
  estimateFunding,
  quote,
  quoteTransfer,
  quoteExchange,
  createQuote,
  estimatePayout,
  prepareSettlement,
  buildTransferPlan,
  createTransfer,
  prepareTransfer,
});

export default transferService;
