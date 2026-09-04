// src/server/_lib/moneyAmount.js
//
// Server-side money resolution — the one place a request-body amount becomes
// minor units (P1-3).
//
// The historic bug was hard-coding /100 and *100 at every call site: JPY has
// no minor unit and BHD has three, so those currencies were mis-priced and —
// worse — every limit that compared a major amount against a cap stopped
// biting, because a limit compared against 1/100th of the true value passes.
//
// The ISO 4217 exponents live in ONE place, src/lib/money.js (the same module
// the client uses). This module applies them to request bodies and re-exports
// the exponent lookup so no server file ever needs its own copy of the
// currency table — a duplicated table is exactly how the Persona base URL
// drifted (P0-2), and money must not drift the same way.
//
// A body value is accepted in EITHER unit:
//   - `amountMajor`: major units (12.34 means $12.34; 10000 means ¥10000)
//   - `amountMinor` / legacy `amount`: minor units (1234 means $12.34)
// `amountMajor` wins when both are present, because it is the field the
// currency-aware panel sends and the legacy field is the one the /100 bug
// produced.

import { minorUnitsPerMajor, majorToMinor } from "../../lib/money.js";

/** ISO 4217 minor units per major unit: 100 (USD/EUR/KES), 1 (JPY), 1000 (BHD). */
export function unitPerMajorFor(currency) {
  return minorUnitsPerMajor(currency);
}

/**
 * Resolve the send amount from a request body into minor units of `currency`.
 *
 * Returns NaN when no usable amount field is present so the caller's
 * "Missing or invalid amount" guard (400) fires — this module never invents
 * an amount.
 */
export function resolveSendAmountMinor(body, currency) {
  const majorRaw = body?.amountMajor;
  if (majorRaw !== undefined && majorRaw !== null && majorRaw !== "") {
    const major = Number(majorRaw);
    if (!Number.isFinite(major) || major <= 0) return NaN;
    return majorToMinor(major, currency);
  }

  const minorRaw = body?.amountMinor ?? body?.amount;
  if (minorRaw === undefined || minorRaw === null || minorRaw === "") {
    return NaN;
  }
  const minor = Number(minorRaw);
  if (!Number.isFinite(minor) || minor <= 0) return NaN;
  return Math.round(minor);
}
