// src/integrations/provider-config.js

import { getClientRuntimeEnv } from "../lib/env.js";

// IMPORTANT: environment validation must NOT run at module import time.
// This module is pulled into the startup bundle, so a throw here would take
// down the entire app (blank page) instead of just the feature that needs
// provider configuration. Validation is therefore deferred until first use.

let cachedConfig = null;

function computeConfig() {
  const env = getClientRuntimeEnv(import.meta.env);

  return Object.freeze({
    mode: env.transferMode,
    transferMode: env.transferMode,
    apiBaseUrl: env.apiBaseUrl,
    stripePublishableKey: env.stripePublishableKey,
  });
}

/**
 * Returns the validated provider configuration.
 * Throws if the environment is misconfigured — call inside a component,
 * an event handler, or getProviderConfigSafe(), never at module scope.
 */
export function getProviderConfig() {
  if (!cachedConfig) {
    cachedConfig = computeConfig();
  }
  return cachedConfig;
}

/**
 * Non-throwing variant for UI that wants to render a helpful message
 * rather than crash: returns { ok, config, error }.
 */
export function getProviderConfigSafe() {
  try {
    return { ok: true, config: getProviderConfig(), error: null };
  } catch (error) {
    return { ok: false, config: null, error };
  }
}

/**
 * True when the browser environment is fully configured.
 */
export function isProviderConfigured() {
  return getProviderConfigSafe().ok;
}

export default getProviderConfig;
