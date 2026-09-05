// tests/transfers.test.js
//
// P1-2: server-owned transfers (Batch 2, sandbox-only).
//
// Fixtures + injected store/gates only — no network, no live Supabase.
// Covers: state-machine legal/illegal edges, terminal states, 409 on illegal
// transitions; createTransfer gate re-run (403), atomic quote consumption,
// duplicate-submit replay (200-style), cancel rules; cross-user 404;
// fail-closed 503 with no store.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  TRANSFER_STATUS,
  canTransitionTransfers,
  isTerminalTransferStatus,
  assertLegalTransferTransition,
} from "../src/server/_lib/transferStateMachine.js";
import {
  createTransfer,
  getTransferForUser,
  cancelTransfer,
  transitionTransferStatus,
  parseTransferSubmitBody,
  buildTransferRow,
  runFullTransferGates,
} from "../src/server/_lib/transferService.js";

const USER = { id: "user-1", email: "u@x.test" };
const OTHER = { id: "user-2", email: "o@x.test" };

function quoteRow(overrides = {}) {
  const now = Date.now();
  return {
    id: "q-1",
    user_id: USER.id,
    status: "issued",
    recipient_id: null,
    recipient_ref: "rec-1",
    recipient_name: "Ada",
    recipient_corridor: "US-NG",
    recipient_limit: 2500,
    send_currency: "USD",
    send_amount_major: 100,
    send_amount_minor: 10000,
    receive_currency: "NGN",
    receive_amount_major: 165000,
    receive_amount_minor: 16500000,
    fx_rate: 1650,
    total_charge_minor: 10473,
    expires_at: new Date(now + 15 * 60_000).toISOString(),
    created_at: new Date(now).toISOString(),
    ...overrides,
  };
}

function transferRow(overrides = {}) {
  return {
    id: "tr-1",
    user_id: USER.id,
    status: TRANSFER_STATUS.PENDING_FUNDING,
    quote_id: "q-1",
    expected_charge_minor: 10473,
    idempotency_key: "idem-1",
    send_currency: "USD",
    send_amount: 100,
    receive_currency: "NGN",
    receive_amount: 165000,
    recipient_name: "Ada",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

// In-memory service store: quotes + transfers with conditional semantics.
function memoryStore({ quotes = [], transfers = [] } = {}) {
  const q = new Map(quotes.map((r) => [r.id, { ...r }]));
  const t = new Map(transfers.map((r) => [r.id, { ...r }]));
  const audits = [];
  return {
    audits,
    async getQuoteById(id) {
      return { data: q.get(String(id)) || null, error: null };
    },
    async consumeQuote({ id, userId, nowIso }) {
      const row = q.get(String(id));
      if (
        !row ||
        String(row.user_id) !== String(userId) ||
        String(row.status) !== "issued" ||
        new Date(row.expires_at).getTime() <= new Date(nowIso).getTime()
      ) {
        return { data: null, error: null };
      }
      const updated = { ...row, status: "consumed", consumed_at: nowIso };
      q.set(String(id), updated);
      return { data: { ...updated }, error: null };
    },
    async getByIdempotencyKey({ key, userId }) {
      for (const row of t.values()) {
        if (row.idempotency_key === String(key) && String(row.user_id) === String(userId)) {
          return { data: { ...row }, error: null };
        }
      }
      return { data: null, error: null };
    },
    async createTransfer(row) {
      const saved = { ...row, id: row.id || `tr-${t.size + 1}` };
      t.set(saved.id, saved);
      return { data: { ...saved }, error: null };
    },
    async getTransferById(id) {
      return { data: t.get(String(id)) || null, error: null };
    },
    async listTransfers({ userId }) {
      return {
        data: [...t.values()].filter((r) => String(r.user_id) === String(userId)),
        error: null,
      };
    },
    async updateTransferStatus({ id, userId, fromStatus, toStatus, patch }) {
      const row = t.get(String(id));
      if (!row || (userId && String(row.user_id) !== String(userId))) {
        return { data: null, error: null };
      }
      if (String(row.status) !== String(fromStatus)) return { data: null, error: null };
      const updated = { ...row, status: toStatus, ...(patch || {}) };
      t.set(String(id), updated);
      return { data: { ...updated }, error: null };
    },
    async audit(entry) {
      audits.push(entry);
      return { persisted: true };
    },
  };
}

const PASS_GATES = {
  kyc: { ok: true },
  sanctions: { status: "clear" },
  risk: { status: "clear" },
  velocity: { available: true, dailyAmount: 0, monthlyAmount: 0, dailyCount: 0 },
};

function httpStatus(promise) {
  return promise.then(
    () => null,
    (err) => ({ status: err?.statusCode, code: err?.details?.code, message: err?.message })
  );
}

describe("transfers: state machine legal edges", () => {
  test("pending_funding fans out to funded/cancelled/expired/reconciliation_failed", () => {
    for (const to of [
      TRANSFER_STATUS.FUNDED,
      TRANSFER_STATUS.CANCELLED,
      TRANSFER_STATUS.EXPIRED,
      TRANSFER_STATUS.RECONCILIATION_FAILED,
    ]) {
      assert.equal(canTransitionTransfers(TRANSFER_STATUS.PENDING_FUNDING, to), true, to);
    }
  });

  test("funded advances only to payout_pending (or reserved refunded)", () => {
    assert.equal(
      canTransitionTransfers(TRANSFER_STATUS.FUNDED, TRANSFER_STATUS.PAYOUT_PENDING),
      true
    );
    assert.equal(
      canTransitionTransfers(TRANSFER_STATUS.FUNDED, TRANSFER_STATUS.CANCELLED),
      false
    );
  });

  test("terminal states have no outgoing edges", () => {
    for (const s of [
      TRANSFER_STATUS.PAYOUT_PENDING,
      TRANSFER_STATUS.CANCELLED,
      TRANSFER_STATUS.EXPIRED,
      TRANSFER_STATUS.RECONCILIATION_FAILED,
    ]) {
      assert.equal(isTerminalTransferStatus(s), true, s);
      assert.equal(canTransitionTransfers(s, TRANSFER_STATUS.FUNDED), false, s);
      assert.equal(canTransitionTransfers(s, TRANSFER_STATUS.PENDING_FUNDING), false, s);
    }
  });

  test("no reverse or skip edges: payout_pending never returns to funded", () => {
    assert.equal(
      canTransitionTransfers(TRANSFER_STATUS.PAYOUT_PENDING, TRANSFER_STATUS.FUNDED),
      false
    );
    assert.equal(
      canTransitionTransfers(TRANSFER_STATUS.PENDING_FUNDING, TRANSFER_STATUS.PAYOUT_PENDING),
      false
    );
    assert.equal(
      canTransitionTransfers(TRANSFER_STATUS.PENDING_FUNDING, TRANSFER_STATUS.PAID),
      false
    );
  });

  test("assertLegalTransferTransition throws 409 with illegal_transition on bad edges", () => {
    assert.throws(
      () => assertLegalTransferTransition("pending_funding", "paid"),
      (err) => err?.statusCode === 409 && err?.details?.code === "illegal_transition"
    );
    assert.doesNotThrow(() =>
      assertLegalTransferTransition("pending_funding", "funded")
    );
  });
});

describe("transfers: createTransfer (P1-2)", () => {
  test("happy path creates pending_funding anchored to the quote total", async () => {
    const store = memoryStore({ quotes: [quoteRow()] });
    const { transfer, replayed } = await createTransfer({
      user: USER,
      body: { quoteId: "q-1", idempotencyKey: "idem-1" },
      store,
      gates: PASS_GATES,
    });
    assert.equal(replayed, false);
    assert.equal(transfer.status, TRANSFER_STATUS.PENDING_FUNDING);
    assert.equal(transfer.expectedChargeMinor, 10473);
    assert.equal(transfer.quoteId, "q-1");
  });

  test("duplicate submit with the same idempotencyKey replays — one transfer only", async () => {
    const store = memoryStore({ quotes: [quoteRow()] });
    const body = { quoteId: "q-1", idempotencyKey: "idem-dup" };
    const first = await createTransfer({ user: USER, body, store, gates: PASS_GATES });
    assert.equal(first.replayed, false);
    const second = await createTransfer({ user: USER, body, store, gates: PASS_GATES });
    assert.equal(second.replayed, true);
    assert.equal(second.transfer.id, first.transfer.id);
  });

  test("unique-violation race on insert replays the winner", async () => {
    const winner = transferRow({ id: "tr-winner", idempotency_key: "idem-race" });
    const store = memoryStore({ quotes: [quoteRow()], transfers: [winner] });
    store.createTransfer = async () => ({
      data: null,
      error: { code: "23505", message: "duplicate key value" },
    });
    const result = await createTransfer({
      user: USER,
      body: { quoteId: "q-1", idempotencyKey: "idem-race" },
      store,
      gates: PASS_GATES,
    });
    assert.equal(result.replayed, true);
    assert.equal(result.transfer.id, "tr-winner");
  });

  test("already-consumed/expired quote is 409 — never a second transfer", async () => {
    const store = memoryStore({ quotes: [quoteRow({ id: "q-used", status: "consumed" })] });
    const failure = await httpStatus(
      createTransfer({
        user: USER,
        body: { quoteId: "q-used", idempotencyKey: "idem-x" },
        store,
        gates: PASS_GATES,
      })
    );
    assert.equal(failure?.status, 409);
  });

  test("concurrent quote-consumption loser is 409", async () => {
    const store = memoryStore({ quotes: [quoteRow()] });
    store.consumeQuote = async () => ({ data: null, error: null });
    const failure = await httpStatus(
      createTransfer({
        user: USER,
        body: { quoteId: "q-1", idempotencyKey: "idem-y" },
        store,
        gates: PASS_GATES,
      })
    );
    assert.equal(failure?.status, 409);
  });

  test("gate failure is 403 and consumes nothing", async () => {
    const store = memoryStore({ quotes: [quoteRow()] });
    const failing = {
      ...PASS_GATES,
      kyc: { ok: false, code: "kyc_required" },
    };
    const failure = await httpStatus(
      createTransfer({
        user: USER,
        body: { quoteId: "q-1", idempotencyKey: "idem-g" },
        store,
        gates: failing,
      })
    );
    assert.equal(failure?.status, 403);
    assert.equal(store.audits.length, 0);
  });

  test("cross-user quote is 404; missing body fields are 422", async () => {
    const store = memoryStore({ quotes: [quoteRow()] });
    const cross = await httpStatus(
      createTransfer({
        user: OTHER,
        body: { quoteId: "q-1", idempotencyKey: "idem-z" },
        store,
        gates: PASS_GATES,
      })
    );
    assert.equal(cross?.status, 404);
    const missing = await httpStatus(
      createTransfer({ user: USER, body: {}, store, gates: PASS_GATES })
    );
    assert.equal(missing?.status, 422);
  });

  test("no store fails closed with 503", async () => {
    const failure = await httpStatus(
      createTransfer({
        user: USER,
        body: { quoteId: "q-1", idempotencyKey: "k" },
        store: null,
        gates: PASS_GATES,
      })
    );
    assert.equal(failure?.status, 503);
  });
});

describe("transfers: read + cancel rules", () => {
  test("getTransferForUser returns the owner's transfer, 404 for others", async () => {
    const store = memoryStore({ transfers: [transferRow()] });
    const mine = await getTransferForUser({ user: USER, transferId: "tr-1", store });
    assert.equal(mine.id, "tr-1");
    const cross = await httpStatus(
      getTransferForUser({ user: OTHER, transferId: "tr-1", store })
    );
    assert.equal(cross?.status, 404);
  });

  test("cancel works only from pending_funding; funded cancel is 409", async () => {
    const store = memoryStore({
      transfers: [transferRow({ id: "tr-c" }), transferRow({ id: "tr-f", status: "funded" })],
    });
    const cancelled = await cancelTransfer({ user: USER, transferId: "tr-c", store });
    assert.equal(cancelled.status, TRANSFER_STATUS.CANCELLED);
    const failure = await httpStatus(cancelTransfer({ user: USER, transferId: "tr-f", store }));
    assert.equal(failure?.status, 409);
  });

  test("transitionTransferStatus enforces the machine (wrong-state 409)", async () => {
    const store = memoryStore({ transfers: [transferRow({ id: "tr-t" })] });
    const moved = await transitionTransferStatus({
      user: USER,
      transferId: "tr-t",
      fromStatus: "pending_funding",
      toStatus: "funded",
      store,
    });
    assert.equal(moved.status, "funded");
    const stale = await httpStatus(
      transitionTransferStatus({
        user: USER,
        transferId: "tr-t",
        fromStatus: "pending_funding",
        toStatus: "cancelled",
        store,
      })
    );
    assert.equal(stale?.status, 409);
  });

  test("parseTransferSubmitBody rejects amount-carrying or keyless bodies (422)", async () => {
    assert.throws(() => parseTransferSubmitBody({}), (e) => e?.statusCode === 422);
    assert.throws(
      () => parseTransferSubmitBody({ quoteId: "q-1" }),
      (e) => e?.statusCode === 422
    );
    // ids + key only: amounts are never accepted here.
    const parsed = parseTransferSubmitBody({ quoteId: "q-1", idempotencyKey: "k-1" });
    assert.equal(parsed.quoteId, "q-1");
  });

  test("buildTransferRow copies the immutable anchors (no re-quote)", async () => {
    const row = buildTransferRow({ user: USER, quote: quoteRow(), idempotencyKey: "k" });
    assert.equal(row.expected_charge_minor, 10473);
    assert.equal(row.status, TRANSFER_STATUS.PENDING_FUNDING);
    assert.equal(row.quote_id, "q-1");
  });

  test("runFullTransferGates maps KYC fail to a failure entry", async () => {
    const result = await runFullTransferGates({
      user: USER,
      quote: quoteRow(),
      gates: { ...PASS_GATES, kyc: { ok: false } },
    });
    assert.ok(result.failures.length > 0);
  });
});
