// src/server/_lib/payoutProvider.js
//
// The contract a payout partner has to satisfy, and the honest default.
//
// No partner is signed. Thunes, Onafriq and Nium are all mid-conversation, and
// which one lands changes the HTTP calls but not the shape of the problem:
// quote a payout, submit it, ask what happened to it. Defining that shape now
// means integrating a partner is writing one adapter rather than redesigning
// the transfer flow around whoever says yes first.
//
// The default provider is "none", and it does not pretend. It reports that it
// cannot deliver, which is what leaves funded transfers sitting in
// awaiting_provider instead of silently looking complete.
//
// An adapter implements:
//   name                       identifier stored on the payout row
//   isConfigured()             credentials present and usable
//   supports({ corridor, payoutMethod })
//   quote({ ... })             -> { ok, rate, feeMinor, receiveAmountMinor }
//   createPayout({ ... })      -> { ok, providerReference, status }
//   getPayoutStatus(reference) -> { ok, status, failureReason }
//
// Adapters must never throw for an expected refusal. Return { ok: false, code,
// message } so the caller can record it against the payout rather than losing
// it in a stack trace.

export const PAYOUT_STATUS = Object.freeze({
  AWAITING_PROVIDER: "awaiting_provider",
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
});

/**
 * The state of the world today: funding works, delivery does not exist.
 *
 * Everything it returns is a refusal carrying a reason, so a transfer funded
 * now is recorded as owed rather than quietly dropped. When a partner signs,
 * the queue of awaiting_provider rows is the backlog to work through.
 */
const noProvider = {
  name: "none",
  isConfigured: () => false,
  supports: () => false,

  async quote() {
    return {
      ok: false,
      code: "no_payout_provider",
      message: "No payout provider is connected.",
    };
  },

  async createPayout() {
    return {
      ok: false,
      code: "no_payout_provider",
      message: "No payout provider is connected, so this transfer cannot be delivered yet.",
      status: PAYOUT_STATUS.AWAITING_PROVIDER,
    };
  },

  async getPayoutStatus() {
    return {
      ok: false,
      code: "no_payout_provider",
      status: PAYOUT_STATUS.AWAITING_PROVIDER,
    };
  },
};

const adapters = new Map([["none", noProvider]]);

/**
 * Register a partner adapter.
 *
 * Kept as a registry rather than a switch so an adapter can be added without
 * touching the transfer flow, and so an unsigned partner's half-built adapter
 * cannot accidentally become the default.
 */
export function registerPayoutAdapter(adapter) {
  if (!adapter?.name) throw new Error("[payout] adapter needs a name");
  adapters.set(adapter.name, adapter);
  return adapter;
}

export function listPayoutAdapters() {
  return [...adapters.keys()];
}

/**
 * Resolve the configured provider.
 *
 * Falls back to "none" when PAYOUT_PROVIDER names something unknown or
 * unconfigured, and says so in the log. Silently falling back to a working
 * provider would be worse; silently falling back to a broken one worse still.
 */
export function getPayoutProvider(env = process.env) {
  const requested = String(env.PAYOUT_PROVIDER || "none").trim().toLowerCase();

  const adapter = adapters.get(requested);

  if (!adapter) {
    console.error(
      `[payout] PAYOUT_PROVIDER="${requested}" is not a registered adapter. Known: ${listPayoutAdapters().join(", ")}. Falling back to none.`
    );
    return noProvider;
  }

  if (adapter.name !== "none" && !adapter.isConfigured()) {
    console.error(
      `[payout] adapter "${adapter.name}" is selected but not configured. Falling back to none.`
    );
    return noProvider;
  }

  return adapter;
}
