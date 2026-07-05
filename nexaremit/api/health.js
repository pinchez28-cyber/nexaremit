import { requireMethod, sendJson } from "./_lib/http.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["GET"])) return;

  sendJson(response, 200, {
    ok: true,
    service: "nexaremit-api",
    mode: process.env.TRANSFER_MODE || "sandbox",
    checkedAt: new Date().toISOString()
  });
}
