import { getRequestUser, readJson, requireMethod, sendJson } from "../src/server/_lib/http.js";
import { createTransferQuote } from "../src/server/_lib/transferService.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  try {
    const body = await readJson(request);
    const user = getRequestUser(request);
    const quote = await createTransferQuote({ user, ...body });
    sendJson(response, 200, quote);
  } catch (error) {
    sendJson(response, error.code === "invalid_json" ? 400 : 500, {
      error: error.code || "quote_failed",
      message: error.message
    });
  }
}

