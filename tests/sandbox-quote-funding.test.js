// tests/sandbox-quote-funding.test.js
//
// Owner-approved SANDBOX regression tests for the two Batch 2 code blockers.
//
// FIX 1 — quote persistence payload contains NO phantom fields: the approved
// public.quotes schema has no recipient_snapshot / recipient_ref /
// platform_fee_minor / payout_cost_minor / total_charge_major columns, so an
// insert carrying them fails with PGRST204 and quote creation 503s. The
// snapshot builder + issueQuote persist path must align exactly to the
// approved column list, and the read paths must keep working through the
// schema-backed fallbacks.
//
// FIX 2 — bound-transfer funding is server-authoritative: the PaymentIntent
// amount derives EXCLUSIVELY from the stored server-owned expected_charge_minor
// (fallback: stored quote total_charge_minor per the code contract). A
// tampered client amount/fees/FX/recipient/currency is ignored — the charge
// always equals the stored anchor.
//
// Fixture stores only — no network, no live Supabase, no live Stripe.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  issueQuote,
  buildQuoteSnapshot,
  toClientQuote,
} from "../src/server/_lib/quoteService.js";
import {
  createPaymentIntentHandler,
  serverBoundQuote,
} from "../src/server/_lib/createPaymentIntentHandler.js";

const USER = { id: "user-1", email: "u@x.test" };

// Approved public.quotes columns (owner decision: NO migration — the payload
// must fit this list exactly; `id` is DB-generated on insert).
const APPROVED_QUOTE_COLUMNS = new Set([
  "id",
  "user_id",
  "status",
  "recipient_id",
  "send_currency",
  "send_amount_major",
  "send_amount_minor",
  "receive_currency",
  "receive_amount_major",
  "receive_amount_minor",
  "fx_rate",
  "platform_fixed_minor",
  "platform_percent_minor",
  "fx_markup_minor",
  "payout_fixed_minor",
  "payout_percent_minor",
  "compliance_buffer_minor",
  "stripe_fee_minor",
  "total_charge_minor",
  "expires_at",
  "created_at",
  "consumed_at",
  "idempotency_key",
]);

const PHANTOM_FIELDS = [
  "recipient_snapshot",
  "recipient_ref",
  "platform_fee_minor",
  "payout_cost_minor",
  "total_charge_major",
];

function allowAllGates() {
  return async () => ({ ok: true, recipient: null, failures: [], warnings: [] });
}

// Schema-strict fake: mimics PostgREST — any key outside the approved column
// list fails the insert exactly like the live sandbox DB (PGRST204).
function schemaStrictStore() {
  const rows = new Map();
  const seen = { payloads: [] };
  return {
    seen,
    async createQuote(row) {
      seen.payloads.push({ ...row });
      const unknown = Object.keys(row).filter((k) => !APPROVED_QUOTE_COLUMNS.has(k));
      if (unknown.length > 0) {
        return {
          data: null,
          error: {
            code: "PGRST204",
            message: `Could not find the '${unknown[0]}' column in the schema cache`,
          },
        };
      }
      const saved = { ...row, id: `q-${rows.size + 1}` };
      rows.set(saved.id, saved);
      return { data: saved, error: null };
    },
    async getQuoteById(id) {
      return { data: rows.get(String(id)) || null, error: null };
    },
    async getQuoteByIdempotencyKey(key, userId) {
      for (const row of rows.values()) {
        if (row.idempotency_key === String(key) && String(row.user_id) === String(userId)) {
          return { data: { ...row }, error: null };
        }
      }
      return { data: null, error: null };
    },
    async consumeQuote() {
      return { data: null, error: null };
    },
    async cancelQuote() {
      return { data: null, error: null };
    },
  };
}

describe("sandbox fix 1: quote persistence payload has no phantom fields", () => {
  test("buildQuoteSnapshot emits only approved-schema columns", () => {
    const snap = buildQuoteSnapshot({
      userId: USER.id,
      recipientId: "rec-1",
      sendCurrency: "USD",
      receiveCurrency: "NGN",
      sendAmountMajor: 100,
      nowMs: Date.now(),
    });
    for (const field of PHANTOM_FIELDS) {
      assert.ok(!(field in snap), `phantom field present in snapshot: ${field}`);
    }
    const extra = Object.keys(snap).filter((k) => !APPROVED_QUOTE_COLUMNS.has(k));
    assert.deepEqual(extra, [], `snapshot has non-schema keys: ${extra.join(",")}`);
    // The computed total anchor survives (server-owned charge basis).
    assert.ok(Number(snap.total_charge_minor) > 0);
  });

  test("issueQuote insert succeeds against the schema-strict store (was PGRST204 -> 503)", async () => {
    const store = schemaStrictStore();
    const { quote, replayed } = await issueQuote({
      user: USER,
      body: {
        recipientId: "rec-1",
        sendCurrency: "USD",
        sendAmountMajor: 100,
        receiveCurrency: "NGN",
      },
      store,
      gates: allowAllGates(),
    });
    assert.equal(replayed, false);
    assert.ok(quote.id, "quote persisted with an id");
    assert.equal(store.seen.payloads.length, 1);
    const extra = Object.keys(store.seen.payloads[0]).filter(
      (k) => !APPROVED_QUOTE_COLUMNS.has(k)
    );
    assert.deepEqual(extra, []);
  });

  test("read paths still function without phantom columns (fee fallbacks + derived major)", () => {
    const snap = buildQuoteSnapshot({
      userId: USER.id,
      recipientId: "rec-1",
      sendCurrency: "USD",
      receiveCurrency: "NGN",
      sendAmountMajor: 100,
      nowMs: Date.now(),
    });
    const client = toClientQuote({ id: "q-1", ...snap });
    // Fee totals derived from the fixed+percent split columns.
    assert.equal(
      client.fees.platformFeeMinor,
      snap.platform_fixed_minor + snap.platform_percent_minor
    );
    assert.equal(
      client.fees.payoutCostMinor,
      snap.payout_fixed_minor + snap.payout_percent_minor
    );
    assert.equal(client.totalChargeMinor, snap.total_charge_minor);
    assert.equal(client.totalChargeMajor, snap.total_charge_minor / 100);
  });
});

// ---- FIX 2 helpers ----------------------------------------------------------

function makeRes() {
  return {
    statusCode: 0,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    end(body) {
      this.body = body;
    },
  };
}

function makeStripeSpy() {
  const calls = [];
  const stripe = {
    paymentIntents: {
      create: async (params, opts) => {
        calls.push({ params, opts });
        return {
          id: "pi_test_bound",
          client_secret: "pi_test_bound_secret",
          amount: params.amount,
          currency: params.currency,
          status: "requires_payment_method",
          livemode: false,
          payment_method_types: params.payment_method_types,
        };
      },
    },
  };
  return { stripe, calls };
}

const STORED_TOTAL = 10473;
const STORED_QUOTE = {
  id: "q-1",
  user_id: "user-1",
  status: "consumed",
  send_currency: "USD",
  send_amount_minor: 10000,
  receive_currency: "NGN",
  receive_amount_minor: 16500000,
  platform_fixed_minor: 99,
  platform_percent_minor: 0,
  fx_markup_minor: 40,
  payout_fixed_minor: 0,
  payout_percent_minor: 0,
  compliance_buffer_minor: 0,
  total_charge_minor: STORED_TOTAL,
};

function boundTransferStore({ transferOverrides = {}, quoteOverrides = {} } = {}) {
  const transfer = {
    id: "tr-1",
    user_id: "user-1",
    quote_id: "q-1",
    status: "pending_funding",
    send_currency: "USD",
    expected_charge_minor: STORED_TOTAL,
    ...transferOverrides,
  };
  const quote = { ...STORED_QUOTE, ...quoteOverrides };
  return {
    transfer,
    quote,
    async getTransferById(id) {
      if (String(id) !== transfer.id) return { data: null, error: null };
      return { data: { ...transfer }, error: null };
    },
    async getQuoteById(id) {
      if (String(id) !== quote.id) return { data: null, error: null };
      return { data: { ...quote }, error: null };
    },
    async bindPaymentIntent() {
      return { ok: true, error: null };
    },
  };
}

async function callBound(handler, body) {
  const req = {
    method: "POST",
    headers: { authorization: "Bearer sess" },
    body: { transferId: "tr-1", referenceId: "tr-1", currency: "usd", ...body },
    [Symbol.asyncIterator]: async function* () {},
  };
  const res = makeRes();
  await handler(req, res);
  return { res, payload: JSON.parse(res.body) };
}

function boundHandler(store) {
  const { stripe, calls } = makeStripeSpy();
  const handler = createPaymentIntentHandler({
    getStripeImpl: () => stripe,
    requireAuthenticatedUser: async () => ({ ...USER }),
    verifyKyc: async () => ({ ok: true, source: "test", status: "approved" }),
    transferStore: store,
  });
  return { handler, calls };
}

describe("sandbox fix 2: bound-transfer funding is server-authoritative", () => {
  test("serverBoundQuote derives the total EXCLUSIVELY from expected_charge_minor", () => {
    const q = serverBoundQuote(
      { expected_charge_minor: STORED_TOTAL, send_currency: "USD" },
      STORED_QUOTE
    );
    assert.equal(q.totalChargeMinor, STORED_TOTAL);
  });

  test("serverBoundQuote falls back to stored quote total_charge_minor per contract", () => {
    const q = serverBoundQuote(
      { send_currency: "USD" }, // legacy row: no transfer anchor
      STORED_QUOTE
    );
    assert.equal(q.totalChargeMinor, STORED_TOTAL);
  });

  test("tampered client amount cannot affect the charge (PI === stored anchor)", async () => {
    const store = boundTransferStore();
    const { handler, calls } = boundHandler(store);
    const { res, payload } = await callBound(handler, {
      amountMajor: 1, // attacker: charge $1 instead of the $100 quote
      amountMinor: 100,
      amount: 100,
      currency: "usd",
    });
    assert.equal(res.statusCode, 200);
    assert.equal(payload.ok, true);
    assert.equal(payload.amount, STORED_TOTAL);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].params.amount, STORED_TOTAL);
  });

  test("tampered client FX/fees/recipient/currency are ignored on the bound path", async () => {
    const store = boundTransferStore();
    const { handler, calls } = boundHandler(store);
    const { res, payload } = await callBound(handler, {
      amountMajor: 100,
      currency: "eur", // attacker: currency swap
      recipientCurrency: "GHS", // attacker: payout-currency swap
      recipientAmountMinor: 1, // attacker: payout-amount swap
      quote: { recipientGetsMinor: 1 },
      fxRate: 0.01,
    });
    assert.equal(res.statusCode, 200);
    assert.equal(calls[0].params.amount, STORED_TOTAL);
    assert.equal(calls[0].params.currency, "usd");
    assert.equal(payload.amount, STORED_TOTAL);
    // Recipient payout view comes from the STORED quote, not the client.
    assert.equal(payload.metadata.recipientAmountMinor, STORED_QUOTE.receive_amount_minor);
    assert.equal(payload.metadata.recipientCurrency, "ngn");
  });

  test("PI binding persists payment_intent_amount_minor === expected_charge_minor", async () => {
    const store = boundTransferStore();
    let bound = null;
    store.bindPaymentIntent = async (args) => {
      bound = args;
      return { ok: true, error: null };
    };
    const { handler } = boundHandler(store);
    const { res } = await callBound(handler, { amountMajor: 100 });
    assert.equal(res.statusCode, 200);
    assert.ok(bound, "bindPaymentIntent was called");
    assert.equal(bound.paymentIntentAmountMinor, STORED_TOTAL);
    assert.equal(bound.paymentIntentAmountMinor, store.transfer.expected_charge_minor);
  });
});
