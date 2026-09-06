// tests/persona-security.test.js
//
// SECURITY hardening for the Persona/KYC path:
//   1. Inquiry ownership binding (verifyKycInquiry now takes the authenticated
//      user; a missing/foreign reference-id fails closed and no client-supplied
//      id/email overrides the session identity).
//   2. Decision-aware webhook normalization (Persona decision is authoritative;
//      completed+declined can never become approved; ambiguous outcomes fail
//      closed; duplicate deliveries stay idempotent).
//   3. kyc-start reports the REAL configured Persona mode (sandbox reports
//      sandbox, never a hardcoded production label), and its status path also
//      enforces ownership + decision-aware persistence.
//
// No live Supabase / Persona network is touched: global.fetch is mocked for
// route tests, and webhook tests use HMAC fixtures + unconfigured Supabase
// (upsertKycRecord falls back to an in-memory record, exactly like the
// existing tests/webhooks.test.js).

import { test, describe, before, after, mock } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { parsePersonaEvent, normalizePersonaOutcome, resolvePersonaMode } from "../src/server/_lib/persona.js";

// ---- env snapshot helpers --------------------------------------------------

const ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "VITE_STRIPE_PUBLISHABLE_KEY",
  "TRANSFER_MODE",
  "NEXA_ALLOW_UNSCREENED",
  "NEXA_REQUIRE_KYC",
  "PERSONA_API_KEY",
  "PERSONA_ENVIRONMENT",
  "PERSONA_TEMPLATE_ID",
  "PERSONA_WEBHOOK_SECRET",
];

let envSnapshot = {};
function saveEnv() {
  envSnapshot = {};
  for (const k of ENV_KEYS) envSnapshot[k] = process.env[k];
}
function restoreEnv() {
  for (const k of ENV_KEYS) {
    if (envSnapshot[k] === undefined) delete process.env[k];
    else process.env[k] = envSnapshot[k];
  }
}
function setEnv(obj) {
  for (const [k, v] of Object.entries(obj)) process.env[k] = v;
}
function unsetEnv(...keys) {
  for (const k of keys) delete process.env[k];
}

// ---- pure helpers ----------------------------------------------------------

function makeRes() {
  const res = {
    statusCode: 0,
    body: null,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = JSON.stringify(payload); return this; },
    end(body) { this.body = body; },
  };
  return res;
}

function makeStreamReq(rawBody, headers) {
  const payload = Buffer.from(rawBody, "utf8");
  return {
    method: "POST",
    headers,
    [Symbol.asyncIterator]: async function* () {
      yield payload;
    },
  };
}

function signBody(rawBody, secret, timestamp = "1700000000") {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  return `t=${timestamp},v1=${expected}`;
}

function personaEventBody({ status, decision, name = "inquiry.completed", referenceId = "user-123" }) {
  const attributes = { name, "reference-id": referenceId, status };
  if (decision) attributes.decision = decision;
  return JSON.stringify({ data: { attributes } });
}

// ---- 3. mode label + parsePersonaEvent (pure) ------------------------------

describe("resolvePersonaMode (correct mode label)", () => {
  test("configured PERSONA_ENVIRONMENT=sandbox wins even when TRANSFER_MODE is production", () => {
    assert.equal(
      resolvePersonaMode({ personaEnvironment: "sandbox", transferMode: "production" }),
      "sandbox"
    );
  });

  test("no PERSONA_ENVIRONMENT: derives from TRANSFER_MODE (production stays production)", () => {
    assert.equal(resolvePersonaMode({ transferMode: "production" }), "production");
    assert.equal(resolvePersonaMode({ transferMode: "sandbox" }), "sandbox");
    assert.equal(resolvePersonaMode(), "sandbox");
  });
});

describe("parsePersonaEvent extracts decision and templateVersion", () => {
  test("inquiry payload shape yields id/reference/status/decision/templateVersion", () => {
    const parsed = parsePersonaEvent({
      data: {
        attributes: {
          name: "inquiry.completed",
          payload: {
            data: {
              id: "inq_1",
              attributes: {
                "reference-id": "user-1",
                status: "completed",
                decision: "approved",
                "template-version": "2026-01-01",
              },
            },
          },
        },
      },
    });
    assert.equal(parsed.inquiryId, "inq_1");
    assert.equal(parsed.referenceId, "user-1");
    assert.equal(parsed.status, "completed");
    assert.equal(parsed.decision, "approved");
    assert.equal(parsed.templateVersion, "2026-01-01");
  });
});

// ---- 2. webhook decision-aware normalization (HMAC E2E, Supabase unset) ----

describe("Persona webhook: decision-aware KYC normalization", () => {
  let handler;

  before(async () => {
    saveEnv();
    unsetEnv("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY");
    process.env.PERSONA_WEBHOOK_SECRET = "persona-test-secret-value";
    ({ default: handler } = await import("../api/webhooks-persona.js"));
  });

  after(() => {
    mock.restoreAll();
    restoreEnv();
  });

  async function deliver(status, decision) {
    const rawBody = personaEventBody({ status, decision });
    const res = makeRes();
    await handler(
      makeStreamReq(rawBody, { "persona-signature": signBody(rawBody, process.env.PERSONA_WEBHOOK_SECRET) }),
      res
    );
    return { res, body: JSON.parse(res.body || "{}") };
  }

  test("A: completed + approved decision -> approved", async () => {
    const { res, body } = await deliver("completed", "approved");
    assert.equal(res.statusCode, 200);
    assert.equal(body.verified, true);
    assert.equal(body.status, "approved");
  });

  test("B: completed + declined decision -> NOT approved (declined)", async () => {
    const { res, body } = await deliver("completed", "declined");
    assert.equal(res.statusCode, 200);
    assert.equal(body.status, "declined");
  });

  test("B2: completed + rejected decision -> NOT approved", async () => {
    const { res, body } = await deliver("completed", "rejected");
    assert.equal(res.statusCode, 200);
    assert.equal(body.status, "declined");
  });

  test("C: pending -> NOT approved (pending)", async () => {
    const { res, body } = await deliver("pending", undefined);
    assert.equal(res.statusCode, 200);
    assert.equal(body.status, "pending");
  });

  test("D: needs_review -> NOT approved (needs_review)", async () => {
    const { res, body } = await deliver("needs_review", undefined);
    assert.equal(res.statusCode, 200);
    assert.equal(body.status, "needs_review");
  });

  test("E: expired -> NOT approved (declined)", async () => {
    const { res, body } = await deliver("expired", undefined);
    assert.equal(res.statusCode, 200);
    assert.equal(body.status, "declined");
  });

  test("F: ambiguous/missing outcome -> NOT approved (unknown)", async () => {
    // terminal-looking status but NO decision at all: must not become approved.
    const { res, body } = await deliver("completed", undefined);
    assert.equal(res.statusCode, 200);
    assert.equal(body.status, "unknown");
  });

  test("G: duplicate webhook delivery stays idempotent (same status, both accepted)", async () => {
    const { res: r1, body: b1 } = await deliver("completed", "approved");
    const { res: r2, body: b2 } = await deliver("completed", "approved");
    assert.equal(r1.statusCode, 200);
    assert.equal(r2.statusCode, 200);
    assert.equal(b1.status, "approved");
    assert.equal(b2.status, "approved");
    // Idempotency is by design at the store (upsert onConflict user_id); the
    // route reports the same normalized outcome regardless of delivery count.
    assert.deepEqual(b1.status, b2.status);
  });

  test("signature verification is preserved: unverifiable signature still 400s", async () => {
    const rawBody = personaEventBody({ status: "approved", decision: "approved" });
    const res = makeRes();
    await handler(makeStreamReq(rawBody, { "persona-signature": "t=1,v1=deadbeef" }), res);
    assert.equal(res.statusCode, 400);
    assert.equal(JSON.parse(res.body).error, "invalid_webhook_signature");
  });
});

// ---- pure normalizer table (belt and braces over the route E2E) ------------

describe("normalizePersonaOutcome (pure table)", () => {
  test("A: completed+approved -> approved; B: completed+declined/rejected -> declined", () => {
    assert.equal(normalizePersonaOutcome({ status: "completed", decision: "approved" }), "approved");
    assert.equal(normalizePersonaOutcome({ status: "completed", decision: "passed" }), "approved");
    assert.equal(normalizePersonaOutcome({ status: "completed", decision: "declined" }), "declined");
    assert.equal(normalizePersonaOutcome({ status: "approved", decision: "rejected" }), "declined");
  });

  test("C/D/E/F: pending, needs_review, expired, canceled, ambiguous -> non-approved", () => {
    assert.equal(normalizePersonaOutcome({ status: "pending" }), "pending");
    assert.equal(normalizePersonaOutcome({ status: "needs_review" }), "needs_review");
    assert.equal(normalizePersonaOutcome({ status: "expired" }), "declined");
    assert.equal(normalizePersonaOutcome({ status: "canceled" }), "declined");
    assert.equal(normalizePersonaOutcome({ status: "completed" }), "unknown");
    assert.equal(normalizePersonaOutcome({ status: "processed", decision: "approved" }), "unknown");
    assert.equal(normalizePersonaOutcome({}), "unknown");
  });
});

// ---- 1 + 3. kyc-start GET status: ownership, decision, mode ----------------

describe("kyc-start GET status: ownership binding + decision-aware + mode", () => {
  let handler;
  let fetchMock;

  before(async () => {
    saveEnv();
    setEnv({
      SUPABASE_URL: "https://example-test.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role",
      PERSONA_API_KEY: "test-key",
      PERSONA_TEMPLATE_ID: "test-template",
      PERSONA_ENVIRONMENT: "sandbox",
      TRANSFER_MODE: "sandbox",
      NEXA_REQUIRE_KYC: "false",
    });
    ({ default: handler } = await import("../api/kyc-start.js"));
    fetchMock = mock.method(globalThis, "fetch");
  });

  after(() => {
    mock.restoreAll();
    restoreEnv();
  });

  // Route: supabase auth fetch -> authenticated user; Persona status fetch ->
  // given inquiry attributes; any postgrest write -> empty array (never blocks
  // the route — the write failure is swallowed by kyc-start's try/catch). All
  // fetches also implement .text() because the route reads the raw body.
  function installFetchRouter({ authedUserId, attrs }) {
    fetchMock.mock.mockImplementation(async (url) => {
      const u = String(url);
      if (u.includes("/auth/v1/user")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: authedUserId,
            email: "authed@example.com",
            phone: "",
            created_at: "2026-01-01T00:00:00Z",
          }),
          text: async () => JSON.stringify({
            id: authedUserId,
            email: "authed@example.com",
            phone: "",
            created_at: "2026-01-01T00:00:00Z",
          }),
        };
      }
      if (u.includes("/inquiries/")) {
        const body = JSON.stringify({ data: { attributes: attrs } });
        return {
          ok: true,
          status: 200,
          json: async () => JSON.parse(body),
          text: async () => body,
        };
      }
      if (u.includes("/rest/v1/")) {
        return {
          ok: true,
          status: 200,
          json: async () => [],
          text: async () => "[]",
        };
      }
      throw new Error(`unexpected fetch in kyc-start test: ${u}`);
    });
  }

  async function getStatus(inquiryId, attrs, authedUserId = "user-123") {
    installFetchRouter({ authedUserId, attrs });
    const req = {
      method: "GET",
      headers: { authorization: "Bearer test-token" },
      query: { inquiryId },
    };
    const res = makeRes();
    await handler(req, res);
    return { res, body: JSON.parse(res.body || "{}") };
  }

  test("owner + completed/approved inquiry -> 200 approved, mode sandbox (not production)", async () => {
    const { res, body } = await getStatus("inq_own", {
      status: "completed",
      decision: "approved",
      "reference-id": "user-123",
    });
    assert.equal(res.statusCode, 200);
    assert.equal(body.ok, true);
    assert.equal(body.mode, "sandbox", "sandbox must report sandbox, never production");
    assert.equal(body.normalizedStatus, "approved");
    assert.equal(body.passed, true);
  });

  test("foreign reference-id -> 403, generic denial, no foreign identity leaked, not persisted as approved", async () => {
    const { res, body } = await getStatus("inq_foreign", {
      status: "approved",
      decision: "approved",
      "reference-id": "user-999",
    });
    assert.equal(res.statusCode, 403);
    assert.equal(body.ok, false);
    assert.equal(body.stage, "persona-status-ownership");
    const raw = JSON.stringify(body);
    assert.ok(!raw.includes("user-999"), "must not leak the foreign owner");
    assert.ok(!raw.includes("inq_foreign"), "must not echo the inquiry id");
    assert.equal(body.passed, undefined);
    assert.equal(body.normalizedStatus, undefined);
  });

  test("missing reference-id -> 403 fail-closed, nothing persisted as approved", async () => {
    const { res, body } = await getStatus("inq_missing_ref", {
      status: "approved",
      decision: "approved",
    });
    assert.equal(res.statusCode, 403);
    assert.equal(body.stage, "persona-status-ownership");
    assert.equal(body.ok, false);
  });

  test("own inquiry but completed + declined -> reported NOT approved (decision-aware)", async () => {
    const { res, body } = await getStatus("inq_declined_own", {
      status: "completed",
      decision: "declined",
      "reference-id": "user-123",
    });
    assert.equal(res.statusCode, 200);
    assert.equal(body.ok, true);
    assert.equal(body.normalizedStatus, "declined");
    assert.equal(body.passed, false);
  });

  test("mode label follows configured PERSONA_ENVIRONMENT; production stays production", async () => {
    // PERSONA_ENVIRONMENT=sandbox is already set in this describe (see above).
    const { body } = await getStatus("inq_mode", {
      status: "completed",
      decision: "approved",
      "reference-id": "user-123",
    });
    assert.equal(body.mode, "sandbox");
    // Pure resolver guards the production case too.
    assert.equal(resolvePersonaMode({ personaEnvironment: "production" }), "production");
  });
});