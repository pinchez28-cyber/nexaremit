import { createAuditEvent } from "./audit.js";
import { providerRegistry } from "./providerRegistry.js";
import { assessTransferRisk } from "./riskRecords.js";
import { runTransferSafetyChecks } from "./safetyEngine.js";
import { getStripe, toStripeAmount } from "./stripeClient.js";
import { submitXrplSettlement } from "./xrplSettlement.js";

function nowIso() {
  return new Date().toISOString();
}

function createTransferId() {
  return `transfer_${Date.now()}`;
}

function createTransferReference() {
  return `NX-${Date.now().toString().slice(-8)}`;
}

function isAuthorizedStripeStatus(status) {
  return status === "succeeded" || status === "requires_capture";
}

async function verifyStripeFundingAuthorization({ quote, paymentMethod }) {
  if (!paymentMethod) {
    return {
      authorized: false,
      provider: "stripe",
      paymentIntentId: "",
      paymentStatus: "missing",
      reason: "Payment method is required."
    };
  }

  if (paymentMethod.provider !== "stripe") {
    return {
      authorized: false,
      provider: paymentMethod.provider || "unknown",
      paymentIntentId: paymentMethod.paymentIntentId || "",
      paymentStatus: "unsupported_provider",
      reason: "Only Stripe payment authorization is supported."
    };
  }

  if (!paymentMethod.paymentIntentId) {
    return {
      authorized: false,
      provider: "stripe",
      paymentIntentId: "",
      paymentStatus: "missing",
      reason: "Stripe PaymentIntent ID is required."
    };
  }

  const stripe = getStripe();
  if (!stripe) {
    return {
      authorized: false,
      provider: "stripe",
      paymentIntentId: paymentMethod.paymentIntentId,
      paymentStatus: "stripe_not_configured",
      reason: "Stripe is not configured on the server."
    };
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentMethod.paymentIntentId);

    if (!intent) {
      return {
        authorized: false,
        provider: "stripe",
        paymentIntentId: paymentMethod.paymentIntentId,
        paymentStatus: "not_found",
        reason: "Stripe PaymentIntent was not found."
      };
    }

    const expectedAmount = toStripeAmount(quote.total, quote.currency);
    const expectedCurrency = String(quote.currency || "USD").toLowerCase();
    const actualCurrency = String(intent.currency || "").toLowerCase();

    if (intent.amount !== expectedAmount) {
      return {
        authorized: false,
        provider: "stripe",
        paymentIntentId: intent.id,
        paymentStatus: intent.status,
        reason: `Stripe PaymentIntent amount mismatch. Expected ${expectedAmount}, received ${intent.amount}.`
      };
    }

    if (actualCurrency !== expectedCurrency) {
      return {
        authorized: false,
        provider: "stripe",
        paymentIntentId: intent.id,
        paymentStatus: intent.status,
        reason: `Stripe PaymentIntent currency mismatch. Expected ${expectedCurrency}, received ${actualCurrency}.`
      };
    }

    if (!isAuthorizedStripeStatus(intent.status)) {
      return {
        authorized: false,
        provider: "stripe",
        paymentIntentId: intent.id,
        paymentStatus: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        reason: `Stripe PaymentIntent is not authorized yet. Current status: ${intent.status}.`
      };
    }

    return {
      authorized: true,
      provider: "stripe",
      paymentIntentId: intent.id,
      paymentStatus: intent.status,
      amount: intent.amount,
      currency: intent.currency
    };
  } catch (error) {
    return {
      authorized: false,
      provider: "stripe",
      paymentIntentId: paymentMethod.paymentIntentId,
      paymentStatus: "retrieve_failed",
      reason: error.message
    };
  }
}

function mergeFundingProvider(quote, fundingAuthorization) {
  return {
    ...quote,
    providers: {
      ...quote.providers,
      funding: {
        ...quote.providers.funding,
        provider: fundingAuthorization.provider || quote.providers.funding?.provider || "stripe",
        status: fundingAuthorization.authorized ? "authorized" : "requires_authorization",
        paymentIntentId: fundingAuthorization.paymentIntentId || "",
        paymentStatus: fundingAuthorization.paymentStatus || "missing",
        authorizationReason: fundingAuthorization.reason || ""
      }
    }
  };
}

function mergeSettlementProvider(quote, settlement) {
  return {
    ...quote,
    providers: {
      ...quote.providers,
      settlement
    }
  };
}

function mapSettlementToTransferStatus(settlementStatus) {
  if (settlementStatus === "confirmed") return "confirmed";
  if (settlementStatus === "submitted") return "submitted";
  if (settlementStatus === "prepared") return "funding_authorized";
  return "settlement_failed";
}

export async function createTransferQuote({ user, amount, currency = "USD", recipient, purpose }) {
  const receiveCurrency = recipient?.receiveCurrency || "NGN";

  const [kyc, sanctions, funding, quote, settlement, payout] = await Promise.all([
    providerRegistry.verifyKyc({ user }),
    providerRegistry.screenSanctions({ user, recipient }),
    providerRegistry.createFundingIntent({ amount, currency }),
    providerRegistry.createExchangeQuote({ amount, currency, receiveCurrency }),
    providerRegistry.prepareSettlement({ amount, currency, receiveCurrency, recipient }),
    providerRegistry.createPayoutIntent({ recipient, receiveCurrency })
  ]);

  const risk = await assessTransferRisk({ user, amount, currency, recipient, kyc, sanctions });
  const fee = Number(amount || 0) > 0 ? Math.max(2.99, Number(amount) * 0.012) : 0;
  const safety = runTransferSafetyChecks({
    user,
    amount,
    currency,
    recipient,
    quote,
    kyc,
    sanctions,
    risk: risk.record
  });

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
      risk: risk.record,
      funding,
      exchange: quote,
      settlement,
      payout
    },
    audit: createAuditEvent({
      action: "quote.created",
      user,
      status: safety.passed ? "passed" : "blocked"
    })
  };
}

export async function createTransfer({
  user,
  amount,
  currency,
  recipient,
  purpose,
  quoteId,
  paymentMethod
}) {
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

  const transferId = createTransferId();
  const reference = createTransferReference();

  const fundingAuthorization = await verifyStripeFundingAuthorization({ quote, paymentMethod });
  const quoteWithFunding = mergeFundingProvider(quote, fundingAuthorization);

  if (!fundingAuthorization.authorized) {
    return {
      status: "requires_payment_authorization",
      quote: quoteWithFunding,
      transfer: {
        id: transferId,
        quoteId: quoteId || quote.id,
        reference,
        status: "awaiting_funding_authorization",
        paymentIntentId: fundingAuthorization.paymentIntentId || "",
        paymentStatus: fundingAuthorization.paymentStatus || "missing",
        nextAction: "Complete or confirm the Stripe PaymentIntent before settlement.",
        createdAt: nowIso()
      },
      audit: createAuditEvent({
        action: "transfer.created",
        user,
        status: "requires_payment_authorization",
        metadata: {
          paymentIntentId: fundingAuthorization.paymentIntentId || "",
          paymentStatus: fundingAuthorization.paymentStatus || "missing",
          reason: fundingAuthorization.reason || ""
        }
      })
    };
  }

  const settlement = await submitXrplSettlement({
    amount: quote.amount,
    currency: quote.currency,
    receiveCurrency: quote.receiveCurrency,
    recipient,
    reference
  });

  const quoteWithSettlement = mergeSettlementProvider(quoteWithFunding, settlement);
  const transferStatus = mapSettlementToTransferStatus(settlement.status);

  return {
    status: transferStatus,
    quote: quoteWithSettlement,
    transfer: {
      id: transferId,
      quoteId: quoteId || quote.id,
      reference,
      status: transferStatus,
      paymentIntentId: fundingAuthorization.paymentIntentId,
      paymentStatus: fundingAuthorization.paymentStatus,
      transactionHash: settlement.transactionHash || "",
      ledgerIndex: settlement.ledgerIndex || null,
      explorerUrl: settlement.explorerUrl || "",
      nextAction:
        transferStatus === "confirmed"
          ? "Transfer confirmed on XRPL."
          : transferStatus === "submitted"
            ? "Track XRPL confirmation on the ledger explorer."
            : transferStatus === "funding_authorized"
              ? "Funding is authorized; submit settlement when enabled."
              : "Review settlement error details and retry.",
      createdAt: nowIso()
    },
    audit: createAuditEvent({
      action: "transfer.created",
      user,
      status: transferStatus,
      metadata: {
        paymentIntentId: fundingAuthorization.paymentIntentId,
        paymentStatus: fundingAuthorization.paymentStatus,
        transactionHash: settlement.transactionHash || "",
        settlementStatus: settlement.status || "unknown"
      }
    })
  };
}
