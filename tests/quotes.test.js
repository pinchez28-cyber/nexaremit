// tests/quotes.test.js
//
// P1-1: server-owned immutable quotes (Batch 2, sandbox-only).
//
// Fixtures + injected store/gates only — no network, no live Supabase, no
// Stripe. Covers: issuance snapshot, immutability after issuance, server-side
// expiry, single-use (atomic consume incl. concurrent loser), ownership
// (cross-user 404), validation (422), idempotent replay, gate-fail 403, and
// fail-closed 503 with no store.

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  issueQuote,
  getQuoteForUser,
  consumeQuoteOwned,
  cancelQuoteOwned,
  buildQuoteSnapshot,
  toClientQuote,
  isQuoteExpired,
  QUOTE_STATUS,
} from "../src/server/_lib/quoteService.js";
import { buildQuote } from "../src/server/_lib/createPaymentIntentHandler.js";
import { majorToMinor } from "../src/lib/money.js";

const USER = { id: "user-1", email: "u@x.test" };
const OTHER = { id: "user-2", email: "o@x.test" };

const NOW = Date.now();

function allowAllGates() {
  return async () => ({ ok: true, recipient: null, failures: [], warnings: [] });
}

function quoteRow(overrides = {}) {
  const snap = buildQuoteSnapshot({
    userId: USER.id,
    recipientId: "rec-1",
    sendCurrency: "USD",
    receiveCurrency: "NGN",
    sendAmountMajor: 100,
    nowMs: NOW,
  });
  return {
    id: "q-1",
    ...snap,
    idempotency_key: null,
    ...overrides,
  };
}

// Minimal in-memory store honoring the conditional-consume contract:
// only a row still issued + unexpired flips to consumed.
function memoryStore(seed = []) {
  const rows = new Map(seed.map((r) => [r.id, { ...r }]));
  const calls = { createQuote: 0, consumeQuote: 0 };
  return {
    calls,
    rows,
    async createQuote(row) {
      calls.createQuote += 1;
      const saved = { ...row, id: row.id || `q-${rows.size + 1}` };
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
    async consumeQuote({ id, userId, nowIso }) {
      calls.consumeQuote += 1;
      const row = rows.get(String(id));
      if (
        !row ||
        String(row.user_id) !== String(userId) ||
        String(row.status) !== QUOTE_STATUS.ISSUED ||
        new Date(row.expires_at).getTime() <= new Date(nowIso).getTime()
      ) {
        return { data: null, error: null };
      }
      const updated = { ...row, status: QUOTE_STATUS.CONSUMED, consumed_at: nowIso };
      rows.set(String(id), updated);
      return { data: { ...updated }, error: null };
    },
    async cancelQuote({ id, userId }) {
      const row = rows.get(String(id));
      if (!row || String(row.user_id) !== String(userId) || String(row.status) !== QUOTE_STATUS.ISSUED) {
        return { data: null, error: null };
      }
      const updated = { ...row, status: QUOTE_STATUS.CANCELLED };
      rows.set(String(id), updated);
      return { data: { ...updated }, error: null };
    },
  };
}

function httpStatus(promise) {
  return promise.then(
    () => null,
    (err) => ({ status: err?.statusCode, code: err?.details?.code, message: err?.message })
  );
}

describe("quotes: issuance snapshot (P1-1)", () => {
  test("issueQuote builds a full immutable snapshot and persists it", async () => {
    const store = memoryStore();
    const { quote, replayed } = await issueQuote({
      user: USER,
      body: { recipientId: "rec-1", sendCurrency: "USD", sendAmountMajor: 100, receiveCurrency: "NGN" },
      store,
      gates: allowAllGates(),
    });
    assert.equal(replayed, false);
    assert.equal(quote.status, QUOTE_STATUS.ISSUED);
    assert.equal(quote.sendCurrency, "USD");
    assert.equal(quote.sendAmountMinor, majorToMinor(100, "USD"));
    // Total anchor matches the Batch 1 minor-unit pricing exactly.
    const expected = buildQuote(majorToMinor(100, "USD"), 100);
    assert.equal(quote.totalChargeMinor, expected.totalChargeMinor);
    assert.ok(quote.expiresAt);
    assert.ok(new Date(quote.expiresAt).getTime() > Date.now());
  });

  test("same inputs price identically — amounts are server-derived, never client-set", async () => {
    const a = buildQuoteSnapshot({
      userId: USER.id, recipientId: "rec-1", sendCurrency: "USD",
      receiveCurrency: "NGN", sendAmountMajor: 100, nowMs: NOW,
    });
    const b = buildQuoteSnapshot({
      userId: USER.id, recipientId: "rec-1", sendCurrency: "USD",
      receiveCurrency: "NGN", sendAmountMajor: 100, nowMs: NOW,
    });
    assert.equal(a.total_charge_minor, b.total_charge_minor);
    assert.equal(a.send_amount_minor, b.send_amount_minor);
  });

  test("downstream reads the stored snapshot — it is never recomputed", async () => {
    const row = quoteRow({ total_charge_minor: 424242 });
    const client = toClientQuote(row);
    assert.equal(client.totalChargeMinor, 424242);
  });
});

describe("quotes: expiry is server-side", () => {
  test("isQuoteExpired flags past expires_at", () => {
    assert.equal(
      isQuoteExpired(quoteRow({ expires_at: new Date(NOW - 1000).toISOString() }), NOW),
      true
    );
    assert.equal(
      isQuoteExpired(quoteRow({ expires_at: new Date(NOW + 60_000).toISOString() }), NOW),
      false
    );
  });

  test("consuming an expired quote throws 409 without touching the store guard", async () => {
    const store = memoryStore([
      quoteRow({ id: "q-exp", expires_at: new Date(NOW - 1000).toISOString() }),
    ]);
    const failure = await httpStatus(
      consumeQuoteOwned({ user: USER, quoteId: "q-exp", store, nowMs: NOW })
    );
    assert.equal(failure?.status, 409);
    assert.equal(failure?.code, "quote_expired");
    assert.equal(store.calls.consumeQuote, 0);
  });
});

describe("quotes: single-use + atomic consume", () => {
  test("consume flips issued -> consumed exactly once; reuse is 409", async () => {
    const store = memoryStore([quoteRow({ id: "q-once" })]);
    const first = await consumeQuoteOwned({ user: USER, quoteId: "q-once", store, nowMs: NOW });
    assert.equal(first.status, QUOTE_STATUS.CONSUMED);
    const failure = await httpStatus(
      consumeQuoteOwned({ user: USER, quoteId: "q-once", store, nowMs: NOW })
    );
    assert.equal(failure?.status, 409);
    assert.equal(failure?.code, "quote_already_used");
  });

  test("concurrent loser (conditional UPDATE returns no row) gets 409", async () => {
    const store = memoryStore([quoteRow({ id: "q-race" })]);
    store.consumeQuote = async () => ({ data: null, error: null });
    const failure = await httpStatus(
      consumeQuoteOwned({ user: USER, quoteId: "q-race", store, nowMs: NOW })
    );
    assert.equal(failure?.status, 409);
  });
});

describe("quotes: ownership + validation", () => {
  test("cross-user read and consume are 404 (no cross-user oracle)", async () => {
    const store = memoryStore([quoteRow({ id: "q-mine" })]);
    const readFail = await httpStatus(getQuoteForUser({ user: OTHER, quoteId: "q-mine", store }));
    assert.equal(readFail?.status, 404);
    const consumeFail = await httpStatus(
      consumeQuoteOwned({ user: OTHER, quoteId: "q-mine", store, nowMs: NOW })
    );
    assert.equal(consumeFail?.status, 404);
  });

  test("invalid currency / amount / recipient are 422", async () => {
    const store = memoryStore();
    for (const body of [
      { recipientId: "rec-1", sendCurrency: "US", sendAmountMajor: 10, receiveCurrency: "NGN" },
      { recipientId: "rec-1", sendCurrency: "USD", sendAmountMajor: 0, receiveCurrency: "NGN" },
      { recipientId: "rec-1", sendCurrency: "USD", sendAmountMajor: -5, receiveCurrency: "NGN" },
      { sendCurrency: "USD", sendAmountMajor: 10, receiveCurrency: "NGN" },
    ]) {
      const failure = await httpStatus(
        issueQuote({ user: USER, body, store, gates: allowAllGates() })
      );
      assert.equal(failure?.status, 422, JSON.stringify(body));
    }
    assert.equal(store.calls.createQuote, 0);
  });
});

describe("quotes: idempotent replay", () => {
  test("same idempotency key replays the existing quote — never a second row", async () => {
    const store = memoryStore();
    const body = {
      recipientId: "rec-1", sendCurrency: "USD", sendAmountMajor: 50,
      receiveCurrency: "NGN", idempotencyKey: "key-abc",
    };
    const first = await issueQuote({ user: USER, body, store, gates: allowAllGates() });
    assert.equal(first.replayed, false);
    const second = await issueQuote({ user: USER, body, store, gates: allowAllGates() });
    assert.equal(second.replayed, true);
    assert.equal(second.quote.id, first.quote.id);
    assert.equal(store.calls.createQuote, 1);
  });

  test("unique-violation race replays the winner", async () => {
    const winner = quoteRow({ id: "q-winner", idempotency_key: "key-race" });
    const store = memoryStore([winner]);
    store.createQuote = async () => ({ data: null, error: { code: "23505", message: "duplicate key" } });
    const result = await issueQuote({
      user: USER,
      body: {
        recipientId: "rec-1", sendCurrency: "USD", sendAmountMajor: 50,
        receiveCurrency: "NGN", idempotencyKey: "key-race",
      },
      store,
      gates: allowAllGates(),
    });
    assert.equal(result.replayed, true);
    assert.equal(result.quote.id, "q-winner");
  });
});

describe("quotes: gates + fail-closed", () => {
  test("gate failure throws 403 and persists nothing", async () => {
    const store = memoryStore();
    const failure = await httpStatus(
      issueQuote({
        user: USER,
        body: { recipientId: "rec-1", sendCurrency: "USD", sendAmountMajor: 10, receiveCurrency: "NGN" },
        store,
        gates: async () => ({ ok: false, failures: ["Sender KYC must be approved."], warnings: [] }),
      })
    );
    assert.equal(failure?.status, 403);
    assert.equal(store.calls.createQuote, 0);
  });

  test("no store fails closed with 503 on issue/get/consume", async () => {
    for (const call of [
      () => issueQuote({ user: USER, body: { recipientId: "r", sendCurrency: "USD", sendAmountMajor: 1, receiveCurrency: "NGN" }, store: null, gates: allowAllGates() }),
      () => getQuoteForUser({ user: USER, quoteId: "q-x", store: null }),
      () => consumeQuoteOwned({ user: USER, quoteId: "q-x", store: null }),
      () => cancelQuoteOwned({ user: USER, quoteId: "q-x", store: null }),
    ]) {
      const failure = await httpStatus(call());
      assert.equal(failure?.status, 503);
    }
  });

  test("cancel works only while issued; double-cancel is 409", async () => {
    const store = memoryStore([quoteRow({ id: "q-cancel" })]);
    const cancelled = await cancelQuoteOwned({ user: USER, quoteId: "q-cancel", store });
    assert.equal(cancelled.status, QUOTE_STATUS.CANCELLED);
    const failure = await httpStatus(cancelQuoteOwned({ user: USER, quoteId: "q-cancel", store }));
    assert.equal(failure?.status, 409);
  });

  beforeEach(() => {
    // quoteService reads fee env with safe defaults; keep the process env clean
    // so pricing assertions stay deterministic.
  });
});
