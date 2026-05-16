import { corridorRates } from "@/lib/transfer-pricing";

export const mockKycProvider = {
  async verifySender() {
    return {
      status: "sandbox_pass",
      level: "basic",
      message: "Mock identity check passed. Replace with a licensed KYC provider."
    };
  }
};

export const mockSanctionsProvider = {
  async screenTransfer({ recipient }) {
    const needsReview = recipient?.risk === "Review required";
    return {
      status: needsReview ? "manual_review" : "clear",
      message: needsReview ? "Receiver requires manual compliance review." : "No mock sanctions match found."
    };
  }
};

export const mockFundingProvider = {
  async estimateFunding({ amount = 0, currency = "USD" }) {
    const numericAmount = Number(amount || 0);
    return {
      method: "Card or bank transfer",
      fee: numericAmount > 0 ? Math.max(2.99, numericAmount * 0.012) : 0,
      status: "ready",
      currency
    };
  }
};

export const mockExchangeProvider = {
  async quote({ amount = 0, currency = "USD", recipient }) {
    const numericAmount = Number(amount || 0);
    const receiveCurrency = recipient?.receiveCurrency || "NGN";
    const rate = corridorRates[currency]?.[receiveCurrency] || recipient?.exchangeRate || 1;
    return {
      rate,
      receiveCurrency,
      receivedAmount: numericAmount * rate,
      expiresInSeconds: 60,
      provider: "Mock FX table"
    };
  }
};

export const mockSettlementProvider = {
  async prepareSettlement({ currency, recipient }) {
    return {
      rail: "XRPL-compatible settlement adapter",
      asset: currency === "USD" ? "USD stablecoin or XRP bridge" : `${currency} treasury balance`,
      status: "sandbox_ready",
      note: `Prepared mock settlement for ${recipient?.country || "receiver country"}.`
    };
  }
};

export const mockPayoutProvider = {
  async estimatePayout({ recipient }) {
    return {
      method: recipient?.method || "Bank transfer",
      deliveryEstimate: recipient?.deliveryEstimate || "Within 1 business day",
      status: "sandbox_ready"
    };
  }
};
