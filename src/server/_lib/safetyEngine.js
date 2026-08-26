const allowedCorridors = new Set([
  "US-NG",
  "US-KE",
  "US-GH",
  "GB-NG",
  "GB-KE",
  "EU-GH",
  "GB-IN",
  "US-IN",
  "US-PH",
  "US-MX",
  "EU-BR",
  "GB-PK",
  "SG-BD",
  "EU-ZA",
  "AE-EG",
  "EU-MA"
]);

/**
 * Pre-transfer control checks.
 *
 * These are evaluated server-side before a PaymentIntent exists, so a failure
 * means no client secret is ever issued and the sender cannot reach a card
 * form. The result is written to the audit trail whether it passes or fails.
 *
 * allowUnscreened exists only because this deployment has no sanctions
 * screening provider yet. It downgrades a missing screen from a hard failure
 * to a recorded warning so the flow can be exercised pre-launch. It must be
 * off before real money moves — see NEXA_ALLOW_UNSCREENED.
 */
export function runTransferSafetyChecks({ user, amount, currency, recipient, quote, kyc, sanctions, risk, velocity, velocityLimits, allowUnscreened = false }) {
  const numericAmount = Number(amount || 0);
  const failures = [];
  const warnings = [];
  const transferLimit = recipient?.limit || 2500;
  const corridor = recipient?.corridor || "US-NG";

  if (!user?.id) failures.push("User must be authenticated.");
  if (kyc?.status !== "approved") failures.push("Sender KYC must be approved before transfer creation.");
  // Fails closed. A screen that was never run is not a screen that passed, so
  // the only way past it is the explicit pre-launch override, which is
  // recorded as a warning rather than quietly treated as a pass.
  if (sanctions?.status !== "clear") {
    if (sanctions?.status === "not_configured" && allowUnscreened) {
      warnings.push(
        "Sanctions screening is not configured; allowed by NEXA_ALLOW_UNSCREENED. Not valid for real transfers."
      );
    } else {
      failures.push("Sanctions screening must be clear before transfer creation.");
    }
  }
  if (risk?.status === "blocked") failures.push("Fraud risk check blocked this transfer.");
  if (risk?.status === "manual_review") warnings.push("Fraud risk check requires manual review before release.");
  if (risk?.status === "not_configured") warnings.push("Fraud risk scoring is not configured on this deployment.");
  if (!recipient?.name) failures.push("Recipient is required.");
  if (!allowedCorridors.has(corridor)) failures.push(`Corridor ${corridor} is not enabled.`);
  if (!numericAmount || numericAmount <= 0) failures.push("Transfer amount must be greater than zero.");
  if (numericAmount > transferLimit) failures.push(`Transfer exceeds recipient limit of ${currency} ${transferLimit}.`);
  if (numericAmount > 1000) warnings.push("Enhanced due diligence may be required for larger transfers.");
  // Velocity. A per-recipient cap can be cleared repeatedly, or spread across
  // several recipients, without tripping anything - so these look at what the
  // customer has already committed in the trailing windows, including this
  // transfer.
  if (velocity && velocityLimits) {
    if (!velocity.available) {
      // Usage could not be read. Refuse rather than assume zero, which would
      // let every limit through whenever the database is unreachable.
      failures.push("Transfer limits could not be checked. Please try again shortly.");
    } else {
      const dailyAfter = velocity.dailyAmount + numericAmount;
      const monthlyAfter = velocity.monthlyAmount + numericAmount;

      if (dailyAfter > velocityLimits.dailyAmount) {
        failures.push(
          `This would take you over your daily limit of ${currency} ${velocityLimits.dailyAmount.toLocaleString()}. You have sent ${currency} ${velocity.dailyAmount.toLocaleString()} in the last 24 hours.`
        );
      }

      if (monthlyAfter > velocityLimits.monthlyAmount) {
        failures.push(
          `This would take you over your 30-day limit of ${currency} ${velocityLimits.monthlyAmount.toLocaleString()}. You have sent ${currency} ${velocity.monthlyAmount.toLocaleString()} in that period.`
        );
      }

      if (velocity.dailyCount + 1 > velocityLimits.dailyCount) {
        failures.push(
          `You have reached the limit of ${velocityLimits.dailyCount} transfers in 24 hours.`
        );
      }

      // Approaching a limit is worth recording even when the transfer passes:
      // a pattern of transfers sitting just under a cap is what structuring
      // looks like, and the audit trail is where that becomes visible.
      if (dailyAfter > velocityLimits.dailyAmount * 0.8) {
        warnings.push("Sender is close to their daily transfer limit.");
      }
    }
  }

  if (quote?.expiresAt && new Date(quote.expiresAt).getTime() < Date.now()) failures.push("Quote has expired.");
  if (recipient?.risk === "Review required") warnings.push("Recipient requires manual compliance review.");

  return {
    passed: failures.length === 0,
    failures,
    warnings,
    checkedAt: new Date().toISOString()
  };
}
