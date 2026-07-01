import { getRequestUser, readJson, requireMethod, sendJson } from "./_lib/http.js";
import { createTransferQuote } from "./_lib/transferService.js";
import { getStripe, toStripeAmount } from "./_lib/stripeClient.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  try {
    const body = await readJson(request);
    const user = getRequestUser(request);
    const quote = await createTransferQuote({ user, ...body });

    if (!quote.safety.passed) {
      sendJson(response, 422, {
        error: "transfer_blocked",
        message: quote.safety.failures?.join(" ") || "Transfer blocked by safety checks.",
        safety: quote.safety,
        providers: quote.providers
      });
      return;
    }

    const stripe = getStripe();
    if (!stripe) {
      sendJson(response, 503, {
        error: "stripe_not_configured",
        message: "Stripe is not configured for this deployment.",
        mode: process.env.TRANSFER_MODE || "testnet",
        provider: "stripe"
      });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(quote.total, quote.currency),
      currency: quote.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      capture_method: "manual",
      metadata: {
        quoteId: quote.id,
        userId: user?.id || "anonymous",
        recipientName: body.recipient?.name || "unknown",
        transferMode: process.env.TRANSFER_MODE || "testnet"
      },
      description: `NexaRemit transfer ${quote.id}`
    });

    sendJson(response, 200, {
      mode: process.env.TRANSFER_MODE || "testnet",
      provider: "stripe",
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      quote
    });
  } catch (error) {
    sendJson(response, error.code === "invalid_json" ? 400 : 500, {
      error: error.code || "payment_intent_failed",
      message: error.message
    });
  }
}
