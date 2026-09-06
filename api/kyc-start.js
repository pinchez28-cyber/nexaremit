import { requireAuthenticatedUser } from "../src/server/_lib/requireUser.js";
import { upsertKycRecord } from "../src/server/_lib/kycRecords.js";
import {
  normalizePersonaOutcome,
  resolvePersonaMode,
} from "../src/server/_lib/persona.js";

export default async function handler(req, res) {
  const send = (status, body) => {
    res.setHeader("Cache-Control", "no-store");
    return res.status(status).json(body);
  };

  const toStr = (v) => (typeof v === "string" ? v.trim() : "");
  const pickFirstString = (...values) => {
    for (const value of values.flat()) {
      const s = toStr(value);
      if (s) return s;
    }
    return "";
  };

  const isTerminalStatus = (status) => {
    const s = toStr(status).toLowerCase();
    return [
      "completed",
      "approved",
      "passed",
      "needs_review",
      "declined",
      "failed",
      "expired",
      "canceled",
      "cancelled",
    ].includes(s);
  };

  const looksSandbox = (value) => /sandbox|simulated|demo/i.test(toStr(value));

  const deriveOrigin = () => {
    const envBase =
      toStr(process.env.APP_BASE_URL) ||
      toStr(process.env.NEXT_PUBLIC_APP_URL) ||
      toStr(process.env.PUBLIC_APP_URL);

    if (envBase) {
      try {
        return new URL(envBase).origin;
      } catch (_) {}
    }

    const proto = toStr(req.headers["x-forwarded-proto"]) || "https";
    const host =
      toStr(req.headers["x-forwarded-host"]) || toStr(req.headers.host);

    if (host) return `${proto}://${host}`;
    return "https://nexaremit.com";
  };

  const withRedirectUri = (url, redirectUri) => {
    const raw = toStr(url);
    const redirect = toStr(redirectUri);
    if (!raw) return "";
    try {
      const u = new URL(raw);
      if (redirect && !u.searchParams.get("redirect-uri")) {
        u.searchParams.set("redirect-uri", redirect);
      }
      return u.toString();
    } catch (_) {
      return raw;
    }
  };

  const buildHostedUrl = ({
    verificationUrl,
    hostedUrl,
    shortVerificationUrl,
    inquiryId,
    sessionToken,
    redirectUri,
  }) => {
    const direct =
      pickFirstString(verificationUrl, hostedUrl, shortVerificationUrl) || "";

    if (direct) {
      return withRedirectUri(direct, redirectUri);
    }

    if (inquiryId && sessionToken) {
      const u = new URL("https://inquiry.withpersona.com/verify");
      u.searchParams.set("inquiry-id", inquiryId);
      u.searchParams.set("session-token", sessionToken);
      if (redirectUri) u.searchParams.set("redirect-uri", redirectUri);
      return u.toString();
    }

    if (inquiryId) {
      const u = new URL("https://inquiry.withpersona.com/verify");
      u.searchParams.set("inquiry-id", inquiryId);
      if (redirectUri) u.searchParams.set("redirect-uri", redirectUri);
      return u.toString();
    }

    return "";
  };

  try {
    const TRANSFER_MODE = toStr(process.env.TRANSFER_MODE);
    const isProductionMode = String(TRANSFER_MODE || "sandbox")
      .trim()
      .toLowerCase() === "production";
    // The environment label reported to clients: configured Persona
    // environment wins, else derived from TRANSFER_MODE. Never a credential.
    const personaMode = resolvePersonaMode({
      personaEnvironment: process.env.PERSONA_ENVIRONMENT,
      transferMode: process.env.TRANSFER_MODE || "sandbox",
    });
    const PERSONA_API_KEY = toStr(process.env.PERSONA_API_KEY);
    const PERSONA_TEMPLATE_ID = toStr(process.env.PERSONA_TEMPLATE_ID);
    const PERSONA_CREATE_INQUIRY_URL =
      toStr(process.env.PERSONA_CREATE_INQUIRY_URL) ||
      "https://api.withpersona.com/api/v1/inquiries";

    // Sandbox loop fix (Batch 2): the Start-KYC action must be exercisable in
    // sandbox mode with sandbox Persona keys. Previously the gate demanded
    // TRANSFER_MODE=production AND rejected any sandbox-looking key, so the
    // sandbox could never start an inquiry.
    //
    //   sandbox (TRANSFER_MODE != production):
    //     accepted when Persona keys are configured; sandbox-looking keys are
    //     expected and allowed. When unconfigured, the action is unavailable
    //     (503 fail-closed — the equivalent of hiding the button).
    //   production:
    //     strict — real (non-sandbox) Persona keys on the api.withpersona.com
    //     host only; a sandbox-looking key or wrong host is refused.
    if (!PERSONA_API_KEY || !PERSONA_TEMPLATE_ID) {
      return send(503, {
        ok: false,
        route: "kyc-start",
        stage: "env-validation",
        error: "Start-KYC is unavailable because Persona is not configured.",
        mode: isProductionMode ? "production" : "sandbox",
      });
    }

    if (isProductionMode) {
      if (looksSandbox(PERSONA_API_KEY)) {
        return send(500, {
          ok: false,
          route: "kyc-start",
          stage: "env-validation",
          error: "Unsafe value in environment variable: PERSONA_API_KEY (sandbox key in production mode).",
          mode: "production",
        });
      }

      if (
        /withpersona\.com\/api\/v1\/inquiries/i.test(PERSONA_CREATE_INQUIRY_URL) &&
        !/api\.withpersona\.com/i.test(PERSONA_CREATE_INQUIRY_URL)
      ) {
        return send(500, {
          ok: false,
          route: "kyc-start",
          stage: "env-validation",
          error:
            "PERSONA_CREATE_INQUIRY_URL must use api.withpersona.com, not withpersona.com.",
          value: PERSONA_CREATE_INQUIRY_URL,
          mode: "production",
        });
      }
    }

    // Identity verification has to attach to a customer. Without this the
    // inquiry's reference-id was a client-supplied string with no link to
    // anyone, so an approved check could not be tied back to an account.
    let user;
    try {
      user = await requireAuthenticatedUser(req);
    } catch (authError) {
      return send(authError.statusCode || 401, {
        ok: false,
        route: "kyc-start",
        stage: "authentication",
        error: authError.details?.reason || "authentication_required",
        message: authError.message,
      });
    }

    if (req.method === "GET") {
      const inquiryId = pickFirstString(
        req.query?.inquiryId,
        req.query?.["inquiry-id"]
      );

      if (!inquiryId) {
        return send(400, {
          ok: false,
          route: "kyc-start",
          stage: "missing-inquiry-id",
          action: "status",
          error: "Missing inquiryId query parameter.",
        });
      }

      const statusUrl = `${PERSONA_CREATE_INQUIRY_URL.replace(/\/+$/, "")}/${encodeURIComponent(
        inquiryId
      )}`;

      const personaResponse = await fetch(statusUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PERSONA_API_KEY}`,
          Accept: "application/json",
        },
      });

      const personaText = await personaResponse.text();
      let personaJson = {};
      try {
        personaJson = personaText ? JSON.parse(personaText) : {};
      } catch (_) {
        personaJson = { raw: personaText };
      }

      if (!personaResponse.ok) {
        return send(personaResponse.status || 502, {
          ok: false,
          route: "kyc-start",
          stage: "persona-status-failed",
          action: "status",
          error: "Failed to retrieve Persona inquiry status.",
          inquiryId,
          personaStatus: personaResponse.status,
          personaResponse: personaJson,
        });
      }

      const data = personaJson?.data || {};
      const attrs = data?.attributes || {};

      const inquiryStatus = pickFirstString(attrs.status, "unknown");
      const terminal = isTerminalStatus(inquiryStatus);

      const decision = pickFirstString(
        attrs.decision,
        attrs["decision"],
        attrs["review-status"],
        attrs.reviewStatus
      );

      const completedAt = pickFirstString(
        attrs["completed-at"],
        attrs.completedAt,
        attrs["updated-at"],
        attrs.updatedAt
      );

      // Ownership: this status path only ever reports/persists outcomes for
      // inquiries whose server-owned reference-id matches the authenticated
      // user. A missing or foreign reference-id fails closed WITHOUT
      // persisting anything and WITHOUT echoing the inquiry's owner — another
      // user's identity details are never returned to this caller.
      const referenceId = pickFirstString(
        attrs["reference-id"],
        attrs.referenceId
      );

      if (!referenceId || referenceId !== user.id) {
        return send(403, {
          ok: false,
          route: "kyc-start",
          stage: "persona-status-ownership",
          action: "status",
          error:
            "This identity verification is not bound to your account and cannot be used.",
        });
      }

      // Decision-aware normalization (shared with the webhook): only an
      // explicitly acceptable Persona outcome becomes approved; completed
      // without a usable decision (or declined/rejected/pending/review/etc.)
      // is never persisted as approved.
      const normalizedOutcome = normalizePersonaOutcome({
        status: inquiryStatus,
        decision,
      });

      // Persist the outcome against the customer. Until now the only record
      // that someone had verified was an inquiry id in their browser's local
      // storage - clear site data and the verification was gone, with nothing
      // server-side to show it had ever happened.
      //
      // A failed write must not block the sender: Persona remains the
      // authoritative source, and this row is a durable convenience.
      try {
        await upsertKycRecord({
          userId: user.id,
          provider: "persona",
          providerInquiryId: inquiryId,
          status: normalizedOutcome,
          metadata: { decision: decision || null, completedAt: completedAt || null },
        });
      } catch (recordError) {
        console.error(`[kyc-start] could not persist kyc record: ${recordError.message}`);
      }

      const passed = normalizedOutcome === "approved";

      return send(200, {
        ok: true,
        route: "kyc-start",
        stage: "persona-status-success",
        action: "status",
        mode: personaMode,
        provider: "persona",
        inquiryId,
        inquiryStatus,
        normalizedStatus: normalizedOutcome,
        decision: decision || "",
        isTerminal: terminal,
        passed,
        completedAt: completedAt || "",
        referenceId: referenceId || "",
        inquiry: {
          id: inquiryId,
          status: inquiryStatus,
          decision: decision || "",
          completedAt: completedAt || "",
          referenceId: referenceId || "",
        },
      });
    }

    if (req.method !== "POST") {
      return send(405, {
        ok: false,
        route: "kyc-start",
        stage: "method-not-allowed",
        error: "Method not allowed. Use POST or GET.",
      });
    }

    let body = {};
    try {
      body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};
    } catch (err) {
      return send(400, {
        ok: false,
        route: "kyc-start",
        stage: "body-parse",
        error: "Invalid JSON request body.",
        details: toStr(err?.message) || null,
      });
    }

    const referenceId = user.id;

    const redirectBase = `${deriveOrigin()}/Setup`;
    const redirectUri = `${redirectBase}?kyc_return=1`;

    const fields =
      body && typeof body.fields === "object" && body.fields !== null
        ? body.fields
        : {};

    const payload = {
      data: {
        type: "inquiry",
        attributes: {
          "inquiry-template-id": PERSONA_TEMPLATE_ID,
          "reference-id": referenceId,
        },
      },
    };

    if (Object.keys(fields).length > 0) {
      payload.data.attributes.fields = fields;
    }

    const personaResponse = await fetch(PERSONA_CREATE_INQUIRY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERSONA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const personaText = await personaResponse.text();
    let personaJson = {};
    try {
      personaJson = personaText ? JSON.parse(personaText) : {};
    } catch (_) {
      personaJson = { raw: personaText };
    }

    if (!personaResponse.ok) {
      return send(personaResponse.status || 502, {
        ok: false,
        route: "kyc-start",
        stage: "persona-create-failed",
        action: "create",
        error: "Persona inquiry creation failed.",
        personaStatus: personaResponse.status,
        personaResponse: personaJson,
      });
    }

    const data = personaJson?.data || {};
    const attrs = data?.attributes || {};
    const links = data?.links || {};
    const meta = personaJson?.meta || {};

    const inquiryId = pickFirstString(
      data?.id,
      attrs["inquiry-id"],
      attrs.inquiryId
    );

    const inquiryStatus = pickFirstString(
      attrs.status,
      attrs["status"],
      "created"
    );

    const sessionToken = pickFirstString(
      attrs["session-token"],
      attrs.sessionToken,
      meta["session-token"],
      meta.sessionToken
    );

    const directVerificationUrl = pickFirstString(
      attrs["one-time-link"],
      attrs.oneTimeLink,
      attrs["verification-url"],
      attrs.verificationUrl,
      attrs["hosted-url"],
      attrs.hostedUrl,
      links["one-time-link"],
      links.oneTimeLink,
      meta["one-time-link"],
      meta.oneTimeLink
    );

    const shortVerificationUrl = pickFirstString(
      attrs["short-link"],
      attrs.shortLink,
      attrs["short-url"],
      attrs.shortUrl,
      meta["short-link"],
      meta.shortLink
    );

    const finalVerificationUrl = buildHostedUrl({
      verificationUrl: directVerificationUrl,
      hostedUrl: directVerificationUrl,
      shortVerificationUrl,
      inquiryId,
      sessionToken,
      redirectUri,
    });

    if (!inquiryId) {
      return send(502, {
        ok: false,
        route: "kyc-start",
        stage: "persona-response-invalid",
        action: "create",
        error: "Persona response did not contain an inquiry ID.",
        personaResponse: personaJson,
      });
    }

    return send(200, {
      ok: true,
      route: "kyc-start",
      stage: "persona-success",
      action: "create",
      mode: personaMode,
      provider: "persona",
      message: finalVerificationUrl
        ? "Identity check prepared. Opening Persona..."
        : "Identity check prepared.",
      inquiryId,
      inquiryStatus,
      referenceId,
      verificationUrl: finalVerificationUrl,
      hostedUrl: finalVerificationUrl,
      inquiryUrl: finalVerificationUrl,
      shortVerificationUrl: shortVerificationUrl || "",
      hasVerificationUrl: Boolean(finalVerificationUrl),
      hasSessionToken: Boolean(sessionToken),
      redirectUri,
      inquiry: {
        id: inquiryId,
        status: inquiryStatus,
        referenceId,
      },
      meta: {
        hasSessionToken: Boolean(sessionToken),
      },
    });
  } catch (err) {
    return send(500, {
      ok: false,
      route: "kyc-start",
      stage: "top-level-catch",
      error: toStr(err?.message) || "Unexpected server error.",
      stack:
        process.env.NODE_ENV === "development" ? toStr(err?.stack) : undefined,
    });
  }
}
