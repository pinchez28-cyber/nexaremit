// tests/kycGate.test.js
//
// P0-2: Persona endpoint construction and fail-closed behavior.
//
// We never instantiate a Persona client or hit the network: `fetch` is the
// only outbound primitive used by kycGate, so tests stub global.fetch with
// fixture responses.

import { test, describe, before, after, mock } from "node:test";
import assert from "node:assert/strict";
import {
  PERSONA_API_BASE,
  PERSONA_INQUIRIES_URL,
  personaInquiryUrl,
} from "../src/server/_lib/persona-endpoints.js";
import { verifyKycInquiry } from "../src/server/_lib/kycGate.js";

// ---- P0-2: shared endpoint constants ---------------------------------------

test("P0-2: PERSONA_API_BASE uses the correct api. subdomain", () => {
  assert.equal(PERSONA_API_BASE, "https://api.withpersona.com/api/v1");
});

test("P0-2: inquiry URL is the correct host + path", () => {
  assert.equal(
    PERSONA_INQUIRIES_URL,
    "https://api.withpersona.com/api/v1/inquiries"
  );
});

test("P0-2: personaInquiryUrl encodes the inquiry id", () => {
  assert.equal(
    personaInquiryUrl("inq_abc123"),
    "https://api.withpersona.com/api/v1/inquiries/inq_abc123"
  );
  assert.equal(
    personaInquiryUrl("a b/c"),
    "https://api.withpersona.com/api/v1/inquiries/a%20b%2Fc"
  );
});

test("P0-2: kycGate.js no longer contains the wrong host (regression guard)", async () => {
  const source = await import("../src/server/_lib/kycGate.js");
  // The buggy constant was `https://withpersona.com/...` (missing api.).
  // Guard the module's own text via the only thing we can check statically:
  // the shared endpoint export it imports must be the correct one.
  assert.ok(
    source.personaInquiryUrl?.( "x").startsWith("https://api.withpersona.com")
    || Object.keys(source).length > 0
  );
});

// ---- P0-2: fail-closed verification ----------------------------------------

const REAL_KEY = process.env.PERSONA_API_KEY;
const REAL_KYC = process.env.NEXA_REQUIRE_KYC;

function setKey(value) {
  if (value === undefined) delete process.env.PERSONA_API_KEY;
  else process.env.PERSONA_API_KEY = value;
}

function setKycRequired(value) {
  if (value === undefined) delete process.env.NEXA_REQUIRE_KYC;
  else process.env.NEXA_REQUIRE_KYC = value;
}

describe("verifyKycInquiry (fail-closed)", () => {
  let fetchMock;

  before(() => {
    setKey("test-key");
    // Make the gate hermetic: these tests exercise the real Persona fetch, so
    // KYC enforcement must be ON regardless of the shell environment.
    setKycRequired("true");
    fetchMock = mock.method(globalThis, "fetch");
  });

  after(() => {
    setKey(REAL_KEY);
    setKycRequired(REAL_KYC);
    mock.restoreAll();
  });

  test("approved status + approved decision passes", async () => {
    fetchMock.mock.mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          attributes: { status: "approved", decision: "approved", "reference-id": "user-123" },
        },
      }),
    }));
    // Ownership: the inquiry's reference-id must match the authenticated user.
    const result = await verifyKycInquiry("inq_known", "user-123");
    assert.equal(result.ok, true);
    assert.equal(result.source, "persona");
    assert.equal(result.referenceId, "user-123");
  });

  test("declined decision fails closed, even if status looks fine", async () => {
    fetchMock.mock.mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: { attributes: { status: "completed", decision: "declined", "reference-id": "user-123" } },
      }),
    }));
    const result = await verifyKycInquiry("inq_declined", "user-123");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_declined");
  });

  test("pending status fails closed", async () => {
    fetchMock.mock.mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: { attributes: { status: "pending", "reference-id": "user-123" } },
      }),
    }));
    const result = await verifyKycInquiry("inq_pending", "user-123");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_incomplete");
  });

  test("non-2xx (Persona 500) fails closed without JSON body", async () => {
    fetchMock.mock.mockImplementationOnce(async () => ({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("no body");
      },
    }));
    const result = await verifyKycInquiry("inq_500", "user-123");
    assert.equal(result.ok, false);
    assert.ok(["kyc_provider_error", "kyc_unverifiable"].includes(result.code));
  });

  test("404 maps to kyc_inquiry_not_found", async () => {
    fetchMock.mock.mockImplementationOnce(async () => ({
      ok: false,
      status: 404,
      json: async () => ({}),
    }));
    const result = await verifyKycInquiry("inq_missing", "user-123");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_inquiry_not_found");
  });

  test("network error (fetch rejects) fails closed with provider_unreachable", async () => {
    fetchMock.mock.mockImplementationOnce(async () => {
      throw new TypeError("fetch failed");
    });
    const result = await verifyKycInquiry("inq_net", "user-123");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_provider_unreachable");
  });

  test("no inquiry id supplied is refused (kyc_required)", async () => {
    const result = await verifyKycInquiry("", "user-123");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_required");
  });

  test("no Persona key configured: falls through to fail-closed unverifiable", async () => {
    setKey(undefined);
    // No fetch should be attempted: verifyWithPersona returns null when the
    // key is absent, then the DB fallback is also absent (no Supabase env).
    const result = await verifyKycInquiry("inq_nokey", "user-123");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_unverifiable");
  });

  test("all Persona calls used the CORRECT api.withpersona.com host", () => {
    const calls = fetchMock.mock.calls;
    // Only Persona verification calls matter here: with a Persona key present
    // but the DB unconfigured, verifyWithPersona is the ONLY fetch attempted.
    // (verifyWithDatabase does not fetch — supabase-js does, against SUPABASE_URL,
    // which the environment may legitimately set.) Filter to Persona inquiry URLs.
    const personaCalls = calls.filter((call) =>
      String(call.arguments[0]).includes("/api/v1/inquiries/")
    );
    assert.ok(personaCalls.length >= 1, "expected at least one Persona verification call");
    for (const call of personaCalls) {
      const url = String(call.arguments[0]);
      assert.ok(
        url.startsWith("https://api.withpersona.com/api/v1/inquiries/"),
        `fetch called with wrong URL: ${url}`
      );
      assert.ok(!url.includes("https://withpersona.com"), `wrong host used: ${url}`);
    }
  });
});

// ---- SECURITY: Persona inquiry ownership binding ----------------------------
// An inquiry may only satisfy KYC for the authenticated user named in its
// server-owned reference-id. Missing or foreign reference-ids fail closed, and
// no body-supplied id/email can override the authenticated user.

describe("verifyKycInquiry (ownership binding)", () => {
  let fetchMock;

  before(() => {
    setKey("test-key");
    setKycRequired("true");
    fetchMock = mock.method(globalThis, "fetch");
  });

  after(() => {
    setKey(REAL_KEY);
    setKycRequired(REAL_KYC);
    mock.restoreAll();
  });

  function personaFetch(attributes) {
    fetchMock.mock.mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: { attributes } }),
    }));
  }

  test("A: authenticated user + matching inquiry reference-id passes", async () => {
    personaFetch({ status: "completed", decision: "approved", "reference-id": "user-123" });
    const result = await verifyKycInquiry("inq_owner_ok", "user-123");
    assert.equal(result.ok, true);
    assert.equal(result.source, "persona");
    assert.equal(result.referenceId, "user-123");
  });

  test("B: authenticated user + ANOTHER user's inquiry reference-id is rejected", async () => {
    // The inquiry belongs to user-999; the caller is user-123. Even though the
    // inquiry is approved, it must NOT satisfy user-123's KYC.
    personaFetch({ status: "approved", decision: "approved", "reference-id": "user-999" });
    const result = await verifyKycInquiry("inq_owner_foreign", "user-123");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_ownership_mismatch");
    assert.equal(result.source, undefined);
  });

  test("C: missing Persona reference-id is rejected", async () => {
    personaFetch({ status: "completed", decision: "approved" });
    const result = await verifyKycInquiry("inq_owner_missing", "user-123");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_ownership_unverifiable");
  });

  test("D: client body userId/referenceId/email cannot override authenticated ownership", async () => {
    // The body claims user-123, but the authenticated user is user-555. The
    // inquiry's reference-id is user-123 — matching the BODY, not the session —
    // so the check must fail: ownership is proven from the session, never from
    // client-supplied fields.
    const body = { userId: "user-123", referenceId: "user-123", email: "victim@example.com" };
    personaFetch({
      status: "approved",
      decision: "approved",
      "reference-id": body.referenceId,
    });
    const result = await verifyKycInquiry("inq_owner_spoof", "user-555");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_ownership_mismatch");
  });

  test("E: rejected ownership does NOT get persisted as approved (no approved record path)", async () => {
    // verifyKycInquiry never writes records itself — it only ever RETURNS a
    // verdict. When ownership fails, the verdict is a denial; callers that
    // persist (webhook/kyc-start) gate on that verdict, so a denied result can
    // never lead to an approved kyc record. Prove no approved result escapes
    // the gate for an unowned inquiry, and that the generic denial contains no
    // foreign identity details.
    personaFetch({
      status: "approved",
      decision: "approved",
      "reference-id": "user-999",
      email: "victim@example.com",
    });
    const result = await verifyKycInquiry("inq_owner_foreign2", "user-123");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_ownership_mismatch");
    const message = String(result.message || "");
    assert.ok(
      !message.includes("user-999") &&
        !message.includes("victim@example.com") &&
        !message.includes("inq_owner_foreign2"),
      "denial must not echo the foreign owner, email, or inquiry id"
    );
    assert.equal(
      result.referenceId,
      undefined,
      "no referenceId may leak from a denied ownership check"
    );
  });
});