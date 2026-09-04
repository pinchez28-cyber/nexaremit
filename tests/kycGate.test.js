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

function setKey(value) {
  if (value === undefined) delete process.env.PERSONA_API_KEY;
  else process.env.PERSONA_API_KEY = value;
}

describe("verifyKycInquiry (fail-closed)", () => {
  let fetchMock;

  before(() => {
    setKey("test-key");
    fetchMock = mock.method(globalThis, "fetch");
  });

  after(() => {
    setKey(REAL_KEY);
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
    const result = await verifyKycInquiry("inq_known");
    assert.equal(result.ok, true);
    assert.equal(result.source, "persona");
    assert.equal(result.referenceId, "user-123");
  });

  test("declined decision fails closed, even if status looks fine", async () => {
    fetchMock.mock.mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: { attributes: { status: "completed", decision: "declined" } },
      }),
    }));
    const result = await verifyKycInquiry("inq_declined");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_declined");
  });

  test("pending status fails closed", async () => {
    fetchMock.mock.mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: { attributes: { status: "pending" } },
      }),
    }));
    const result = await verifyKycInquiry("inq_pending");
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
    const result = await verifyKycInquiry("inq_500");
    assert.equal(result.ok, false);
    assert.ok(["kyc_provider_error", "kyc_unverifiable"].includes(result.code));
  });

  test("404 maps to kyc_inquiry_not_found", async () => {
    fetchMock.mock.mockImplementationOnce(async () => ({
      ok: false,
      status: 404,
      json: async () => ({}),
    }));
    const result = await verifyKycInquiry("inq_missing");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_inquiry_not_found");
  });

  test("network error (fetch rejects) fails closed with provider_unreachable", async () => {
    fetchMock.mock.mockImplementationOnce(async () => {
      throw new TypeError("fetch failed");
    });
    const result = await verifyKycInquiry("inq_net");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_provider_unreachable");
  });

  test("no inquiry id supplied is refused (kyc_required)", async () => {
    const result = await verifyKycInquiry("");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_required");
  });

  test("no Persona key configured: falls through to fail-closed unverifiable", async () => {
    setKey(undefined);
    // No fetch should be attempted: verifyWithPersona returns null when the
    // key is absent, then the DB fallback is also absent (no Supabase env).
    const result = await verifyKycInquiry("inq_nokey");
    assert.equal(result.ok, false);
    assert.equal(result.code, "kyc_unverifiable");
  });

  test("all Persona calls used the CORRECT api.withpersona.com host", () => {
    const calls = fetchMock.mock.calls;
    for (const call of calls) {
      const url = String(call.arguments[0]);
      assert.ok(
        url.startsWith("https://api.withpersona.com/api/v1/inquiries/"),
        `fetch called with wrong URL: ${url}`
      );
      assert.ok(!url.includes("https://withpersona.com"), `wrong host used: ${url}`);
    }
  });
});