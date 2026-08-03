// src/integrations/transfer-orchestrator.js

import { getProviderConfig } from "./provider-config.js";

const PRODUCTION_MODE = "production";
const PRODUCTION_SETTLEMENT_PROVIDER = "xrpl-mainnet";
const PRODUCTION_XRPL_NETWORK = "mainnet";

const PRODUCTION_ENDPOINTS = Object.freeze({
  verifySender: "/api/kyc/verify-sender",
  screenTransfer: "/api/sanctions/screen-transfer",
  estimateFunding: "/api/funding/estimate",
  quoteExchange: "/api/exchange/quote",
  estimatePayout: "/api/payout/estimate",
  prepareSettlement: "/api/settlement/prepare",
  submitSignedSettlement: "/api/settlement/submit-signed",
  submitAndWaitSignedSettlement: "/api/settlement/submit-and-wait",
});

function assertProductionProviderConfig(config) {
  if (!config || typeof config !== "object") {
    throw new Error("[transfer-orchestrator] providerConfig is required");
  }

  if (config.mode !== PRODUCTION_MODE || config.transferMode !== PRODUCTION_MODE) {
    throw new Error(
      `[transfer-orchestrator] Invalid transfer mode. Expected "${PRODUCTION_MODE}", received mode="${config.mode}" transferMode="${config.transferMode}"`
    );
  }

  if (config.settlementProvider !== PRODUCTION_SETTLEMENT_PROVIDER) {
    throw new Error(
      `[transfer-orchestrator] Invalid settlement provider. Expected "${PRODUCTION_SETTLEMENT_PROVIDER}", received "${config.settlementProvider}"`
    );
  }

  if (config.provider !== PRODUCTION_SETTLEMENT_PROVIDER) {
    throw new Error(
      `[transfer-orchestrator] Invalid provider alias. Expected "${PRODUCTION_SETTLEMENT_PROVIDER}", received "${config.provider}"`
    );
  }

  if (config.xrplNetwork !== PRODUCTION_XRPL_NETWORK || config.network !== PRODUCTION_XRPL_NETWORK) {
    throw new Error(
      `[transfer-orchestrator] Invalid XRPL network. Expected "${PRODUCTION_XRPL_NETWORK}", received xrplNetwork="${config.xrplNetwork}" network="${config.network}"`
    );
  }

  if (typeof config.apiBaseUrl !== "string" || !config.apiBaseUrl.trim()) {
    throw new Error("[transfer-orchestrator] providerConfig.apiBaseUrl is required");
  }

  if (!/^https:\/\//i.test(config.apiBaseUrl)) {
    throw new Error(
      `[transfer-orchestrator] providerConfig.apiBaseUrl must be HTTPS. Received: ${config.apiBaseUrl}`
    );
  }

  return Object.freeze({ ...config });
}

// Validation is deferred: running it at module scope would throw during
// import and blank the whole app if any VITE_ variable is misconfigured.
let _runtimeConfig = null;
function runtimeConfigRef() {
  if (!_runtimeConfig) {
    _runtimeConfig = assertProductionProviderConfig(getProviderConfig());
  }
  return _runtimeConfig;
}

function trimString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`[transfer-orchestrator] ${fieldName} must be an object`);
  }
  return value;
}

function ensureNonEmptyString(value, fieldName) {
  const normalized = trimString(value);
  if (!normalized) {
    throw new Error(`[transfer-orchestrator] ${fieldName} is required`);
  }
  return normalized;
}

function ensurePositiveNumberLike(value, fieldName) {
  if (value == null || value === "") {
    throw new Error(`[transfer-orchestrator] ${fieldName} is required`);
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(
      `[transfer-orchestrator] ${fieldName} must be a positive number. Received: ${value}`
    );
  }

  return value;
}

function joinUrl(baseUrl, path) {
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

function getEndpointUrl(endpointPath) {
  return joinUrl(runtimeConfigRef().apiBaseUrl, endpointPath);
}

async function parseResponseBody(response) {
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

function extractErrorMessage(responseBody, fallbackMessage) {
  if (!responseBody) return fallbackMessage;

  if (typeof responseBody === "string" && responseBody.trim()) {
    return responseBody.trim();
  }

  if (typeof responseBody === "object") {
    const message =
      responseBody.message ||
      responseBody.error ||
      responseBody.details ||
      responseBody.title;

    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  return fallbackMessage;
}

async function requestJson(endpointPath, { method = "POST", body, headers = {}, signal } = {}) {
  const url = getEndpointUrl(endpointPath);

  const response = await fetch(url, {
    method,
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    },
    body: body == null ? undefined : JSON.stringify(body),
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = extractErrorMessage(
      responseBody,
      `[transfer-orchestrator] Request failed: ${response.status} ${response.statusText}`
    );

    const error = new Error(message);
    error.status = response.status;
    error.statusText = response.statusText;
    error.url = url;
    error.responseBody = responseBody;
    throw error;
  }

  return responseBody;
}

function withRuntimeContext(payload = {}) {
  return {
    ...payload,
    provider: runtimeConfigRef().settlementProvider,
    settlementProvider: runtimeConfigRef().settlementProvider,
    xrplNetwork: runtimeConfigRef().xrplNetwork,
    transferMode: runtimeConfigRef().transferMode,
  };
}

function pickFirstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
}

function normalizeSettlementInput(input, quoteResult, payoutResult) {
  const sourceAddress = ensureNonEmptyString(
    input.sourceAddress ?? input.walletAddress ?? input.account,
    "sourceAddress"
  );

  const destinationAddress = ensureNonEmptyString(
    input.destinationAddress ?? input.settlementAddress ?? input.recipientAddress,
    "destinationAddress"
  );

  const amountDrops = pickFirstDefined(
    input.amountDrops,
    quoteResult?.settlementAmountDrops,
    quoteResult?.destinationAmountDrops,
    quoteResult?.amountDrops,
    payoutResult?.settlementAmountDrops,
    payoutResult?.amountDrops
  );

  const amountXrp = pickFirstDefined(
    input.amountXrp,
    quoteResult?.settlementAmountXrp,
    quoteResult?.destinationAmountXrp,
    quoteResult?.amountXrp,
    payoutResult?.settlementAmountXrp,
    payoutResult?.amountXrp
  );

  if (amountDrops == null && amountXrp == null) {
    throw new Error(
      "[transfer-orchestrator] Settlement amount is required. Provide amountDrops or amountXrp, or return one from the quote/payout API."
    );
  }

  return {
    sourceAddress,
    destinationAddress,
    amountDrops,
    amountXrp,
    memo: input.memo,
    destinationTag: input.destinationTag,
    feeDrops: input.feeDrops,
    lastLedgerSequence: input.lastLedgerSequence,
  };
}

export function getTransferEnvironment() {
  return Object.freeze({
    mode: runtimeConfigRef().mode,
    transferMode: runtimeConfigRef().transferMode,
    apiBaseUrl: runtimeConfigRef().apiBaseUrl,
    settlementProvider: runtimeConfigRef().settlementProvider,
    provider: runtimeConfigRef().provider,
    xrplNetwork: runtimeConfigRef().xrplNetwork,
    network: runtimeConfigRef().network,
    stripePublishableKey: runtimeConfigRef().stripePublishableKey,
  });
}

export async function verifySender(input, options = {}) {
  ensureObject(input, "verifySender input");

  const payload = withRuntimeContext({
    ...input,
    sender: ensureObject(input.sender, "sender"),
  });

  return requestJson(PRODUCTION_ENDPOINTS.verifySender, {
    body: payload,
    signal: options.signal,
  });
}

export async function screenTransfer(input, options = {}) {
  ensureObject(input, "screenTransfer input");

  const payload = withRuntimeContext({
    ...input,
    sender: ensureObject(input.sender, "sender"),
    recipient: ensureObject(input.recipient, "recipient"),
  });

  return requestJson(PRODUCTION_ENDPOINTS.screenTransfer, {
    body: payload,
    signal: options.signal,
  });
}

export async function estimateFunding(input, options = {}) {
  ensureObject(input, "estimateFunding input");
  ensurePositiveNumberLike(input.sourceAmount, "sourceAmount");
  ensureNonEmptyString(input.sourceCurrency, "sourceCurrency");

  const payload = withRuntimeContext(input);

  return requestJson(PRODUCTION_ENDPOINTS.estimateFunding, {
    body: payload,
    signal: options.signal,
  });
}

export async function quote(input, options = {}) {
  ensureObject(input, "quote input");
  ensurePositiveNumberLike(input.sourceAmount, "sourceAmount");
  ensureNonEmptyString(input.sourceCurrency, "sourceCurrency");
  ensureNonEmptyString(input.destinationCurrency, "destinationCurrency");

  const payload = withRuntimeContext(input);

  return requestJson(PRODUCTION_ENDPOINTS.quoteExchange, {
    body: payload,
    signal: options.signal,
  });
}

export const quoteExchange = quote;

export async function estimatePayout(input, options = {}) {
  ensureObject(input, "estimatePayout input");
  ensurePositiveNumberLike(input.sourceAmount, "sourceAmount");
  ensureNonEmptyString(input.sourceCurrency, "sourceCurrency");
  ensureNonEmptyString(input.destinationCurrency, "destinationCurrency");

  const payload = withRuntimeContext(input);

  return requestJson(PRODUCTION_ENDPOINTS.estimatePayout, {
    body: payload,
    signal: options.signal,
  });
}

export async function prepareSettlement(input, options = {}) {
  ensureObject(input, "prepareSettlement input");

  const payload = withRuntimeContext({
    ...input,
    sourceAddress: ensureNonEmptyString(input.sourceAddress, "sourceAddress"),
    destinationAddress: ensureNonEmptyString(input.destinationAddress, "destinationAddress"),
  });

  return requestJson(PRODUCTION_ENDPOINTS.prepareSettlement, {
    body: payload,
    signal: options.signal,
  });
}

export async function submitSignedSettlement(input, options = {}) {
  ensureObject(input, "submitSignedSettlement input");

  const payload = withRuntimeContext({
    ...input,
    signedTransaction: ensureNonEmptyString(
      input.signedTransaction,
      "signedTransaction"
    ),
  });

  return requestJson(PRODUCTION_ENDPOINTS.submitSignedSettlement, {
    body: payload,
    signal: options.signal,
  });
}

export async function submitAndWaitSignedSettlement(input, options = {}) {
  ensureObject(input, "submitAndWaitSignedSettlement input");

  const payload = withRuntimeContext({
    ...input,
    signedTransaction: ensureNonEmptyString(
      input.signedTransaction,
      "signedTransaction"
    ),
  });

  return requestJson(PRODUCTION_ENDPOINTS.submitAndWaitSignedSettlement, {
    body: payload,
    signal: options.signal,
  });
}

export async function buildTransferPlan(input, options = {}) {
  ensureObject(input, "buildTransferPlan input");
  ensureObject(input.sender, "sender");
  ensureObject(input.recipient, "recipient");
  ensurePositiveNumberLike(input.sourceAmount, "sourceAmount");
  ensureNonEmptyString(input.sourceCurrency, "sourceCurrency");
  ensureNonEmptyString(input.destinationCurrency, "destinationCurrency");

  const verification = await verifySender(
    {
      sender: input.sender,
      corridor: input.corridor,
      metadata: input.metadata,
    },
    options
  );

  const sanctions = await screenTransfer(
    {
      sender: input.sender,
      recipient: input.recipient,
      sourceAmount: input.sourceAmount,
      sourceCurrency: input.sourceCurrency,
      destinationCurrency: input.destinationCurrency,
      corridor: input.corridor,
      payoutMethod: input.payoutMethod,
      metadata: input.metadata,
    },
    options
  );

  const funding = await estimateFunding(
    {
      sender: input.sender,
      sourceAmount: input.sourceAmount,
      sourceCurrency: input.sourceCurrency,
      paymentMethod: input.paymentMethod,
      corridor: input.corridor,
      metadata: input.metadata,
    },
    options
  );

  const exchangeQuote = await quote(
    {
      sender: input.sender,
      recipient: input.recipient,
      sourceAmount: input.sourceAmount,
      sourceCurrency: input.sourceCurrency,
      destinationCurrency: input.destinationCurrency,
      corridor: input.corridor,
      payoutMethod: input.payoutMethod,
      metadata: input.metadata,
    },
    options
  );

  const payout = await estimatePayout(
    {
      sender: input.sender,
      recipient: input.recipient,
      sourceAmount: input.sourceAmount,
      sourceCurrency: input.sourceCurrency,
      destinationCurrency: input.destinationCurrency,
      payoutMethod: input.payoutMethod,
      quoteId:
        input.quoteId ||
        exchangeQuote?.quoteId ||
        exchangeQuote?.id,
      corridor: input.corridor,
      metadata: input.metadata,
    },
    options
  );

  const settlementInput = normalizeSettlementInput(input, exchangeQuote, payout);

  const settlement = await prepareSettlement(
    {
      ...settlementInput,
      transferId:
        input.transferId ||
        exchangeQuote?.transferId ||
        payout?.transferId,
      quoteId:
        input.quoteId ||
        exchangeQuote?.quoteId ||
        exchangeQuote?.id,
      sender: input.sender,
      recipient: input.recipient,
      metadata: input.metadata,
    },
    options
  );

  return Object.freeze({
    environment: getTransferEnvironment(),
    verification,
    sanctions,
    funding,
    quote: exchangeQuote,
    payout,
    settlement,
  });
}

const transferOrchestrator = Object.freeze({
  name: "production-transfer-orchestrator",
  environment: getTransferEnvironment,
  verifySender,
  screenTransfer,
  estimateFunding,
  quote,
  quoteExchange,
  estimatePayout,
  prepareSettlement,
  submitSignedSettlement,
  submitAndWaitSignedSettlement,
  buildTransferPlan,
});

export default transferOrchestrator;
