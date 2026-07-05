// api/payout/estimate.js

import {
  createProxyRouteHandler,
  getBackendRuntimeConfig,
  ensurePositiveNumberLike,
  ensureNonEmptyString,
} from "../_lib/providerGateway.js";

const config = getBackendRuntimeConfig();

export default createProxyRouteHandler({
  routeName: "payout/estimate",
  upstreamUrl: config.payoutEstimateUrl,
  validate(body) {
    ensurePositiveNumberLike(body.sourceAmount, "sourceAmount");
    ensureNonEmptyString(body.sourceCurrency, "sourceCurrency");
    ensureNonEmptyString(body.destinationCurrency, "destinationCurrency");
  },
});
