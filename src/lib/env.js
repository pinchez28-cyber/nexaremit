// src/lib/env.js

const BLOCKED_VALUE_PATTERNS = [
  /^pk_test_/i,
  /^sk_test_/i,
  /\btestnet\b/i,
  /\bdevnet\b/i,
  /\bsandbox\b/i,
  /\bmock\b/i,
  /\bdemo\b/i,
  /altnet\.rippletest\.net/i,
  /devnet\.rippletest\.net/i,
  /testnet\.honeycluster\.io/i,
  /devnet\.honeycluster\.io/i,
  /testnet\.xrpl-labs\.com/i,
];

function readRaw(envSource, name) {
  const value = envSource?.[name];
  return typeof value === "string" ? value.trim() : "";
}

export function requireEnv(envSource, name) {
  const value = readRaw(envSource, name);

  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }

  return value;
}

export function assertProductionSafe(name, value) {
  for (const pattern of BLOCKED_VALUE_PATTERNS) {
    if (pattern.test(value)) {
      throw new Error(`[env] ${name} contains a test/sandbox value: ${value}`);
    }
  }

  return value;
}

export function requireProductionSafeEnv(envSource, name) {
  const value = requireEnv(envSource, name);
  return assertProductionSafe(name, value);
}

export function requireEnum(envSource, name, allowedValues) {
  const value = requireEnv(envSource, name);

  if (!allowedValues.includes(value)) {
    throw new Error(
      `[env] ${name} must be one of: ${allowedValues.join(", ")}. Received: ${value}`
    );
  }

  return value;
}

export function requireUrl(envSource, name, allowedProtocols = ["https:"]) {
  const value = requireProductionSafeEnv(envSource, name);

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`[env] ${name} must be a valid URL. Received: ${value}`);
  }

  if (!allowedProtocols.includes(parsed.protocol)) {
    throw new Error(
      `[env] ${name} must use one of: ${allowedProtocols.join(", ")}. Received: ${parsed.protocol}`
    );
  }

  return value;
}

export function requireLiveStripePublishableKey(
  envSource,
  name = "VITE_STRIPE_PUBLISHABLE_KEY"
) {
  const value = requireEnv(envSource, name);

  if (!/^pk_live_/i.test(value)) {
    throw new Error(
      `[env] ${name} must be a live Stripe publishable key. Received: ${value}`
    );
  }

  return value;
}

export function requireLiveStripeSecretKey(
  envSource,
  name = "STRIPE_SECRET_KEY"
) {
  const value = requireEnv(envSource, name);

  if (!/^sk_live_/i.test(value)) {
    throw new Error(
      `[env] ${name} must be a live Stripe secret key. Received: ${value}`
    );
  }

  return value;
}

export function normalizeTransferMode(envSource, name) {
  const value = requireProductionSafeEnv(envSource, name).toLowerCase();

  if (value === "production" || value === "live") {
    return "production";
  }

  throw new Error(
    `[env] ${name} must be "production" or "live". Received: ${value}`
  );
}

export function getClientRuntimeEnv(importMetaEnv) {
  return Object.freeze({
    transferMode: normalizeTransferMode(importMetaEnv, "VITE_TRANSFER_MODE"),
    apiBaseUrl: requireUrl(importMetaEnv, "VITE_API_BASE_URL", ["https:"]),
    stripePublishableKey: requireLiveStripePublishableKey(
      importMetaEnv,
      "VITE_STRIPE_PUBLISHABLE_KEY"
    ),
    settlementProvider: requireEnum(importMetaEnv, "VITE_SETTLEMENT_PROVIDER", [
      "xrpl-mainnet",
    ]),
    xrplNetwork: requireEnum(importMetaEnv, "VITE_XRPL_NETWORK", ["mainnet"]),
  });
}

export function getServerRuntimeEnv(nodeEnv) {
  return Object.freeze({
    settlementProvider: requireEnum(nodeEnv, "SETTLEMENT_PROVIDER", [
      "xrpl-mainnet",
    ]),
    xrplNetwork: requireEnum(nodeEnv, "XRPL_NETWORK", ["mainnet"]),
    xrplServerUrl: requireUrl(nodeEnv, "XRPL_SERVER_URL", ["wss:", "https:"]),
    stripeSecretKey: requireLiveStripeSecretKey(
      nodeEnv,
      "STRIPE_SECRET_KEY"
    ),
  });
}
