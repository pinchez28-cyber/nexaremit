// tests/safety-engine.test.js
//
// Pre-transfer safety-engine rules (P2-1: highest-risk existing pure logic).
// The engine is pure and takes everything as arguments, so it tests cleanly
// with no database and no network.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { runTransferSafetyChecks } from "../src/server/_lib/safetyEngine.js";

function baseArgs(overrides = {}) {
  return {
    user: { id: "u1" },
    amount: 500,
    currency: "USD",
    recipient: { name: "Recipient One", corridor: "US-NG", limit: 2500 },
    quote: {},
    kyc: { status: "approved" },
    sanctions: { status: "clear" },
    risk: { status: "clear" },
    velocity: { available: true, dailyAmount: 0, monthlyAmount: 0, dailyCount: 0 },
    velocityLimits: { dailyAmount: 2500, monthlyAmount: 10000, dailyCount: 10 },
    allowUnscreened: false,
    ...overrides,
  };
}

describe("safety-engine rules", () => {
  test("all-clear transfer passes with no failures", () => {
    const result = runTransferSafetyChecks(baseArgs());
    assert.equal(result.passed, true);
    assert.deepEqual(result.failures, []);
  });

  test("unauthenticated user fails", () => {
    const result = runTransferSafetyChecks(baseArgs({ user: {} }));
    assert.equal(result.passed, false);
    assert.ok(result.failures.some((f) => f.includes("authenticated")));
  });

  test("KYC not approved fails", () => {
    const result = runTransferSafetyChecks(
      baseArgs({ kyc: { status: "pending" } })
    );
    assert.equal(result.passed, false);
    assert.ok(result.failures.some((f) => f.includes("KYC")));
  });

  test("sanctions blocked fails closed", () => {
    const result = runTransferSafetyChecks(
      baseArgs({ sanctions: { status: "blocked" } })
    );
    assert.equal(result.passed, false);
    assert.ok(result.failures.some((f) => f.includes("sanctions")));
  });

  test("sanctions not configured fails unless allowUnscreened (recorded warning)", () => {
    const no = runTransferSafetyChecks(
      baseArgs({ sanctions: { status: "not_configured" } })
    );
    assert.equal(no.passed, false);

    const yes = runTransferSafetyChecks(
      baseArgs({ sanctions: { status: "not_configured" }, allowUnscreened: true })
    );
    assert.equal(yes.passed, true);
    assert.ok(yes.warnings.some((w) => w.includes("NEXA_ALLOW_UNSCREENED")));
  });

  test("risk blocked fails; manual_review warns but passes", () => {
    const blocked = runTransferSafetyChecks(baseArgs({ risk: { status: "blocked" } }));
    assert.equal(blocked.passed, false);

    const review = runTransferSafetyChecks(baseArgs({ risk: { status: "manual_review" } }));
    assert.equal(review.passed, true);
    assert.ok(review.warnings.some((w) => w.includes("manual review")));
  });

  test("recipient required", () => {
    const result = runTransferSafetyChecks(baseArgs({ recipient: {} }));
    assert.equal(result.passed, false);
    assert.ok(result.failures.some((f) => f.includes("Recipient")));
  });

  test("corridor allowlist enforced", () => {
    const result = runTransferSafetyChecks(
      baseArgs({ recipient: { name: "R", corridor: "XX-YY", limit: 2500 } })
    );
    assert.equal(result.passed, false);
    assert.ok(result.failures.some((f) => f.includes("corridor")));
  });

  test("amount must be positive", () => {
    const zero = runTransferSafetyChecks(baseArgs({ amount: 0 }));
    const neg = runTransferSafetyChecks(baseArgs({ amount: -10 }));
    assert.equal(zero.passed, false);
    assert.equal(neg.passed, false);
  });

  test("per-recipient limit enforced", () => {
    const result = runTransferSafetyChecks(
      baseArgs({ amount: 3000, recipient: { name: "R", corridor: "US-NG", limit: 2500 } })
    );
    assert.equal(result.passed, false);
    assert.ok(result.failures.some((f) => f.includes("exceeds recipient limit")));
  });

  test("velocity: daily cap, monthly cap, and daily count all bite", () => {
    const overDaily = runTransferSafetyChecks(
      baseArgs({ velocity: { available: true, dailyAmount: 2400, monthlyAmount: 2400, dailyCount: 5 } })
    );
    assert.equal(overDaily.passed, false);
    assert.ok(overDaily.failures.some((f) => f.includes("daily limit")));

    const overMonthly = runTransferSafetyChecks(
      baseArgs({ velocity: { available: true, dailyAmount: 0, monthlyAmount: 9800, dailyCount: 0 } })
    );
    assert.equal(overMonthly.passed, false);
    assert.ok(overMonthly.failures.some((f) => f.includes("30-day limit")));

    const overCount = runTransferSafetyChecks(
      baseArgs({ velocity: { available: true, dailyAmount: 0, monthlyAmount: 0, dailyCount: 10 } })
    );
    assert.equal(overCount.passed, false);
  });

  test("velocity unavailable (DB hiccup) fails closed rather than passing", () => {
    const result = runTransferSafetyChecks(
      baseArgs({ velocity: { available: false } })
    );
    assert.equal(result.passed, false);
    assert.ok(result.failures.some((f) => f.includes("could not be checked")));
  });

  test(">=1000 triggers EDD warning (passes, flagged)", () => {
    const result = runTransferSafetyChecks(baseArgs({ amount: 1000 }));
    assert.equal(result.passed, true);
    assert.ok(result.warnings.some((w) => w.includes("due diligence")));
  });

  test("near-limit (80%) structuring warning recorded", () => {
    const result = runTransferSafetyChecks(
      baseArgs({
        velocity: { available: true, dailyAmount: 2100, monthlyAmount: 2100, dailyCount: 0 },
      })
    );
    // 2100 + 500 = 2600 > 2000 (80% of 2500)
    assert.ok(result.warnings.some((w) => w.includes("close to their daily")));
  });

  test("expired quote fails", () => {
    const result = runTransferSafetyChecks(
      baseArgs({ quote: { expiresAt: new Date(Date.now() - 1000).toISOString() } })
    );
    assert.equal(result.passed, false);
    assert.ok(result.failures.some((f) => f.includes("expired")));
  });
});