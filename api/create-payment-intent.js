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
        safety: quote.safety
      });
      return;
    }

    const stripe = getStripe();
    if (!stripe) {
      sendJson(response, 200, {
        mode: "sandbox",
        provider: "stripe-not-configured",
        clientSecret: "pi_sandbox_secret_mock",
        quote,
        message: "Add STRIPE_SECRET_KEY in Vercel to create real Stripe test PaymentIntents."
      });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(quote.total, quote.currency),
      currency: quote.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        quoteId: quote.id,
        userId: user.id,
        recipientName: body.recipient?.name || "unknown",
        transferMode: process.env.TRANSFER_MODE || "sandbox"
      },
      description: `NexaRemit sandbox transfer ${quote.id}`
    });

    sendJson(response, 200, {
      mode: process.env.TRANSFER_MODE || "sandbox",
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
