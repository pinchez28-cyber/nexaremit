// api/_lib/http.js

export function createHttpError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details !== undefined) {
    error.details = details;
  }
  return error;
}

export function sendJson(res, statusCode, payload) {
  return res.status(statusCode).json(payload);
}

export function sendError(res, error) {
  const statusCode =
    Number.isInteger(error?.statusCode) && error.statusCode >= 400
      ? error.statusCode
      : 500;

  const body = {
    error:
      typeof error?.message === "string" && error.message.trim()
        ? error.message
        : "Internal Server Error",
  };

  if (error?.details !== undefined) {
    body.details = error.details;
  }

  return res.status(statusCode).json(body);
}

export function assertMethod(req, res, allowedMethods) {
  if (!allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods.join(", "));
    throw createHttpError(
      405,
      `Method ${req.method} not allowed. Expected one of: ${allowedMethods.join(", ")}`
    );
  }
}

export function getJsonBody(req) {
  let body;

  try {
    body = req.body;
  } catch (error) {
    throw createHttpError(400, "Malformed JSON request body", error?.message);
  }

  if (body == null) {
    throw createHttpError(400, "Request body is required");
  }

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      throw createHttpError(400, "Request body must be valid JSON");
    }
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createHttpError(400, "Request body must be a JSON object");
  }

  return body;
}
