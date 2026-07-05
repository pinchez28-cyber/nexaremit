import Stripe from "stripe";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20"
  });
}

export function toStripeAmount(amount, currency = "USD") {
  const zeroDecimalCurrencies = new Set(["JPY", "KRW"]);
  const numericAmount = Number(amount || 0);
  return zeroDecimalCurrencies.has(currency.toUpperCase())
    ? Math.round(numericAmount)
    : Math.round(numericAmount * 100);
}
