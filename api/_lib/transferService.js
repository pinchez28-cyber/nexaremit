import { createAuditEvent } from "./audit.js";
import { providerRegistry } from "./providerRegistry.js";
import { runTransferSafetyChecks } from "./safetyEngine.js";

export async function createTransferQuote({ user, amount, currency = "USD", recipient, purpose }) {
  const receiveCurrency = recipient?.receiveCurrency || "NGN";
  const [kyc, sanctions, funding, quote, settlement, payout] = await Promise.all([
    providerRegistry.verifyKyc({ user }),
    providerRegistry.screenSanctions({ recipient }),
    providerRegistry.createFundingIntent({ amount, currency }),
    providerRegistry.createExchangeQuote({ amount, currency, receiveCurrency }),
    providerRegistry.prepareSettlement({ amount, currency, receiveCurrency }),
    providerRegistry.createPayoutIntent({ recipient, receiveCurrency })
  ]);

  const fee = Number(amount || 0) > 0 ? Math.max(2.99, Number(amount) * 0.012) : 0;
  const safety = runTransferSafetyChecks({ user, amount, currency, recipient, quote, kyc });

  return {
    id: `quote_${Date.now()}`,
    mode: process.env.TRANSFER_MODE || "sandbox",
    amount: Number(amount || 0),
    currency,
    purpose,
    fee,
    total: Number(amount || 0) + fee,
    rate: quote.rate,
    receiveCurrency,
    receivedAmount: quote.receivedAmount,
    expiresAt: quote.expiresAt,
    deliveryEstimate: payout.deliveryEstimate,
    safety,
    providers: {
      kyc,
      sanctions,
      funding,
      exchange: quote,
      settlement,
      payout
    },
    audit: createAuditEvent({ action: "quote.created", user, status: safety.passed ? "passed" : "blocked" })
  };
}

export async function createTransfer({ user, amount, currency, recipient, purpose, quoteId }) {
  const quote = await createTransferQuote({ user, amount, currency, recipient, purpose });

  if (!quote.safety.passed) {
    return {
      status: "blocked",
      quote,
      transfer: null,
      audit: createAuditEvent({
        action: "transfer.blocked",
        user,
        status: "blocked",
        metadata: { failures: quote.safety.failures }
      })
    };
  }

  return {
    status: "requires_payment_authorization",
    quote,
    transfer: {
      id: `transfer_${Date.now()}`,
      quoteId: quoteId || quote.id,
      reference: `NX-${Date.now().toString().slice(-8)}`,
      status: "created_sandbox",
      nextAction: "Authorize sender funding with payment provider.",
      createdAt: new Date().toISOString()
    },
    audit: createAuditEvent({ action: "transfer.created", user, status: "requires_payment_authorization" })
  };
}
