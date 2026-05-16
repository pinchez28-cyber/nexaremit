export const corridorRates = {
  USD: { NGN: 1650, KES: 129, GHS: 12.1 },
  GBP: { NGN: 2080, KES: 165, GHS: 15.35 },
  EUR: { NGN: 1785, KES: 141, GHS: 13.2 }
};

export function calculateTransferQuote({ amount = 0, currency = "USD", recipient }) {
  const numericAmount = Number(amount || 0);
  const receiveCurrency = recipient?.receiveCurrency || "NGN";
  const rate = corridorRates[currency]?.[receiveCurrency] || recipient?.exchangeRate || 1;
  const fee = numericAmount > 0 ? Math.max(2.99, numericAmount * 0.012) : 0;
  const total = numericAmount + fee;
  const receivedAmount = numericAmount * rate;
  const transferLimit = recipient?.limit || 2500;
  const isOverLimit = numericAmount > transferLimit;

  return {
    rate,
    fee,
    total,
    receivedAmount,
    receiveCurrency,
    deliveryEstimate: recipient?.deliveryEstimate || "Within 1 business day",
    transferLimit,
    isOverLimit
  };
}

export function calculateSandboxQuote(input) {
  return calculateTransferQuote(input);
}
