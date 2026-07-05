// api/sanctions/screen-transfer.js

import {
  createProxyRouteHandler,
  getBackendRuntimeConfig,
  ensurePlainObject,
} from "../_lib/providerGateway.js";

const config = getBackendRuntimeConfig();

export default createProxyRouteHandler({
  routeName: "sanctions/screen-transfer",
  upstreamUrl: config.sanctionsScreenTransferUrl,
  validate(body) {
    ensurePlainObject(body.sender, "sender");
    ensurePlainObject(body.recipient, "recipient");
  },
});
