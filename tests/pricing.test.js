// tests/pricing.test.js
//
// Fee / gross-up pricing (P1-3) and the Stripe gross-up formula.
// Everything here works in minor units; currency exponents are applied at the
// edges by money.js.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  priceTransfer,
  totalCostPercent,
  DEFAULT_PRICING,
  convertRecipientAmountMinor,
} from "../src/lib/pricing.js";

describe("priceTransfer (pricing.js)", () => {
  test("USD 100.00: default fees produce the exact expected charge", () => {
    const q = priceTransfer({ sendAmountMinor: 10000, currency: "USD" });
    // Base = 10000 + 99 platform + 40 fx markup = 10139.
    // Gross-up: ceil((10139+30) / (1-0.029)) = 10473.
    // The customer-visible fee is the charge minus what was sent: 473.
    // (stripeFeeMinor is Stripe's cut — 10473 - 10139 = 334 — which is NOT
    // the fee the customer is quoted.)
    assert.equal(q.sendAmountMinor, 10000);
    assert.equal(q.platformFeeMinor, 99);
    assert.equal(q.fxMarkupMinor, 40);
    assert.equal(q.stripeFeeMinor, 334);
    assert.equal(q.totalChargeMinor, 10473);
    assert.equal(q.feeMinor, 473);
    assert.equal(q.feeMinor, q.totalChargeMinor - q.sendAmountMinor);
  });

  test("USD full breakdown across all fee components", () => {
    const config = {
      platformFixedCents: 99,
      platformPercentBps: 120, // 1.2%
      fxMarkupBps: 40,
      payoutFixedCents: 500,
      payoutPercentBps: 300, // 3%
      complianceBufferCents: 250,
      stripePercentBps: 290,
      stripeFixedCents: 30,
    };
    const q = priceTransfer({ sendAmountMinor: 100000, currency: "USD", config });
    assert.equal(q.sendAmountMinor, 100000);
    assert.equal(q.platformFeeMinor, 99 + Math.ceil(100000 * 0.012)); // 99 + 1200
    assert.equal(q.fxMarkupMinor, Math.ceil(100000 * 0.004));
    assert.equal(q.payoutCostMinor, 500 + Math.ceil(100000 * 0.03));
    assert.equal(q.complianceBufferMinor, 250);
    const base =
      100000 + 99 + Math.ceil(100000 * 0.012) + Math.ceil(100000 * 0.004) + 500 + Math.ceil(100000 * 0.03) + 250;
    const expectedTotal = Math.ceil((base + 30) / (1 - 0.029));
    assert.equal(q.totalChargeMinor, expectedTotal);
    assert.ok(q.totalChargeMinor > q.sendAmountMinor);
  });

  test("zero-decimal currency (JPY) pricing stays in yen, no /100", () => {
    const q = priceTransfer({ sendAmountMinor: 5000, currency: "JPY" });
    assert.equal(q.sendAmountMinor, 5000);
    assert.equal(q.sendAmount, 5000); // minorToMajor(5000, JPY) = 5000
    assert.ok(Number.isInteger(q.totalChargeMinor));
    assert.equal(q.totalChargeMinor, q.sendAmountMinor + q.feeMinor);
  });

  test("three-decimal currency (BHD) pricing stays in fils, no /1000", () => {
    const q = priceTransfer({ sendAmountMinor: 1250, currency: "BHD" });
    assert.equal(q.sendAmountMinor, 1250);
    assert.equal(q.sendAmount, 1.25); // major
    assert.equal(q.totalChargeMinor, q.sendAmountMinor + q.feeMinor);
  });

  test("fees are never negative and never greater than the charge", () => {
    for (const minor of [1, 99, 100, 1000, 250000]) {
      const q = priceTransfer({ sendAmountMinor: minor, currency: "USD" });
      assert.ok(q.feeMinor >= 0);
      assert.ok(q.totalChargeMinor >= q.sendAmountMinor);
      assert.ok(q.stripeFeeMinor >= 0);
    }
  });

  test("send 0 returns an all-zero quote", () => {
    const q = priceTransfer({ sendAmountMinor: 0, currency: "USD" });
    assert.equal(q.totalChargeMinor, 0);
    assert.equal(q.feeMinor, 0);
  });
});

describe("totalCostPercent", () => {
  test("computes fee share of send amount", () => {
    const q = priceTransfer({ sendAmountMinor: 10000, currency: "USD" });
    assert.ok(totalCostPercent(q) > 0);
    assert.ok(totalCostPercent(q) < 100);
    assert.equal(totalCostPercent({ sendAmountMinor: 0 }), 0);
    assert.equal(totalCostPercent(null), 0);
  });
});

describe("convertRecipientAmountMinor (P1-3 recipient amount)", () => {
  test("2-decimal receive currency (NGN): major -> minor with exponent 100", () => {
    assert.equal(
      convertRecipientAmountMinor(2575000, "NGN", 100),
      257500000
    );
  });

  test("0-decimal receive currency (JPY): major -> minor with exponent 1", () => {
    assert.equal(convertRecipientAmountMinor(5000, "JPY", 1), 5000);
  });

  test("3-decimal receive currency (BHD): major -> minor with exponent 1000", () => {
    assert.equal(convertRecipientAmountMinor(1.25, "BHD", 1000), 1250);
  });

  test("invalid input returns 0 (fail-safe)", () => {
    assert.equal(convertRecipientAmountMinor("abc", "NGN", 100), 0);
    assert.equal(convertRecipientAmountMinor(-5, "NGN", 100), 0);
    assert.equal(convertRecipientAmountMinor(0, "NGN", 100), 0);
  });
});

// Stripe gross-up is the single most important pricing invariant: charging
// base + 2.9% rather than grossing up would leave the platform short.
test("Stripe gross-up ceil((base+fixed)/(1-rate)) never undercharges", () => {
  const rate = 0.029;
  const fixed = 30;
  for (const base of [100, 1000, 10000, 50123, 999999]) {
    const charge = Math.ceil((base + fixed) / (1 - rate));
    const afterStripe = charge - charge * rate - fixed;
    assert.ok(
      afterStripe + 1 >= base, // within 1 minor unit (ceil) of covering base
      `charge ${charge} must leave at least base ${base} after Stripe's cut`
    );
  }
});

test("DEFAULT_PRICING matches the env defaults in buildQuote (99/40/0/0/0/290/30)", () => {
  assert.equal(DEFAULT_PRICING.platformFixedCents, 99);
  assert.equal(DEFAULT_PRICING.fxMarkupBps, 40);
  assert.equal(DEFAULT_PRICING.stripePercentBps, 290);
  assert.equal(DEFAULT_PRICING.stripeFixedCents, 30);
});