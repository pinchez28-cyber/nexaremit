import { getRequestUser, requireMethod, sendJson } from "./_lib/http.js";
import { providerRegistry } from "./_lib/providerRegistry.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["GET"])) return;

  const user = getRequestUser(request);
  const kyc = await providerRegistry.verifyKyc({ user });
  sendJson(response, 200, { userId: user.id, kyc });
}
