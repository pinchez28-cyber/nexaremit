const sandboxRates = {
  USD: { NGN: 1650, KES: 129, GHS: 12.1 },
  GBP: { NGN: 2080, KES: 165, GHS: 15.35 },
  EUR: { NGN: 1785, KES: 141, GHS: 13.2 }
};

export const providerRegistry = {
  async verifyKyc({ user }) {
    return {
      provider: process.env.KYC_PROVIDER || "sandbox-kyc",
      status: user?.kycStatus === "approved" ? "approved" : "required",
      reference: `kyc_${user?.id || "anonymous"}`
    };
  },

  async screenSanctions({ recipient }) {
    const requiresReview = recipient?.risk === "Review required";
    return {
      provider: process.env.SANCTIONS_PROVIDER || "sandbox-screening",
      status: requiresReview ? "manual_review" : "clear",
      reference: `screen_${Date.now()}`
    };
  },

  async createFundingIntent({ amount, currency }) {
    return {
      provider: process.env.FUNDING_PROVIDER || "sandbox-funding",
      status: "requires_authorization",
      clientSecret: "sandbox_client_secret_not_for_real_money",
      amount,
      currency
    };
  },

  async createExchangeQuote({ amount, currency, receiveCurrency }) {
    const rate = sandboxRates[currency]?.[receiveCurrency] || 1;
    return {
      provider: process.env.EXCHANGE_PROVIDER || "sandbox-fx",
      rate,
      receiveCurrency,
      receivedAmount: Number(amount || 0) * rate,
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    };
  },

  async prepareSettlement({ currency, receiveCurrency }) {
    return {
      provider: process.env.SETTLEMENT_PROVIDER || "sandbox-xrpl-compatible",
      rail: "XRPL-compatible adapter",
      asset: currency === "USD" ? "USD stablecoin or XRP bridge" : `${currency}/${receiveCurrency} treasury bridge`,
      status: "prepared"
    };
  },

  async createPayoutIntent({ recipient, receiveCurrency }) {
    return {
      provider: process.env.PAYOUT_PROVIDER || "sandbox-payout",
      status: "queued",
      method: recipient?.method || "Bank transfer",
      receiveCurrency,
      deliveryEstimate: recipient?.deliveryEstimate || "Within 1 business day"
    };
  }
};
