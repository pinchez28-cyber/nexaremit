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

  const normalizeStatus = (value) =>
    toStr(value).toLowerCase().replace(/\s+/g, "_");

  const isTerminalStatus = (status) => {
    const s = normalizeStatus(status);
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

  try {
    if (req.method !== "GET") {
      return send(405, {
        ok: false,
        route: "kyc-status",
        stage: "method-not-allowed",
        error: "Method not allowed. Use GET.",
      });
    }

    const PERSONA_API_KEY = toStr(process.env.PERSONA_API_KEY);
    const PERSONA_CREATE_INQUIRY_URL =
      toStr(process.env.PERSONA_CREATE_INQUIRY_URL) ||
      "https://api.withpersona.com/api/v1/inquiries";

    if (!PERSONA_API_KEY) {
      return send(500, {
        ok: false,
        route: "kyc-status",
        stage: "env-validation",
        error: "Missing PERSONA_API_KEY.",
      });
    }

    const inquiryId = pickFirstString(
      req.query?.inquiryId,
      req.query?.["inquiry-id"]
    );

    if (!inquiryId) {
      return send(400, {
        ok: false,
        route: "kyc-status",
        stage: "missing-inquiry-id",
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
        route: "kyc-status",
        stage: "persona-status-failed",
        error: "Failed to retrieve Persona inquiry status.",
        inquiryId,
        personaStatus: personaResponse.status,
        personaResponse: personaJson,
      });
    }

    const data = personaJson?.data || {};
    const attrs = data?.attributes || {};

    const inquiryStatus = pickFirstString(attrs.status, "unknown");
    const normalized = normalizeStatus(inquiryStatus);
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

    const referenceId = pickFirstString(
      attrs["reference-id"],
      attrs.referenceId
    );

    const passed =
      ["approved", "passed"].includes(normalized) ||
      (normalized === "completed" &&
        !["declined", "failed"].includes(normalizeStatus(decision)));

    return send(200, {
      ok: true,
      route: "kyc-status",
      stage: "persona-status-success",
      provider: "persona",
      inquiryId,
      inquiryStatus,
      normalizedStatus: normalized,
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
  } catch (err) {
    return send(500, {
      ok: false,
      route: "kyc-status",
      stage: "top-level-catch",
      error: toStr(err?.message) || "Unexpected server error.",
      stack:
        process.env.NODE_ENV === "development" ? toStr(err?.stack) : undefined,
    });
  }
}
