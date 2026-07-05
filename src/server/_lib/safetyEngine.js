const allowedCorridors = new Set([
  "US-NG",
  "US-KE",
  "US-GH",
  "GB-NG",
  "GB-KE",
  "EU-GH",
  "GB-IN",
  "US-PH",
  "US-MX",
  "EU-BR",
  "GB-PK",
  "SG-BD",
  "EU-ZA",
  "AE-EG",
  "EU-MA"
]);

export function runTransferSafetyChecks({ user, amount, currency, recipient, quote, kyc, sanctions, risk }) {
  const numericAmount = Number(amount || 0);
  const failures = [];
  const warnings = [];
  const transferLimit = recipient?.limit || 2500;
  const corridor = recipient?.corridor || "US-NG";

  if (!user?.id) failures.push("User must be authenticated.");
  if (kyc?.status !== "approved") failures.push("Sender KYC must be approved before transfer creation.");
  if (sanctions?.status !== "clear") failures.push("Sanctions screening must be clear before transfer creation.");
  if (risk?.status === "blocked") failures.push("Fraud risk check blocked this transfer.");
  if (risk?.status === "manual_review") warnings.push("Fraud risk check requires manual review before release.");
  if (!recipient?.name) failures.push("Recipient is required.");
  if (!allowedCorridors.has(corridor)) failures.push(`Corridor ${corridor} is not enabled.`);
  if (!numericAmount || numericAmount <= 0) failures.push("Transfer amount must be greater than zero.");
  if (numericAmount > transferLimit) failures.push(`Transfer exceeds recipient limit of ${currency} ${transferLimit}.`);
  if (numericAmount > 1000) warnings.push("Enhanced due diligence may be required for larger transfers.");
  if (quote?.expiresAt && new Date(quote.expiresAt).getTime() < Date.now()) failures.push("Quote has expired.");
  if (recipient?.risk === "Review required") warnings.push("Recipient requires manual compliance review.");

  return {
    passed: failures.length === 0,
    failures,
    warnings,
    checkedAt: new Date().toISOString()
  };
}
