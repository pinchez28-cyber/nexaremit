import { requireMethod, sendJson } from "./_lib/http.js";
import { getStripe } from "./_lib/stripeClient.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);
  const signature = request.headers["stripe-signature"];
  const stripe = getStripe();

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    sendJson(response, 202, {
      received: true,
      verified: false,
      mode: "sandbox",
      message: "Webhook received. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to verify signatures."
    });
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    sendJson(response, 200, {
      received: true,
      verified: true,
      type: event.type,
      id: event.id
    });
  } catch (error) {
    sendJson(response, 400, {
      error: "invalid_webhook_signature",
      message: error.message
    });
  }
}
