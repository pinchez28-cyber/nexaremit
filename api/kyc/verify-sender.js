// api/kyc/verify-sender.js

import {
  createProxyRouteHandler,
  getBackendRuntimeConfig,
  ensurePlainObject,
} from "../../src/server/_lib/providerGateway.js";

const config = getBackendRuntimeConfig();

export default createProxyRouteHandler({
  routeName: "kyc/verify-sender",
  upstreamUrl: config.kycVerifySenderUrl,
  validate(body) {
    ensurePlainObject(body.sender, "sender");
  },
});

