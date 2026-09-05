function createFriendlyMessage(status, payload) {
  if (status === 401) return "Your session expired or you are not signed in. Please sign in again before continuing.";
  if (status === 409) {
    if (payload?.error === "quote_expired") return "This quote has expired. Refresh the quote before submitting the transfer.";
    if (payload?.error === "quote_already_used") return "This quote has already been used. Create a fresh quote and try again.";
    return "This transfer request conflicts with the latest quote or a previous submission. Refresh and try again.";
  }
  if (status === 422) {
    if (payload?.quote?.safety?.failures?.length) return payload.quote.safety.failures.join(" ");
    if (payload?.safety?.failures?.length) return payload.safety.failures.join(" ");
    return payload?.message || "This transfer is blocked by safety or compliance checks.";
  }
  return payload?.message || payload?.error || "Something went wrong while contacting the transfer API.";
}

async function parseApiResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.ok) return payload;

  const error = new Error(createFriendlyMessage(response.status, payload));
  error.status = response.status;
  error.code = payload?.error || "request_failed";
  error.payload = payload;
  error.friendlyMessage = error.message;
  throw error;
}

export function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function requestTransferQuote({ recipient, amount, currency, purpose }) {
  const response = await fetch("/api/quotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ recipient, amount, currency, purpose })
  });

  return parseApiResponse(response);
}

export async function submitTransferRequest({ quoteId, paymentMethod, purpose, amount, currency, recipient, idempotencyKey }) {
  const response = await fetch("/api/transfers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify({
      // Server-owned (Batch 2): ids + idempotency key only. Amounts, fees,
      // rates and recipient money fields are NEVER accepted from the client —
      // the server reads them from the stored quote.
      quoteId,
      idempotencyKey
    })
  });

  return parseApiResponse(response);
}
