// src/lib/money.js
//
// Minor-unit conversion.
//
// Dividing by 100 is wrong for the currencies that have no minor unit. JPY is
// offered in the send-currency list, so a JPY transfer converted with /100
// produced a major amount a hundred times too small — and every limit that
// compares against a major amount (per-recipient cap, daily and 30-day
// velocity) would then fail to bite. Choosing a currency should not be a way
// past a spending control.
//
// Values follow ISO 4217 exponents, which Stripe also uses for its
// zero-decimal currency list.

const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "ISK", "JPY", "KMF", "KRW",
  "PYG", "RWF", "UGX", "UYI", "VND", "VUV", "XAF", "XOF", "XPF"
]);

const THREE_DECIMAL_CURRENCIES = new Set([
  "BHD", "IQD", "JOD", "KWD", "LYD", "OMR", "TND"
]);

export function minorUnitsPerMajor(currency) {
  const code = String(currency || "").trim().toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(code)) return 1;
  if (THREE_DECIMAL_CURRENCIES.has(code)) return 1000;
  return 100;
}

/**
 * Convert a minor-unit amount to major units for comparison against limits.
 *
 * Returns 0 for anything non-finite rather than NaN, because a NaN silently
 * defeats every `>` comparison it touches — a limit check against NaN passes.
 */
export function minorToMajor(amountMinor, currency) {
  const minor = Number(amountMinor);
  if (!Number.isFinite(minor)) return 0;
  return minor / minorUnitsPerMajor(currency);
}

export function majorToMinor(amountMajor, currency) {
  const major = Number(amountMajor);
  if (!Number.isFinite(major)) return 0;
  return Math.round(major * minorUnitsPerMajor(currency));
}
