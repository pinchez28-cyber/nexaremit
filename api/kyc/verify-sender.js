// api/kyc/verify-sender.js

import {
  createProxyRouteHandler,
  ensurePlainObject,
} from "../../src/server/_lib/providerGateway.js";

export default createProxyRouteHandler({
  routeName: "kyc/verify-sender",
  upstreamUrlKey: "kycVerifySenderUrl",
  validate(body) {
    ensurePlainObject(body.sender, "sender");
  },
});
