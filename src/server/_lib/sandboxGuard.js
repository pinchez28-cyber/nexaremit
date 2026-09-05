// src/server/_lib/sandboxGuard.js
//
// P0-3: sandbox override guard (fail-closed).
//
// Two pre-launch conveniences weaken compliance controls:
//   1. NEXA_ALLOW_UNSCREENED=true — lets a transfer pass with no sanctions
//      screening provider (safetyEngine downgrades missing screen to warning).
//   2. Sandbox KYC auto-approve — kycRecords reports "approved" for anyone when
//      TRANSFER_MODE is not "production" and no KYC record exists.
//   3. NEXA_REQUIRE_KYC=false — disables the KYC gate entirely (kycGate).
//
// Each of these is legitimate in a sandbox with test keys and catastrophic
// with live keys or in production mode. This module makes them mutually
// exclusive with both: any override requested alongside TRANSFER_MODE =
// "production" or a live Stripe secret (sk_live_) throws a 503 that names the
// offending variables. Fail-closed means a misconfigured deploy refuses money
// movement rather than moving money unverified.
//
// Money-path routes (quotes, transfers, create-payment-intent) call
// assertSandboxOverridesAllowed() at request time — never at import — so a
// bad deploy returns JSON, not FUNCTION_INVOCATION_FAILED.

import { createHttpError } from "./http.js";

export function isProductionMode(env = process.env) {
  return (
    String(env?.TRANSFER_MODE || "sandbox").trim().toLowerCase() ===
    "production"
  );
}

export function looksLiveStripeKey(value) {
  return /^sk_live_/i.test(String(value || "").trim());
}

/**
 * Which sandbox compliance overrides are requested by this environment.
 * Returns e.g. ["NEXA_ALLOW_UNSCREENED", "NEXA_REQUIRE_KYC=false"].
 */
export function sandboxOverridesRequested(env = process.env) {
  const requested = [];
  if (String(env?.NEXA_ALLOW_UNSCREENED || "").trim().toLowerCase() === "true") {
    requested.push("NEXA_ALLOW_UNSCREENED");
  }
  if (String(env?.NEXA_REQUIRE_KYC || "true").trim().toLowerCase() === "false") {
    requested.push("NEXA_REQUIRE_KYC=false");
  }
  return requested;
}

/**
 * Fail-closed gate: throws 503 when a sandbox override is requested in
 * production mode or alongside a live Stripe secret key.
 */
export function assertSandboxOverridesAllowed(env = process.env) {
  const overrides = sandboxOverridesRequested(env);
  if (overrides.length === 0) return { ok: true, overrides };

  const conflicts = [];
  if (isProductionMode(env)) {
    conflicts.push(`TRANSFER_MODE=production with ${overrides.join(", ")}`);
  }
  if (looksLiveStripeKey(env?.STRIPE_SECRET_KEY)) {
    conflicts.push(
      `live STRIPE_SECRET_KEY with ${overrides.join(", ")}`
    );
  }

  if (conflicts.length > 0) {
    throw createHttpError(
      503,
      "Sandbox compliance overrides are not allowed with live keys or in production mode.",
      { reason: "sandbox_override_forbidden", conflicts }
    );
  }

  return { ok: true, overrides };
}

/**
 * Effective NEXA_ALLOW_UNSCREENED value for the safety engine: true only when
 * the flag is set AND the guard above passes (throws otherwise).
 */
export function effectiveAllowUnscreened(env = process.env) {
  assertSandboxOverridesAllowed(env);
  return sandboxOverridesRequested(env).includes("NEXA_ALLOW_UNSCREENED");
}

export default assertSandboxOverridesAllowed;
