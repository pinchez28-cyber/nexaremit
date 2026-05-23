import { getRequestUser, readJson, requireMethod, sendJson } from "./_lib/http.js";

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

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["GET", "DELETE"])) return;

  try {
    const user = getRequestUser(request);

    if (request.method === "GET") {
      sendJson(response, 200, {
        mode: process.env.TRANSFER_MODE || "sandbox",
        provider: "sandbox",
        userId: user.id,
        customerConfigured: false,
        methods: sandboxMethods,
        message: "Sandbox card management is active. Connect Stripe Customer records before listing real saved cards."
      });
      return;
    }

    const body = await readJson(request);
    const paymentMethodId = body.paymentMethodId || "";
    if (!paymentMethodId) {
      sendJson(response, 400, {
        error: "payment_method_required",
        message: "Choose a payment method to remove."
      });
      return;
    }

    sendJson(response, 200, {
      removed: true,
      provider: "sandbox",
      paymentMethodId,
      message: "Sandbox card removed from this page. Production removal will detach the Stripe payment method from the customer."
    });
  } catch (error) {
    sendJson(response, error.code === "invalid_json" ? 400 : 500, {
      error: error.code || "payment_methods_failed",
      message: error.message
    });
  }
}
