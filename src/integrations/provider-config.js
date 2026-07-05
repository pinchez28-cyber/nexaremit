// src/integrations/provider-config.js

import { getClientRuntimeEnv } from "../lib/env.js";

const env = getClientRuntimeEnv(import.meta.env);

export const providerConfig = Object.freeze({
  mode: env.transferMode,
  transferMode: env.transferMode,
  apiBaseUrl: env.apiBaseUrl,
  stripePublishableKey: env.stripePublishableKey,
  settlementProvider: env.settlementProvider,
  provider: env.settlementProvider,
  xrplNetwork: env.xrplNetwork,
  network: env.xrplNetwork,
});

export function getProviderConfig() {
  return providerConfig;
}

export default providerConfig;
