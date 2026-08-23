// api/exchange/quote.js

import {
  createProxyRouteHandler,
  ensurePositiveNumberLike,
  ensureNonEmptyString,
} from "../../src/server/_lib/providerGateway.js";

export default createProxyRouteHandler({
  routeName: "exchange/quote",
  upstreamUrlKey: "exchangeQuoteUrl",
  validate(body) {
    ensurePositiveNumberLike(body.sourceAmount, "sourceAmount");
    ensureNonEmptyString(body.sourceCurrency, "sourceCurrency");
    ensureNonEmptyString(body.destinationCurrency, "destinationCurrency");
  },
});
