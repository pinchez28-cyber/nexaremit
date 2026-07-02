export default async function handler(req, res) {
  async function sendJson(status, payload) {
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
          stage: "sendJson",
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

  async function readRawBody() {
    try {
      if (typeof req.body === "string") return req.body;
      if (req.body && typeof req.body === "object") {
        return JSON.stringify(req.body);
      }

      const chunks = [];
      for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      return Buffer.concat(chunks).toString("utf8");
    } catch (error) {
      throw new Error(
        "Failed to read request body: " +
        String(error && error.message ? error.message : error)
      );
    }
  }

  try {
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("allow", "POST, OPTIONS");
      res.end();
      return;
    }

    if (req.method !== "POST") {
      await sendJson(405, {
        ok: false,
        route: "kyc-start",
        stage: "method-check",
        error: "Method Not Allowed",
        method: req.method || null,
        allowedMethods: ["POST", "OPTIONS"]
      });
      return;
    }

    let rawBody = "";
    try {
      rawBody = await readRawBody();
    } catch (error) {
      await sendJson(400, {
        ok: false,
        route: "kyc-start",
        stage: "body-read",
        error: String(error && error.message ? error.message : error)
      });
      return;
    }

    if (!rawBody || !String(rawBody).trim()) {
      await sendJson(200, {
        ok: true,
        route: "kyc-start",
        stage: "loaded",
        method: req.method,
        bodyReceived: false,
        bodyParsed: false,
        message: "Diagnostic route loaded successfully. Empty body accepted.",
        env: {
          TRANSFER_MODE: !!process.env.TRANSFER_MODE,
          SETTLEMENT_PROVIDER: !!process.env.SETTLEMENT_PROVIDER,
          XRPL_NETWORK: !!process.env.XRPL_NETWORK,
          PERSONA_API_KEY: !!process.env.PERSONA_API_KEY,
          PERSONA_TEMPLATE_ID: !!process.env.PERSONA_TEMPLATE_ID,
          PERSONA_CREATE_INQUIRY_URL: !!process.env.PERSONA_CREATE_INQUIRY_URL
        }
      });
      return;
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (error) {
      await sendJson(400, {
        ok: false,
        route: "kyc-start",
        stage: "body-parse",
        error: "Invalid JSON body",
        detail: String(error && error.message ? error.message : error),
        rawBodyPreview: String(rawBody).slice(0, 500)
      });
      return;
    }

    await sendJson(200, {
      ok: true,
      route: "kyc-start",
      stage: "loaded",
      method: req.method,
      bodyReceived: true,
      bodyParsed: true,
      parsedBody,
      env: {
        TRANSFER_MODE: process.env.TRANSFER_MODE || null,
        SETTLEMENT_PROVIDER: process.env.SETTLEMENT_PROVIDER || null,
        XRPL_NETWORK: process.env.XRPL_NETWORK || null,
        PERSONA_API_KEY_PRESENT: !!process.env.PERSONA_API_KEY,
        PERSONA_TEMPLATE_ID_PRESENT: !!process.env.PERSONA_TEMPLATE_ID,
        PERSONA_CREATE_INQUIRY_URL: process.env.PERSONA_CREATE_INQUIRY_URL || null
      },
      message: "Diagnostic route executed successfully.",
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    await sendJson(500, {
      ok: false,
      route: "kyc-start",
      stage: "top-level-catch",
      error: String(error && error.message ? error.message : error),
      checkedAt: new Date().toISOString()
    });
  }
}
