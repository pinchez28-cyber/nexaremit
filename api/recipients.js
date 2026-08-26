// api/recipients.js
//
// Recipients belonging to the signed-in sender.
//
// This route used to proxy to RECIPIENTS_API_URL, an upstream that was never
// built, so it returned 503 in production while the browser quietly rendered
// twelve hardcoded demo people instead. Both halves are gone: recipients are
// now real rows owned by a real customer.
//
// Nothing about a recipient is trusted from the request body beyond the fields
// below. Corridor, currency and limit are all derived server-side from the
// chosen destination, because safetyEngine later makes allow/deny decisions
// using exactly those values.

import {
  sendJson,
  sendError,
  assertMethod,
  getJsonBody,
  createHttpError,
} from "../src/server/_lib/http.js";
import { requireAuthenticatedUser } from "../src/server/_lib/requireUser.js";
import {
  listRecipients,
  createRecipient,
  archiveRecipient,
} from "../src/server/_lib/recipientRecords.js";
import { recordAuditEvent } from "../src/server/_lib/audit.js";
import {
  getDestination,
  buildCorridor,
  payoutMethodLabels,
  deliveryEstimates,
  UPI_VPA_PATTERN,
} from "../src/lib/payout-destinations.js";

const LABELS = { payoutMethodLabels, deliveryEstimates };

// Account numbers vary widely by market, so this only rejects the obviously
// wrong rather than trying to validate every national format.
const ACCOUNT_PATTERN = /^[0-9A-Za-z+\-. ]{6,34}$/;

function cleanString(value, max = 120) {
  return String(value ?? "").trim().slice(0, max);
}

function validateNewRecipient(body) {
  const name = cleanString(body.name, 120);
  if (name.length < 2) {
    throw createHttpError(400, "Recipient name is required.");
  }

  const countryCode = cleanString(body.countryCode, 2).toUpperCase();
  const destination = getDestination(countryCode);

  if (!destination) {
    throw createHttpError(
      400,
      `We cannot send to that country yet: ${countryCode || "(none given)"}`
    );
  }

  const payoutMethod = cleanString(body.payoutMethod, 20).toLowerCase();
  if (!destination.methods.includes(payoutMethod)) {
    throw createHttpError(
      400,
      `${payoutMethodLabels[payoutMethod] || payoutMethod} is not available for ${destination.country}.`
    );
  }

  // A VPA is longer than an account number and contains an @, which
  // ACCOUNT_PATTERN deliberately does not allow.
  const accountIdentifier = cleanString(
    body.accountIdentifier,
    payoutMethod === "upi" ? 256 : 34
  );
  const needsAccount = payoutMethod !== "cash_pickup";

  if (needsAccount) {
    const valid =
      payoutMethod === "upi"
        ? UPI_VPA_PATTERN.test(accountIdentifier)
        : ACCOUNT_PATTERN.test(accountIdentifier);

    if (!valid) {
      throw createHttpError(
        400,
        payoutMethod === "upi"
          ? "Enter a valid UPI ID, for example name@okicici."
          : payoutMethod === "bank"
            ? "A valid account number is required."
            : "A valid mobile money or wallet number is required."
      );
    }
  }

  return {
    name,
    country: destination.country,
    countryCode: destination.countryCode,
    // Derived, never taken from the browser: safetyEngine checks this against
    // its corridor allowlist.
    corridor: buildCorridor(destination.countryCode),
    payoutMethod,
    receiveCurrency: destination.receiveCurrency,
    accountIdentifier: needsAccount ? accountIdentifier : "",
    accountName: cleanString(body.accountName, 120),
    bankCode: cleanString(body.bankCode, 20),
    transferLimit: destination.defaultLimit,
  };
}

export default async function handler(req, res) {
  try {
    assertMethod(req, res, ["GET", "POST", "DELETE"]);

    const user = await requireAuthenticatedUser(req);

    if (req.method === "GET") {
      const recipients = await listRecipients(user, LABELS);
      return sendJson(res, 200, { ok: true, recipients });
    }

    if (req.method === "DELETE") {
      const id = cleanString(req.query?.id, 64);
      if (!id) throw createHttpError(400, "A recipient id is required.");

      const result = await archiveRecipient(user, id);

      await recordAuditEvent({
        action: "recipient.archived",
        status: "ok",
        user,
        metadata: { recipientId: id },
      });

      return sendJson(res, 200, { ok: true, ...result });
    }

    const input = validateNewRecipient(getJsonBody(req));
    const recipient = await createRecipient(user, input, LABELS);

    // Adding a payout destination is a compliance-relevant event, so it is
    // recorded alongside the transfer decisions. The account number is not.
    await recordAuditEvent({
      action: "recipient.created",
      status: "ok",
      user,
      metadata: {
        recipientId: recipient.id,
        corridor: recipient.corridor,
        country: recipient.country,
        payoutMethod: recipient.payoutMethod,
      },
    });

    return sendJson(res, 201, { ok: true, recipient });
  } catch (error) {
    return sendError(res, error);
  }
}
