import { getRequestUser, readJson, requireMethod, sendJson } from "./_lib/http.js";
import { createTransfer } from "./_lib/transferService.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  try {
    const body = await readJson(request);
    const user = getRequestUser(request);
    const transferResult = await createTransfer({ user, ...body });
    sendJson(response, transferResult.status === "blocked" ? 422 : 201, transferResult);
  } catch (error) {
    sendJson(response, error.code === "invalid_json" ? 400 : 500, {
      error: error.code || "transfer_failed",
      message: error.message
    });
  }
}
