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
        res.end(JSON.stringify({
          ok: false,
          route: "kyc-start",
          stage: "send-json-fallback",
          error: "Failed to send JSON response",
          detail: String(sendError && sendError.message ? sendError.message : sendError)
        }));
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

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function assert(condition, message, statusCode) {
    if (!condition) {
      const err = new Error(message);
      err.statusCode = statusCode || 400;
      throw err;
    }
  }

  function containsForbiddenMarker(value) {
    const text = normalizeLower(value);
    if (!text) return false;

    return (
      text.includes("testnet") ||
      text.includes("sandbox") ||
      text.includes("mock") ||
      text.includes("pk_test_") ||
      text.includes("sk_test_") ||
      text.includes("demo") ||
      text.includes("example.com") ||
      text.includes("your-") ||
      text.includes("changeme")
    );
  }

  function scanForForbiddenMarkers(value, path) {
    const currentPath = path || "body";

    if (value == null) return;

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      assert(
        !containsForbiddenMarker(value),
        "Forbidden non-production marker detected in " + currentPath + ".",
        400
      );
      return;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i += 1) {
        scanForForbiddenMarkers(value[i], currentPath + "[" + i + "]");
      }
      return;
    }

    if (isPlainObject(value)) {
      const entries = Object.entries(value);
      for (let i = 0; i < entries.length; i += 1) {
        const key = entries[i][0];
        const child = entries[i][1];
        scanForForbiddenMarkers(child, currentPath + "." + key);
      }
    }
  }

  function requireEnv(name) {
    const value = normalize(process.env[name]);
    assert(value, "Missing required environment variable: " + name + ".", 500);
    assert(!containsForbiddenMarker(value), "Unsafe value in environment variable: " + name + ".", 500);
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
    const personaTemplateId = requireEnv("PERSONA_TEMPLATE_ID");
    const personaCreateInquiryUrl = requireHttpsUrl(
      "PERSONA_CREATE_INQUIRY_URL",
      "https://api.withpersona.com/api/v1/inquiries"
    );

    assert(
      personaTemplateId.indexOf("itmpl_") === 0,
      'PERSONA_TEMPLATE_ID must start with "itmpl_".',
      500
    );

    return {
      transferMode,
      settlementProvider,
      xrplNetwork,
      personaApiKey,
      personaTemplateId,
      personaCreateInquiryUrl
    };
  }

  async function readBody() {
    try {
      if (req.body && typeof req.body === "object") {
        return req.body;
      }

      if (typeof req.body === "string") {
        const text = req.body.trim();
        if (!text) return {};
        return JSON.parse(text);
      }

      const chunks = [];
      for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }

      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (error) {
      const err = new Error("Request body is not valid JSON.");
      err.statusCode = 400;
      throw err;
    }
  }

  function validateRequestBody(body) {
    assert(isPlainObject(body), "Request body must be a JSON object.", 400);

    if (body.transferMode !== undefined) {
      assert(
        normalizeLower(body.transferMode) === "production",
        'body.transferMode must be "production".',
        400
      );
    }

    if (body.settlementProvider !== undefined) {
      assert(
        normalizeLower(body.settlementProvider) === "xrpl-mainnet",
        'body.settlementProvider must be "xrpl-mainnet".',
        400
      );
    }

    if (body.provider !== undefined) {
      assert(
        normalizeLower(body.provider) === "xrpl-mainnet",
        'body.provider must be "xrpl-mainnet".',
        400
      );
    }

    if (body.xrplNetwork !== undefined) {
      assert(
        normalizeLower(body.xrplNetwork) === "mainnet",
        'body.xrplNetwork must be "mainnet".',
        400
      );
    }

    if (body.referenceId !== undefined) {
      assert(typeof body.referenceId === "string", "body.referenceId must be a string.", 400);
    }

    if (body.note !== undefined) {
      assert(typeof body.note === "string", "body.note must be a string.", 400);
    }

    if (body.accountId !== undefined) {
      assert(typeof body.accountId === "string", "body.accountId must be a string.", 400);
    }

    if (body.metadata !== undefined) {
      assert(isPlainObject(body.metadata), "body.metadata must be an object.", 400);
    }

    if (body.fields !== undefined) {
      assert(isPlainObject(body.fields), "body.fields must be an object.", 400);
    }

    scanForForbiddenMarkers(body, "body");
  }

  function buildPersonaPayload(body, config) {
    const referenceId =
      normalize(body.referenceId) ||
      normalize(body.transferId) ||
      normalize(body.transactionId) ||
      normalize(body.paymentIntentId) ||
      ("nexaremit-kyc-" + Date.now());

    const attributes = {
      inquiry_template_id: config.personaTemplateId,
      reference_id: referenceId
    };

    if (body.note !== undefined) {
      attributes.note = normalize(body.note);
    }

    if (body.fields !== undefined) {
      attributes.fields = body.fields;
    }

    if (body.metadata !== undefined) {
      attributes.metadata = body.metadata;
    }

    const payload = {
      data: {
        type: "inquiry",
        attributes: attributes
      }
    };

    if (body.accountId !== undefined && normalize(body.accountId)) {
      payload.data.relationships = {
        account: {
          data: {
            type: "account",
            id: normalize(body.accountId)
          }
        }
      };
    }

    return payload;
  }

  function redactUpstream(upstream) {
    if (!upstream || typeof upstream !== "object") return upstream;

    const clone = JSON.parse(JSON.stringify(upstream));

    function walk(node) {
      if (!node || typeof node !== "object") return;

      const keys = Object.keys(node);
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const lowerKey = key.toLowerCase();

        if (
          lowerKey.includes("api_key") ||
          lowerKey === "authorization" ||
          lowerKey === "token" ||
          lowerKey === "secret"
        ) {
          node[key] = "[redacted]";
          continue;
        }

        walk(node[key]);
      }
    }

    walk(clone);
    return clone;
  }

  try {
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("allow", "POST, OPTIONS");
      res.end();
      return;
    }

    if (req.method !== "POST") {
      res.setHeader("allow", "POST, OPTIONS");
      return sendJson(405, {
        ok: false,
        route: "kyc-start",
        stage: "method-check",
        error: "Method Not Allowed",
        method: req.method || null,
        allowedMethods: ["POST", "OPTIONS"]
      });
    }

    const contentType = normalizeLower(req.headers && (req.headers["content-type"] || req.headers["Content-Type"] || ""));
    if (contentType && contentType.indexOf("application/json") === -1) {
      return sendJson(415, {
        ok: false,
        route: "kyc-start",
        stage: "content-type-check",
        error: 'Content-Type must include "application/json".'
      });
    }

    const config = getRuntimeConfig();
    const body = await readBody();
    validateRequestBody(body);
    const personaPayload = buildPersonaPayload(body, config);

    let personaResponse;
    try {
      personaResponse = await fetch(config.personaCreateInquiryUrl, {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + config.personaApiKey,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(personaPayload)
      });
    } catch (error) {
      return sendJson(502, {
        ok: false,
        route: "kyc-start",
        stage: "persona-fetch",
        error: "Failed to reach Persona API.",
        detail: String(error && error.message ? error.message : error),
        mode: config.transferMode,
        settlementProvider: config.settlementProvider,
        xrplNetwork: config.xrplNetwork,
        personaUrl: config.personaCreateInquiryUrl
      });
    }

    let upstreamText = "";
    try {
      upstreamText = await personaResponse.text();
    } catch (error) {
      return sendJson(502, {
        ok: false,
        route: "kyc-start",
        stage: "persona-read-response",
        error: "Failed to read Persona API response.",
        detail: String(error && error.message ? error.message : error),
        upstreamStatus: personaResponse.status
      });
    }

    let upstreamJson = null;
    if (upstreamText) {
      try {
        upstreamJson = JSON.parse(upstreamText);
      } catch (_) {
        upstreamJson = { raw: upstreamText };
      }
    }

    if (!personaResponse.ok) {
      return sendJson(personaResponse.status || 502, {
        ok: false,
        route: "kyc-start",
        stage: "persona-api-error",
        error: "Persona inquiry creation failed.",
        mode: config.transferMode,
        settlementProvider: config.settlementProvider,
        xrplNetwork: config.xrplNetwork,
        upstreamStatus: personaResponse.status,
        upstream: redactUpstream(upstreamJson)
      });
    }

    const inquiry = upstreamJson && upstreamJson.data ? upstreamJson.data : null;
    const inquiryId = inquiry && inquiry.id ? inquiry.id : null;
    const inquiryAttributes = inquiry && inquiry.attributes ? inquiry.attributes : {};
    const inquiryStatus = inquiryAttributes && inquiryAttributes.status ? inquiryAttributes.status : null;

    return sendJson(200, {
      ok: true,
      route: "kyc-start",
      stage: "persona-success",
      mode: config.transferMode,
      settlementProvider: config.settlementProvider,
      xrplNetwork: config.xrplNetwork,
      provider: "persona",
      inquiryId: inquiryId,
      inquiryStatus: inquiryStatus,
      inquiry: inquiry
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
      route: "kyc-start",
      stage: "top-level-catch",
      error: String(error && error.message ? error.message : error),
      checkedAt: new Date().toISOString()
    });
  }
}
