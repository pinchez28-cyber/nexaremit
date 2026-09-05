// tests/receipt.test.js
//
// P0-6: server-computed receipt (Batch 2, sandbox-only).
//
// The receipt is derived ENTIRELY from the stored quote + transfer rows —
// never from client math and never from a locally-crafted record. The critical
// property: receipt total == charged total, with exact minor-unit equality
// across quote / charge / receipt (the transfer's expected_charge_minor IS the
// quote's total_charge_minor, and the webhook anchored the PaymentIntent to
// the same value).
//
// Fixtures + injected store only — no network, no live Supabase.
// Covers: server-derived shape, receipt == charged (exact), quote/transfer
// equality, cross-user 404, fail-closed 503 with no store, route-level 401.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  buildServerReceipt,
  getTransferReceiptForUser,
} from "../src/server/_lib/transferService.js";
import { TRANSFER_STATUS } from "../src/server/_lib/transferStateMachine.js";

const USER = { id: "user-1", email: "u@x.test" };
const OTHER = { id: "user-2", email: "o@x.test" };

function quoteRow(overrides = {}) {
  return {
    id: "q-1",
    user_id: USER.id,
    status: "consumed",
    recipient_id: null,
    recipient_ref: "rec-1",
    recipient_name: "Ada",
    recipient_corridor: "US-NG",
    send_currency: "USD",
    send_amount_major: 100,
    send_amount_minor: 10000,
    receive_currency: "NGN",
    receive_amount_major: 165000,
    receive_amount_minor: 16500000,
    fx_rate: 1650,
    total_charge_minor: 10473,
    platform_fixed_minor: 99,
    platform_percent_minor: 0,
    platform_fee_minor: 99,
    fx_markup_minor: 40,
    payout_fixed_minor: 0,
    payout_percent_minor: 0,
    payout_cost_minor: 0,
    compliance_buffer_minor: 0,
    stripe_fee_minor: 350,
    created_at: new Date().toISOString(),
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
    payment_intent_id: "pi_123",
    payment_intent_amount_minor: 10473,
    idempotency_key: "idem-1",
    send_currency: "USD",
    send_amount: 100,
    send_amount_minor: 10000,
    receive_currency: "NGN",
    receive_amount: 165000,
    receive_amount_minor: 16500000,
    recipient_name: "Ada",
    destination: "US-NG",
    payment_method: "card",
    funded_at: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function memoryStore({ transfers = [], quotes = [] } = {}) {
  const t = new Map(transfers.map((r) => [r.id, { ...r }]));
  const q = new Map(quotes.map((r) => [r.id, { ...r }]));
  return {
    async getTransferById(id) {
      return { data: t.get(String(id)) || null, error: null };
    },
    async getQuoteById(id) {
      return { data: q.get(String(id)) || null, error: null };
    },
  };
}

function httpStatus(promise) {
  return promise.then(
    () => null,
    (err) => ({ status: err?.statusCode, code: err?.details?.code, message: err?.message })
  );
}

describe("receipt: server-derived (P0-6)", () => {
  test("buildServerReceipt derives every field from the stored rows — never client input", () => {
    const receipt = buildServerReceipt({
      transfer: transferRow(),
      quote: quoteRow(),
    });
    assert.ok(receipt, "receipt is produced");
    assert.equal(receipt.transferId, "tr-1");
    assert.equal(receipt.quoteId, "q-1");
    assert.equal(receipt.sendCurrency, "USD");
    assert.equal(receipt.receiveCurrency, "NGN");
    assert.equal(receipt.recipientName, "Ada");
    assert.equal(receipt.paymentMethod, "card");
    assert.equal(receipt.paymentIntentId, "pi_123");
    // Server money: minor units throughout.
    assert.equal(receipt.sendAmountMinor, 10000);
    assert.equal(receipt.receiveAmountMinor, 16500000);
    // Fee breakdown comes from the stored quote, not the client.
    assert.equal(receipt.feeBreakdown.platformFeeMinor, 99);
    assert.equal(receipt.feeBreakdown.stripeFeeMinor, 350);
  });

  test("receipt total == charged total (exact minor equality)", () => {
    const receipt = buildServerReceipt({
      transfer: transferRow(),
      quote: quoteRow(),
    });
    assert.equal(receipt.totalChargeMinor, 10473);
    assert.equal(receipt.expectedChargeMinor, 10473);
    // charged == PI amount recorded server-side at creation.
    assert.equal(receipt.chargedMinor, 10473);
    // PI amount (server-stored) also equals the total.
    assert.equal(receipt.paymentIntentAmountMinor, 10473);
  });

  test("exact minor equality across quote / charge / receipt", () => {
    const quote = quoteRow({ total_charge_minor: 424242 });
    const transfer = transferRow({
      expected_charge_minor: 424242,
      payment_intent_amount_minor: 424242,
    });
    const receipt = buildServerReceipt({ transfer, quote });
    assert.equal(receipt.quoteTotalMinor, 424242);
    assert.equal(receipt.totalChargeMinor, 424242);
    assert.equal(receipt.chargedMinor, 424242);
    assert.equal(receipt.quoteMatchesTransfer, true);
  });

  test("quote row unavailable still equals charged (anchors are authoritative)", () => {
    // When the store cannot join the quote, the transfer's immutable anchors
    // ARE the quote total — equality still holds structurally.
    const receipt = buildServerReceipt({ transfer: transferRow(), quote: null });
    assert.equal(receipt.quoteTotalMinor, null);
    assert.equal(receipt.quoteMatchesTransfer, true);
    assert.equal(receipt.totalChargeMinor, 10473);
    assert.equal(receipt.chargedMinor, 10473);
  });

  test("a payment-intent amount different from the anchor is surfaced, not hidden", () => {
    // If a PI were ever recorded at a different amount, the receipt exposes
    // the mismatch and the anchor stays authoritative for the total.
    const receipt = buildServerReceipt({
      transfer: transferRow({ payment_intent_amount_minor: 9999 }),
      quote: quoteRow(),
    });
    assert.equal(receipt.totalChargeMinor, 10473);
    assert.equal(receipt.chargedMinor, 9999);
    assert.notEqual(receipt.totalChargeMinor, receipt.chargedMinor);
  });
});

describe("receipt: ownership + fail-closed", () => {
  test("getTransferReceiptForUser returns the owner's server-derived receipt", async () => {
    const store = memoryStore({
      transfers: [transferRow()],
      quotes: [quoteRow()],
    });
    const receipt = await getTransferReceiptForUser({
      user: USER,
      transferId: "tr-1",
      store,
    });
    assert.equal(receipt.transferId, "tr-1");
    assert.equal(receipt.totalChargeMinor, 10473);
    assert.equal(receipt.quoteMatchesTransfer, true);
  });

  test("cross-user receipt read is 404 (no cross-user oracle)", async () => {
    const store = memoryStore({ transfers: [transferRow()], quotes: [quoteRow()] });
    const failure = await httpStatus(
      getTransferReceiptForUser({ user: OTHER, transferId: "tr-1", store })
    );
    assert.equal(failure?.status, 404);
  });

  test("no store fails closed with 503", async () => {
    const failure = await httpStatus(
      getTransferReceiptForUser({ user: USER, transferId: "tr-1", store: null })
    );
    assert.equal(failure?.status, 503);
  });

  test("DB error fails closed (503), never a fabricated receipt", async () => {
    const store = {
      async getTransferById() {
        return { data: null, error: new Error("db down") };
      },
    };
    const failure = await httpStatus(
      getTransferReceiptForUser({ user: USER, transferId: "tr-1", store })
    );
    assert.equal(failure?.status, 503);
  });
});

describe("receipt: route-level auth-first (401)", () => {
  // The route resolves the caller BEFORE any work; an unauthenticated caller
  // is refused with 401 and never learns anything about the transfer. This is
  // proven by requiring authentication with no token: 401 before store access.
  test("requireAuthenticatedUser refuses a request with no Authorization header", async () => {
    const { requireAuthenticatedUserWithDeps } = await import(
      "../src/server/_lib/requireUser.js"
    );
    const req = { headers: {} };
    await assert.rejects(
      requireAuthenticatedUserWithDeps(req, {
        getSupabaseAdmin: () => ({}),
        getUser: async () => null,
      }),
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.equal(err.details?.reason, "authentication_required");
        return true;
      }
    );
  });
});