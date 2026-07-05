// api/funding/estimate.js

import {
  createProxyRouteHandler,
  getBackendRuntimeConfig,
  ensurePositiveNumberLike,
  ensureNonEmptyString,
} from "../../src/server/_lib/providerGateway.js";

const config = getBackendRuntimeConfig();

export default createProxyRouteHandler({
  routeName: "funding/estimate",
  upstreamUrl: config.fundingEstimateUrl,
  validate(body) {
    ensurePositiveNumberLike(body.sourceAmount, "sourceAmount");
    ensureNonEmptyString(body.sourceCurrency, "sourceCurrency");
  },
});

