// api/exchange/quote.js

import {
  createProxyRouteHandler,
  getBackendRuntimeConfig,
  ensurePositiveNumberLike,
  ensureNonEmptyString,
} from "../_lib/providerGateway.js";

const config = getBackendRuntimeConfig();

export default createProxyRouteHandler({
  routeName: "exchange/quote",
  upstreamUrl: config.exchangeQuoteUrl,
  validate(body) {
    ensurePositiveNumberLike(body.sourceAmount, "sourceAmount");
    ensureNonEmptyString(body.sourceCurrency, "sourceCurrency");
    ensureNonEmptyString(body.destinationCurrency, "destinationCurrency");
  },
});
