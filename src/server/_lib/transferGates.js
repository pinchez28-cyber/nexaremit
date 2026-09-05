// src/server/_lib/transferGates.js
//
// Production gate composition for the quote + transfer routes (P1-1/P1-2).
//
// The service layers (quoteService/transferService) accept an injectable
// `gates` callback so tests never touch the network. This module is the REAL
// composition wired into the API routes: KYC approved, sanctions clear, risk
// not blocked, recipient owned + active + corridor allowlist, amount positive
// and within limits, velocity available. Every check stays fail-closed: a
// check that cannot run is a failure, never a pass.
//
// Returns { ok, failures, warnings, recipient } — the shape both service
// layers expect. `recipient` is the server-owned recipient snapshot (corridor,
// limit, risk) stored on the quote row.

import { runTransferSafetyChecks } from "./safetyEngine.js";
import { getKycRecord } from "./kycRecords.js";
import { screenSanctionsSubject } from "./sanctionsRecords.js";
import { assessTransferRisk } from "./riskRecords.js";
import { getVelocityUsage, getVelocityLimits } from "./velocity.js";
import { getRecipientForUser } from "./recipientRecords.js";
import { effectiveAllowUnscreened } from "./sandboxGuard.js";
import {
  getDestination,
  payoutMethodLabels,
  deliveryEstimates,
} from "../../lib/payout-destinations.js";

const LABELS = { payoutMethodLabels, deliveryEstimates };

// Duplicated deliberately from safetyEngine's corridor allowlist; the engine
// re-checks it too — this early list fails a quote before any pricing work.
const ALLOWED_CORRIDORS = new Set([
  "US-NG", "US-KE", "US-GH", "GB-NG", "GB-KE", "EU-GH",
  "GB-IN", "US-IN", "US-PH", "US-MX", "EU-BR", "GB-PK",
  "SG-BD", "EU-ZA", "AE-EG", "EU-MA",
]);

export function isAllowedCorridor(corridor) {
  return ALLOWED_CORRIDORS.has(String(corridor || ""));
}

/**
 * Real composition. `args` is the object the service layers pass:
 *   { normalized, user } (quoteService) or the quote row itself (transfers).
 * Returns { ok, failures, warnings, recipient }.
 */
export async function runPretransferGates({ user, args }) {
  const failures = [];
  const warnings = [];
  let recipient = null;

  const normalized = args?.normalized || args || {};
  const recipientId = String(
    normalized.recipientId || normalized.recipient_id || ""
  ).trim();
  const amountMajor = Number(
    normalized.sendAmountMajor ??
      normalized.send_amount_major ??
      normalized.amount ??
      0
  );
  const sendCurrency = String(
    normalized.sendCurrency || normalized.send_currency || "USD"
  ).toUpperCase();

  // ---- KYC (fail-closed) ----
  const kycResult = await getKycRecord(user);
  const kycStatus = kycResult?.record?.status || "required";
  if (kycStatus !== "approved") {
    failures.push("Sender KYC must be approved before a quote or transfer is created.");
  }

  // ---- Recipient (owned + active + corridor allowlist + limits) ----
  if (!recipientId) {
    failures.push("A recipient is required.");
  } else {
    recipient = await getRecipientForUser(user, recipientId, LABELS).catch(() => null);
    if (!recipient) {
      failures.push("Recipient not found.");
    } else {
      if (recipient.status !== "active" && recipient.status !== "review_required") {
        failures.push("Recipient is not active.");
      }
      if (!isAllowedCorridor(recipient.corridor)) {
        failures.push(`Transfer corridor ${recipient.corridor} is not enabled.`);
      }
      if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
        failures.push("Transfer amount must be greater than zero.");
      }
      const limit = Number(recipient.limit || 2500);
      if (Number.isFinite(amountMajor) && amountMajor > limit) {
        failures.push(
          `Transfer exceeds recipient limit of ${sendCurrency} ${limit}.`
        );
      }
    }
  }

  // ---- Sanctions (fail-closed; NEXA_ALLOW_UNSCREENED is a recorded warning
  // only when the P0-3 guard passes) ----
  const sanctionsResult = await screenSanctionsSubject({
    user,
    recipient,
  }).catch(() => ({ configured: false, record: { status: "not_configured" } }));
  const sanctionsStatus =
    sanctionsResult?.record?.status || sanctionsResult?.status || "not_configured";
  if (sanctionsStatus !== "clear") {
    if (sanctionsStatus === "not_configured" && effectiveAllowUnscreened()) {
      warnings.push(
        "Sanctions screening is not configured; allowed by NEXA_ALLOW_UNSCREENED. Not valid for real transfers."
      );
    } else {
      failures.push(
        `Sanctions screening must be clear before transfer creation (sanctions status: ${sanctionsStatus}).`
      );
    }
  }

  // ---- Risk (fail-closed) ----
  const riskResult = await assessTransferRisk({
    user,
    amount: amountMajor,
    currency: sendCurrency,
    recipient,
    kyc: { status: kycStatus },
    sanctions: { status: sanctionsStatus },
  }).catch(() => ({ configured: false, record: { status: "not_configured" } }));
  const riskStatus = riskResult?.record?.status || riskResult?.status || "not_configured";
  if (riskStatus === "blocked") {
    failures.push("Fraud risk check blocked this transfer.");
  } else if (riskStatus === "manual_review") {
    warnings.push("Fraud risk check requires manual review before release.");
  } else if (riskStatus === "not_configured") {
    warnings.push("Fraud risk scoring is not configured on this deployment.");
  }

  // ---- Velocity + the full engine (duplicate-but-authoritative re-check) ----
  const velocity = await getVelocityUsage(user, {
    currency: sendCurrency,
  }).catch(() => ({ available: false, dailyAmount: 0, monthlyAmount: 0, dailyCount: 0 }));
  const velocityLimits = getVelocityLimits();

  const engine = runTransferSafetyChecks({
    user,
    amount: amountMajor,
    currency: sendCurrency,
    recipient: recipient || { name: "Recipient", corridor: "US-NG", limit: 2500 },
    quote: {},
    kyc: { status: kycStatus },
    sanctions: { status: sanctionsStatus },
    risk: { status: riskStatus },
    velocity,
    velocityLimits,
    allowUnscreened: false,
  });

  failures.push(...(engine.failures || []));
  warnings.push(...(engine.warnings || []));

  return {
    ok: failures.length === 0,
    failures,
    warnings,
    recipient,
  };
}

export default runPretransferGates;