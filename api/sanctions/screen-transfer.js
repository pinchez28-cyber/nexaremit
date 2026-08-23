// api/sanctions/screen-transfer.js

import {
  createProxyRouteHandler,
  ensurePlainObject,
} from "../../src/server/_lib/providerGateway.js";

export default createProxyRouteHandler({
  routeName: "sanctions/screen-transfer",
  upstreamUrlKey: "sanctionsScreenTransferUrl",
  validate(body) {
    ensurePlainObject(body.sender, "sender");
    ensurePlainObject(body.recipient, "recipient");
  },
});
