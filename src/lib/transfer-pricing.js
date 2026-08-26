import { priceTransfer, DEFAULT_PRICING } from "./pricing.js";
import { majorToMinor } from "./money.js";

export const corridorRates = {
  USD: { NGN: 1650, KES: 129, GHS: 12.1, INR: 83.2, PHP: 57.5, MXN: 17.1, BRL: 5.1, PKR: 278, BDT: 117, ZAR: 18.2, EGP: 48.5, MAD: 10.0 },
  CAD: { NGN: 1210, KES: 94.5, GHS: 8.9, INR: 61.0, PHP: 42.1, MXN: 12.5, BRL: 3.75, PKR: 204, BDT: 86, ZAR: 13.3, EGP: 35.5, MAD: 7.3 },
  GBP: { NGN: 2080, KES: 165, GHS: 15.35, INR: 105.2, PHP: 72.8, MXN: 21.7, BRL: 6.5, PKR: 352, BDT: 148, ZAR: 23.0, EGP: 61.4, MAD: 12.7 },
  EUR: { NGN: 1785, KES: 141, GHS: 13.2, INR: 90.0, PHP: 62.3, MXN: 18.6, BRL: 5.6, PKR: 301, BDT: 127, ZAR: 19.7, EGP: 52.5, MAD: 10.8 },
  AUD: { NGN: 1085, KES: 85.0, GHS: 8.0, INR: 54.8, PHP: 37.9, MXN: 11.3, BRL: 3.4, PKR: 183, BDT: 77, ZAR: 12.0, EGP: 32.0, MAD: 6.6 },
  NZD: { NGN: 1005, KES: 78.6, GHS: 7.4, INR: 50.7, PHP: 35.1, MXN: 10.5, BRL: 3.1, PKR: 169, BDT: 71, ZAR: 11.1, EGP: 29.6, MAD: 6.1 },
  CHF: { NGN: 1840, KES: 144, GHS: 13.6, INR: 92.8, PHP: 64.2, MXN: 19.1, BRL: 5.7, PKR: 310, BDT: 130, ZAR: 20.3, EGP: 54.1, MAD: 11.2 },
  SEK: { NGN: 151, KES: 11.8, GHS: 1.1, INR: 7.6, PHP: 5.3, MXN: 1.57, BRL: 0.47, PKR: 25.5, BDT: 10.7, ZAR: 1.67, EGP: 4.45, MAD: 0.92 },
  NOK: { NGN: 154, KES: 12.0, GHS: 1.13, INR: 7.75, PHP: 5.36, MXN: 1.6, BRL: 0.48, PKR: 26.0, BDT: 10.9, ZAR: 1.7, EGP: 4.53, MAD: 0.94 },
  DKK: { NGN: 239, KES: 18.7, GHS: 1.77, INR: 12.1, PHP: 8.36, MXN: 2.49, BRL: 0.75, PKR: 40.5, BDT: 17.0, ZAR: 2.65, EGP: 7.06, MAD: 1.46 },
  SGD: { NGN: 1225, KES: 95.8, GHS: 9.0, INR: 61.8, PHP: 42.8, MXN: 12.7, BRL: 3.82, PKR: 207, BDT: 87, ZAR: 13.5, EGP: 36.0, MAD: 7.45 },
  AED: { NGN: 449, KES: 35.1, GHS: 3.3, INR: 22.7, PHP: 15.7, MXN: 4.66, BRL: 1.39, PKR: 75.7, BDT: 31.9, ZAR: 4.96, EGP: 13.2, MAD: 2.72 },
  SAR: { NGN: 440, KES: 34.4, GHS: 3.23, INR: 22.2, PHP: 15.3, MXN: 4.56, BRL: 1.36, PKR: 74.1, BDT: 31.2, ZAR: 4.85, EGP: 12.9, MAD: 2.66 },
  JPY: { NGN: 10.6, KES: 0.83, GHS: 0.078, INR: 0.53, PHP: 0.37, MXN: 0.11, BRL: 0.033, PKR: 1.79, BDT: 0.75, ZAR: 0.117, EGP: 0.312, MAD: 0.064 }
};

export function calculateTransferQuote({ amount = 0, currency = "USD", recipient, rate: liveRate }) {
  const numericAmount = Number(amount || 0);
  const receiveCurrency = recipient?.receiveCurrency || "NGN";
  // A live rate (see lib/fx-rates.js) wins; the bundled table is the fallback.
  const rate =
    Number(liveRate) > 0
      ? Number(liveRate)
      : corridorRates[currency]?.[receiveCurrency] || recipient?.exchangeRate || 1;
  // Priced by the same module the server charges with. This previously used
  // max($2.99, 1.2%), which bore no relation to what create-payment-intent
  // actually billed - a $1,500 transfer quoted an $18 fee and charged $52.31.
  const priced = priceTransfer({
    sendAmountMinor: majorToMinor(numericAmount, currency),
    currency,
    rate,
    receiveCurrency,
    config: DEFAULT_PRICING,
  });

  const fee = priced.fee;
  const total = priced.total;
  const receivedAmount = priced.receiveAmount;
  const transferLimit = recipient?.limit || 2500;
  const isOverLimit = numericAmount > transferLimit;

  return {
    rate,
    fee,
    total,
    receivedAmount,
    receiveCurrency,
    // The breakdown behind the single fee figure, so the review step can show
    // what the customer is paying for rather than one opaque number.
    breakdown: {
      platformFee: priced.platformFeeMinor / 100,
      fxMarkup: priced.fxMarkupMinor / 100,
      payoutCost: priced.payoutCostMinor / 100,
      cardProcessing: priced.stripeFeeMinor / 100
    },
    deliveryEstimate: recipient?.deliveryEstimate || "Within 1 business day",
    transferLimit,
    isOverLimit
  };
}

export function calculateSandboxQuote(input) {
  return calculateTransferQuote(input);
}
