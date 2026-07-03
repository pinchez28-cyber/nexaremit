export default async function handler(req, res) {
  function sendJson(status, payload) {
    try {
      res.statusCode = status;
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.end(JSON.stringify(payload));
    } catch (sendError) {
      try {
        res.statusCode = 500;
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(
          JSON.stringify({
            ok: false,
            route: "kyc-status",
            stage: "send-json-fallback",
            error: "Failed to send JSON response",
            detail: String(sendError && sendError.message ? sendError.message : sendError),
          })
        );
      } catch (_) {
        try {
          res.statusCode = 500;
          res.end("fatal-response-error");
        } catch (_) {}
      }
    }
  }

  function normalize(value) {
    return String(value == null ? "" : value).trim();
  }

  function normalizeLower(value) {
    return normalize(value).toLowerCase();
  }

  function assert(condition, message, statusCode) {
    if (!condition) {
      const err = new Error(message);
      err.statusCode = statusCode || 400;
      throw err;
    }
  }

  function requireEnv(name) {
    const value = normalize(process.env[name]);
    assert(value, "Missing required environment variable: " + name + ".", 500);
    return value;
  }

  function requireExactEnv(name, expected) {
    const value = requireEnv(name);
    assert(
      normalizeLower(value) === normalizeLower(expected),
      "Invalid " + name + '. Expected "' + expected + '".',
      500
    );
    return value;
  }

  function requireHttpsUrl(name, expectedUrl) {
    const value = requireEnv(name);

    let parsed;
    try {
      parsed = new URL(value);
    } catch (_) {
      assert(false, "Invalid URL in environment variable: " + name + ".", 500);
    }

    assert(parsed.protocol === "https:", name + " must use https.", 500);

    if (expectedUrl) {
      assert(
        value === expectedUrl,
        "Invalid " + name + '. Expected "' + expectedUrl + '".',
        500
      );
    }

    return value;
  }

  function getRuntimeConfig() {
    const transferMode = requireExactEnv("TRANSFER_MODE", "production");
    const settlementProvider = requireExactEnv("SETTLEMENT_PROVIDER", "xrpl-mainnet");
    const xrplNetwork = requireExactEnv("XRPL_NETWORK", "mainnet");

    const personaApiKey = requireEnv("PERSONA_API_KEY");
    const personaCreateInquiryUrl = requireHttpsUrl(
      "PERSONA_CREATE_INQUIRY_URL",
      "https://api.withpersona.com/api/v1/inquiries"
    );

    return {
      transferMode,
      settlementProvider,
      xrplNetwork,
      personaApiKey,
      personaCreateInquiryUrl,
    };
  }

  function getRequestQuery(req) {
    if (req.query && typeof req.query === "object") {
      return req.query;
    }

    const host = normalize(
      req.headers &&
        (req.headers["x-forwarded-host"] ||
          req.headers["X-Forwarded-Host"] ||
          req.headers.host ||
          req.headers.Host)
    ) || "nexaremit.com";

    try {
      const url = new URL(req.url, "https://" + host);
      const result = {};
      url.searchParams.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    } catch (_) {
      return {};
    }
  }

  function buildRetrieveInquiryUrl(createInquiryUrl, inquiryId) {
    const base = createInquiryUrl.replace(/\/+$/, "");
    return base + "/" + encodeURIComponent(inquiryId);
  }

  function buildStatusMessage(status) {
    const normalized = normalizeLower(status);

    if (normalized === "created") {
      return "Identity check created. Waiting for the user to begin verification.";
    }
    if (normalized === "pending") {
      return "Identity verification is in progress.";
    }
    if (normalized === "completed") {
      return "Identity verification completed successfully.";
    }
    if (normalized === "approved") {
      return "Identity verification approved.";
    }
    if (normalized === "declined") {
      return "Identity verification was declined.";
    }
    if (normalized === "failed") {
      return "Identity verification failed.";
    }
    if (normalized === "expired") {
      return "Identity verification expired.";
    }
    if (normalized === "needs_review" || normalized === "marked_for_review") {
      return "Identity verification requires review.";
    }
    if (normalized === "redacted") {
      return "Identity verification data has been redacted.";
    }

    return status
      ? "Identity verification status: " + status
      : "Identity verification status is unavailable.";
  }

  function isTerminalStatus(status) {
    const normalized = normalizeLower(status);
    return (
      normalized === "completed" ||
      normalized === "approved" ||
      normalized === "declined" ||
      normalized === "failed" ||
      normalized === "expired" ||
      normalized === "redacted"
    );
  }

  try {
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("allow", "GET, OPTIONS");
      res.end();
      return;
    }

    if (req.method !== "GET") {
      res.setHeader("allow", "GET, OPTIONS");
      return sendJson(405, {
        ok: false,
        route: "kyc-status",
        stage: "method-check",
        error: "Method Not Allowed",
        method: req.method || null,
        allowedMethods: ["GET", "OPTIONS"],
      });
    }

    const config = getRuntimeConfig();
    const query = getRequestQuery(req);

    const inquiryId = normalize(query.inquiryId || query["inquiry-id"]);
    assert(inquiryId, "Missing inquiryId query parameter.", 400);
    assert(inquiryId.indexOf("inq_") === 0, 'inquiryId must start with "inq_".', 400);

    const retrieveUrl = buildRetrieveInquiryUrl(config.personaCreateInquiryUrl, inquiryId);

    const response = await fetch(retrieveUrl, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + config.personaApiKey,
        Accept: "application/json",
      },
    });

    const text = await response.text();

    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (_) {
        payload = { raw: text };
      }
    }

    if (!response.ok) {
      return sendJson(response.status || 502, {
        ok: false,
        route: "kyc-status",
        stage: "persona-retrieve-error",
        error: "Failed to retrieve Persona inquiry.",
        mode: config.transferMode,
        settlementProvider: config.settlementProvider,
        xrplNetwork: config.xrplNetwork,
        upstreamStatus: response.status,
        upstream: payload,
      });
    }

    const inquiry = payload && payload.data ? payload.data : null;
    const attributes = inquiry && inquiry.attributes ? inquiry.attributes : {};
    const inquiryStatus = normalize(attributes && attributes.status);
    const message = buildStatusMessage(inquiryStatus);

    return sendJson(200, {
      ok: true,
      route: "kyc-status",
      stage: "persona-status",
      mode: config.transferMode,
      settlementProvider: config.settlementProvider,
      xrplNetwork: config.xrplNetwork,
      provider: "persona",
      inquiryId,
      inquiryStatus: inquiryStatus || null,
      isTerminal: isTerminalStatus(inquiryStatus),
      isComplete: normalizeLower(inquiryStatus) === "completed",
      message,
      inquiry,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    const status =
      Number.isInteger(error && error.statusCode) &&
      error.statusCode >= 400 &&
      error.statusCode < 600
        ? error.statusCode
        : 500;

    return sendJson(status, {
      ok: false,
      route: "kyc-status",
      stage: "top-level-catch",
      error: String(error && error.message ? error.message : error),
      checkedAt: new Date().toISOString(),
    });
  }
}
