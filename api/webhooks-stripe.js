import { requireMethod, sendJson } from "./_lib/http.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  sendJson(response, 202, {
    received: true,
    mode: "sandbox",
    message: "Stripe webhook placeholder. Production must verify Stripe-Signature before processing events."
  });
}
