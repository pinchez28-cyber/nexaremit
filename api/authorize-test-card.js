import { getRequestUser, readJson, requireMethod, sendJson } from "./_lib/http.js";
import { createTransferQuote } from "./_lib/transferService.js";
import { getStripe, toStripeAmount } from "./_lib/stripeClient.js";

const testCards = {
  visa: {
    id: "visa",
    label: "Visa test card ending 4242",
    paymentMethod: "pm_card_visa"
  },
  mastercard: {
    id: "mastercard",
    label: "Mastercard test card ending 4444",
    paymentMethod: "pm_card_mastercard"
  }
};

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["POST"])) return;

  try {
    const body = await readJson(request);
    const user = getRequestUser(request);
    const selectedCard = testCards[body.testCard] || testCards.visa;
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
      sendJson(response, 200, {
        mode: "sandbox",
        provider: "stripe-not-configured",
        paymentIntentId: `pi_sandbox_${selectedCard.id}_${Date.now()}`,
        paymentMethod: selectedCard,
        quote,
        message: "Sandbox test card selected. Add STRIPE_SECRET_KEY in Vercel to create Stripe test PaymentIntents."
      });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(quote.total, quote.currency),
      currency: quote.currency.toLowerCase(),
      payment_method_types: ["card"],
      payment_method: selectedCard.paymentMethod,
      confirm: true,
      metadata: {
        quoteId: quote.id,
        userId: user.id,
        recipientName: body.recipient?.name || "unknown",
        transferMode: process.env.TRANSFER_MODE || "sandbox",
        testCard: selectedCard.id
      },
      description: `NexaRemit sandbox test-card transfer ${quote.id}`
    });

    sendJson(response, 200, {
      mode: process.env.TRANSFER_MODE || "sandbox",
      provider: "stripe",
      paymentIntentId: paymentIntent.id,
      paymentMethod: selectedCard,
      status: paymentIntent.status,
      quote
    });
  } catch (error) {
    sendJson(response, error.code === "invalid_json" ? 400 : 500, {
      error: error.code || "test_card_authorization_failed",
      message: error.message
    });
  }
}
