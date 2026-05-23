import { getRequestUser, readJson, requireMethod, sendJson } from "./_lib/http.js";
import { getStripe } from "./_lib/stripeClient.js";

const sandboxMethods = [
  {
    id: "sandbox_pm_visa_4242",
    brand: "Visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2028,
    funding: "debit",
    isDefault: true,
    source: "sandbox"
  },
  {
    id: "sandbox_pm_mastercard_4444",
    brand: "Mastercard",
    last4: "4444",
    expMonth: 9,
    expYear: 2027,
    funding: "debit",
    isDefault: false,
    source: "sandbox"
  },
  {
    id: "sandbox_pm_old_0341",
    brand: "Visa",
    last4: "0341",
    expMonth: 1,
    expYear: 2024,
    funding: "debit",
    isDefault: false,
    source: "sandbox"
  }
];

function normalizeStripeMethod(method, defaultPaymentMethodId) {
  const card = method.card || {};
  return {
    id: method.id,
    brand: card.brand ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1) : "Card",
    last4: card.last4 || "----",
    expMonth: card.exp_month || 0,
    expYear: card.exp_year || 0,
    funding: card.funding || "card",
    isDefault: method.id === defaultPaymentMethodId,
    source: "stripe"
  };
}

function getStripeCustomerId(request) {
  return request.headers["x-nexaremit-stripe-customer-id"] || process.env.STRIPE_SANDBOX_CUSTOMER_ID || "";
}

async function listStripeMethods(stripe, customerId) {
  const [customer, methods] = await Promise.all([
    stripe.customers.retrieve(customerId),
    stripe.paymentMethods.list({ customer: customerId, type: "card", limit: 20 })
  ]);

  const defaultPaymentMethodId = customer?.invoice_settings?.default_payment_method || "";
  return methods.data.map((method) => normalizeStripeMethod(method, defaultPaymentMethodId));
}

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["GET", "DELETE"])) return;

  try {
    const user = getRequestUser(request);
    const stripe = getStripe();
    const customerId = getStripeCustomerId(request);

    if (request.method === "GET") {
      if (stripe && customerId) {
        const methods = await listStripeMethods(stripe, customerId);
        sendJson(response, 200, {
          mode: process.env.TRANSFER_MODE || "sandbox",
          provider: "stripe",
          userId: user.id,
          customerConfigured: true,
          methods
        });
        return;
      }

      sendJson(response, 200, {
        mode: process.env.TRANSFER_MODE || "sandbox",
        provider: "sandbox",
        userId: user.id,
        customerConfigured: false,
        methods: sandboxMethods,
        message: "Connect a Stripe Customer record to list real saved payment methods."
      });
      return;
    }

    const body = await readJson(request);
    const paymentMethodId = body.paymentMethodId || "";
    if (!paymentMethodId) {
      sendJson(response, 400, { error: "payment_method_required", message: "Choose a payment method to remove." });
      return;
    }

    if (stripe && customerId && !paymentMethodId.startsWith("sandbox_")) {
      await stripe.paymentMethods.detach(paymentMethodId);
      sendJson(response, 200, {
        removed: true,
        provider: "stripe",
        paymentMethodId
      });
      return;
    }

    sendJson(response, 200, {
      removed: true,
      provider: "sandbox",
      paymentMethodId,
      message: "Sandbox payment method removed for this session."
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error.code || "payment_methods_failed",
      message: error.message
    });
  }
}
