// tests/velocity.test.js
//
// Velocity rules (P2-1). The pure parts — limit resolution and the currency
// scoping/major-unit math — are tested here. Rows come from a fake Supabase
// client so no network is touched.

import { test, describe, mock } from "node:test";
import assert from "node:assert/strict";
import {
  getVelocityLimits,
  DEFAULT_VELOCITY_LIMITS,
  getVelocityUsage,
} from "../src/server/_lib/velocity.js";

describe("getVelocityLimits", () => {
  test("defaults apply when unset", () => {
    assert.deepEqual(getVelocityLimits({}), {
      dailyAmount: 2500,
      monthlyAmount: 10000,
      dailyCount: 10,
    });
    assert.equal(DEFAULT_VELOCITY_LIMITS.dailyAmount, 2500);
  });

  test("env overrides are read", () => {
    const limits = getVelocityLimits({
      NEXA_DAILY_LIMIT: "5000",
      NEXA_MONTHLY_LIMIT: "20000",
      NEXA_DAILY_COUNT_LIMIT: "5",
    });
    assert.deepEqual(limits, {
      dailyAmount: 5000,
      monthlyAmount: 20000,
      dailyCount: 5,
    });
  });

  test("non-numeric env falls back to default", () => {
    const limits = getVelocityLimits({ NEXA_DAILY_LIMIT: "abc" });
    assert.equal(limits.dailyAmount, 2500);
  });
});

describe("getVelocityUsage (fake Supabase, no network)", () => {
  // Fake mirrors the exact chain getVelocityUsage awaits:
  // from().select().eq().eq().eq().gte(column, since) — awaited directly
  // (no .maybeSingle()), with the 30-day window applied DB-side.
  function fakeSupabase(rows) {
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                gte: async (_column, since) => ({
                  data: rows.filter(
                    (r) => new Date(r.created_at).getTime() >= new Date(since).getTime()
                  ),
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    };
  }

  // getVelocityUsage accepts an injected Supabase getter (dependency
  // injection), so the fake client is passed in directly: no module
  // monkey-patching, no network.
  test("sums major amounts from audit rows, currency-scoped, using money.js", async () => {
    const now = Date.now();
    const rows = [
      // USD 50.00 in minor (5000) -> major 50
      { metadata: { amountMinor: 5000, currency: "usd" }, created_at: new Date(now - 1000).toISOString() },
      // USD 200.50 in minor (20050) -> major 200.5
      { metadata: { amountMinor: 20050, currency: "usd" }, created_at: new Date(now - 2000).toISOString() },
      // JPY 1000 minor -> major 1000 (JPY exp 1) — the exact audit bug class.
      { metadata: { amountMinor: 1000, currency: "jpy" }, created_at: new Date(now - 3000).toISOString() },
      // A different currency (EUR) must NOT count toward USD totals.
      { metadata: { amountMinor: 999999, currency: "eur" }, created_at: new Date(now - 4000).toISOString() },
      // Old row outside the 30-day window must not count.
      { metadata: { amountMinor: 500000, currency: "usd" }, created_at: new Date(now - 31 * 24 * 3600 * 1000).toISOString() },
    ];

    const result = await getVelocityUsage(
      { id: "u1" },
      { currency: "usd", now },
      { getSupabaseAdminClient: () => fakeSupabase(rows) }
    );

    // USD rows: 50 + 200.5 = 250.5; JPY and EUR and old row excluded.
    assert.deepEqual(result, {
      available: true,
      dailyAmount: 250.5,
      monthlyAmount: 250.5,
      dailyCount: 2,
    });
  });

  test("unconfigured Supabase reports unavailable rather than zero usage", async () => {
    const result = await getVelocityUsage(
      { id: "u1" },
      { currency: "usd", now: Date.now() },
      { getSupabaseAdminClient: () => null }
    );
    // Fails closed: no usage data means limits cannot be checked.
    assert.deepEqual(result, {
      available: false,
      dailyAmount: 0,
      monthlyAmount: 0,
      dailyCount: 0,
    });
  });
});