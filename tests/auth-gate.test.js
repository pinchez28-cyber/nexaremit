// tests/auth-gate.test.js
//
// P0-1: authentication gate on the money path.
//
// The critical property: an unauthenticated caller must be refused with 401
// BEFORE KYC runs, BEFORE any quote/payment processing, and BEFORE Stripe is
// ever called — and must never receive a client secret.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";
import {
  requireAuthenticatedUser,
  requireAuthenticatedUserWithDeps,
  getAuthenticatedUser,
} from "../src/server/_lib/requireUser.js";

function bearerReq(token) {
  return {
    headers: {
      authorization: token ? `Bearer ${token}` : "",
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
}

describe("requireAuthenticatedUser (unit, with DI)", () => {
  test("no Authorization header -> 401 authentication_required", async () => {
    const req = { headers: {} };
    const auth = requireAuthenticatedUserWithDeps(req, {
      getSupabaseAdmin: () => ({}),
      getUser: async () => null,
    });
    await assert.rejects(auth, (err) => {
      assert.equal(err.statusCode, 401);
      assert.equal(err.details?.reason, "authentication_required");
      return true;
    });
  });

  test("garbage token -> 401 (getUser returns null)", async () => {
    const req = bearerReq("not-a-real-token");
    const auth = requireAuthenticatedUserWithDeps(req, {
      getSupabaseAdmin: () => ({}),
      getUser: async () => null,
    });
    await assert.rejects(auth, (err) => {
      assert.equal(err.statusCode, 401);
      assert.equal(err.details?.reason, "authentication_required");
      return true;
    });
  });

  test("invalid/expired user object (no id) -> 401", async () => {
    const req = bearerReq("eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjF9.expired");
    const auth = requireAuthenticatedUserWithDeps(req, {
      getSupabaseAdmin: () => ({}),
      getUser: async () => ({}), // no .id
    });
    await assert.rejects(auth, (err) => {
      assert.equal(err.statusCode, 401);
      return true;
    });
  });

  test("valid authenticated user is allowed and returned", async () => {
    const req = bearerReq("valid-token");
    const user = await requireAuthenticatedUserWithDeps(req, {
      getSupabaseAdmin: () => ({}),
      getUser: async (reqArg) => {
        assert.ok(reqArg.headers.authorization.includes("valid-token"));
        return { id: "user-1", email: "a@b.c" };
      },
    });
    assert.equal(user.id, "user-1");
  });

  test("Supabase unconfigured -> 503 with reason supabase_not_configured", async () => {
    const req = bearerReq("anything");
    const auth = requireAuthenticatedUserWithDeps(req, {
      getSupabaseAdmin: () => null,
      getUser: async () => null,
    });
    await assert.rejects(auth, (err) => {
      assert.equal(err.statusCode, 503);
      assert.equal(err.details?.reason, "supabase_not_configured");
      return true;
    });
  });

  test("readBearerToken handles array headers and case-insensitive names", async () => {
    const getUser = mock.fn(async () => ({ id: "u" }));
    const req = { headers: { Authorization: ["Bearer array-token"] } };
    await requireAuthenticatedUserWithDeps(req, {
      getSupabaseAdmin: () => ({}),
      getUser,
    });
    assert.equal(getUser.mock.calls.length, 1);
  });
});

describe("real route-level 401 behavior", () => {
  // The production wiring can't be run without Supabase, but the DI route
  // handler asserts the money path behavior with fakes (see
  // create-payment-intent.test.js). Here we prove getAuthenticatedUser returns
  // null (never throws) when there's no token — the fail-safe of the auth lib.
  test("getAuthenticatedUser returns null for missing token (no crash)", async () => {
    const user = await getAuthenticatedUser({ headers: {} });
    assert.equal(user, null);
  });
});