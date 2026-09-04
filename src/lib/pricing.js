// src/lib/pricing.js
//
// One place that decides what a transfer costs.
//
// There were three before this, and they disagreed. The browser previewed
// max($2.99, 1.2%). create-payment-intent charged platform fee + FX markup +
// Stripe's cut grossed up. The receipt recomputed from a hardcoded rate table.
// On a $1,500 transfer the customer was quoted a $18 fee and charged $52.31;
// on a $200 transfer to India the quote used a live rate of 95.43 and the
// receipt recorded 83.20, understating what the recipient got by 13%.
//
// Quoting one number and charging another is not a rounding problem. The US
// Remittance Transfer Rule requires the fee and the amount the recipient
// receives to be disclosed accurately before payment, and the product's own
// homepage promises to "see the full cost first".
//
// Everything here works in minor units and returns minor units. Convert at the
// edges with money.js, which knows that JPY has no minor unit.

import { minorToMajor, majorToMinor } from "./money.js";

export const DEFAULT_PRICING = Object.freeze({
  platformFixedCents: 99,
  platformPercentBps: 0,
  fxMarkupBps: 40,
  payoutFixedCents: 0,
  payoutPercentBps: 0,
  complianceBufferCents: 0,
  // What the card acquirer takes. Not revenue — it is passed through, and on
  // small transfers it is most of what the customer pays.
  stripePercentBps: 290,
  stripeFixedCents: 30,
});

function readInt(env, names, fallback) {
  for (const name of names) {
    const raw = env?.[name];
    if (raw === undefined || raw === null || raw === "") continue;
    const value = Number.parseInt(String(raw), 10);
    if (Number.isFinite(value)) return value;
  }
  return fallback;
}

/**
 * Read pricing from the environment.
 *
 * Accepts both the NEXA_* names the code used and the FEE_* names actually
 * configured in Vercel. Those were set months ago and silently ignored because
 * nothing read them, so every deployment has been running on the defaults
 * while appearing to be configured.
 */
export function readPricingConfig(env = {}) {
  return Object.freeze({
    platformFixedCents: readInt(
      env,
      ["NEXA_PLATFORM_FIXED_FEE_CENTS", "FEE_PLATFORM_FLAT_CENTS"],
      DEFAULT_PRICING.platformFixedCents
    ),
    platformPercentBps: readInt(
      env,
      ["NEXA_PLATFORM_PERCENT_BPS", "FEE_PLATFORM_PERCENT_BPS"],
      DEFAULT_PRICING.platformPercentBps
    ),
    fxMarkupBps: readInt(
      env,
      ["NEXA_FX_MARKUP_BPS", "FEE_FX_MARKUP_BPS"],
      DEFAULT_PRICING.fxMarkupBps
    ),
    payoutFixedCents: readInt(
      env,
      ["NEXA_PAYOUT_FIXED_FEE_CENTS", "FEE_PAYOUT_FIXED_CENTS"],
      DEFAULT_PRICING.payoutFixedCents
    ),
    payoutPercentBps: readInt(
      env,
      ["NEXA_PAYOUT_PERCENT_BPS", "FEE_PAYOUT_PERCENT_BPS"],
      DEFAULT_PRICING.payoutPercentBps
    ),
    complianceBufferCents: readInt(
      env,
      ["NEXA_COMPLIANCE_BUFFER_CENTS", "FEE_COMPLIANCE_BUFFER_CENTS"],
      DEFAULT_PRICING.complianceBufferCents
    ),
    stripePercentBps: readInt(
      env,
      ["STRIPE_FEE_PERCENT_BPS"],
      DEFAULT_PRICING.stripePercentBps
    ),
    stripeFixedCents: readInt(
      env,
      ["STRIPE_FEE_FIXED_CENTS"],
      DEFAULT_PRICING.stripeFixedCents
    ),
  });
}

/**
 * Price one transfer.
 *
 * sendAmountMinor is what the recipient's side is based on. The customer pays
 * that plus everything below it, and the fee they see is the difference — one
 * number, not a list they have to add up themselves.
 *
 * The card fee is grossed up rather than added: Stripe takes its percentage of
 * the total charge, so charging base + 2.9% would leave the platform short.
 */
export function priceTransfer({
  sendAmountMinor,
  currency = "USD",
  rate = 0,
  receiveCurrency = "",
  config = DEFAULT_PRICING,
}) {
  const send = Math.max(0, Math.round(Number(sendAmountMinor) || 0));

  if (send === 0) {
    return {
      sendAmountMinor: 0,
      feeMinor: 0,
      totalChargeMinor: 0,
      platformFeeMinor: 0,
      fxMarkupMinor: 0,
      payoutCostMinor: 0,
      complianceBufferMinor: 0,
      stripeFeeMinor: 0,
      currency,
      receiveCurrency,
      rate: Number(rate) || 0,
      receiveAmount: 0,
      sendAmount: 0,
      fee: 0,
      total: 0,
    };
  }

  const platformPercentMinor = Math.ceil(send * (config.platformPercentBps / 10000));
  const fxMarkupMinor = Math.ceil(send * (config.fxMarkupBps / 10000));
  const payoutPercentMinor = Math.ceil(send * (config.payoutPercentBps / 10000));

  const platformFeeMinor = config.platformFixedCents + platformPercentMinor;
  const payoutCostMinor = config.payoutFixedCents + payoutPercentMinor;

  const baseMinor =
    send +
    platformFeeMinor +
    fxMarkupMinor +
    payoutCostMinor +
    config.complianceBufferCents;

  const stripeRate = config.stripePercentBps / 10000;
  const totalChargeMinor = Math.ceil(
    (baseMinor + config.stripeFixedCents) / (1 - stripeRate)
  );

  const stripeFeeMinor = totalChargeMinor - baseMinor;
  const feeMinor = totalChargeMinor - send;

  const numericRate = Number(rate) || 0;
  const sendAmount = minorToMajor(send, currency);

  return {
    sendAmountMinor: send,
    feeMinor,
    totalChargeMinor,
    platformFeeMinor,
    fxMarkupMinor,
    payoutCostMinor,
    complianceBufferMinor: config.complianceBufferCents,
    stripeFeeMinor,
    currency,
    receiveCurrency,
    rate: numericRate,
    // Major units, for display. The recipient gets the full rate: the FX
    // markup is charged as part of the fee rather than hidden in the rate,
    // which is the whole point of showing it.
    sendAmount,
    fee: minorToMajor(feeMinor, currency),
    total: minorToMajor(totalChargeMinor, currency),
    receiveAmount: sendAmount * numericRate,
  };
}

/**
 * What the fee costs as a share of the amount sent.
 *
 * This is the number that can be compared against a competitor, and the one
 * worth watching: on small transfers the card fee dominates, so the same
 * pricing looks very different at $50 and at $1,500.
 */
export function totalCostPercent(quote) {
  if (!quote?.sendAmountMinor) return 0;
  return (quote.feeMinor / quote.sendAmountMinor) * 100;
}

/**
 * ISO 4217 currency-aware conversion of a minor-unit amount into the minor
 * units of a *recipient* currency (P1-3).
 *
 * The recipient amount is expressed in the recipient currency: a USD sender
 * whose quote says the recipient gets NGN 2,575,000 sends `recipientAmountMinor`
 * in NGN minor units. Converting that with a hard-coded /100 was fine for NGN
 * (2 decimals) but wrong for 3-decimal (BHD, KWD, ...) and wrong for
 * zero-decimal (JPY) receive currencies. `numMinorUnits` is the recipient
 * currency's ISO 4217 exponent; the round-trip math stays exact integer
 * arithmetic and returns the recipient minor units unchanged.
 */
export function convertRecipientAmountMinor(recipientAmountMajor, receiveCurrency, numMinorUnits = 100) {
  const major = Number(recipientAmountMajor);
  if (!Number.isFinite(major) || major <= 0) return 0;
  return Math.round(major * numMinorUnits);
}

export { majorToMinor, minorToMajor };
