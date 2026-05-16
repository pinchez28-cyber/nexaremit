export function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

export function requireMethod(request, response, methods) {
  if (methods.includes(request.method)) return true;
  response.setHeader("Allow", methods.join(", "));
  sendJson(response, 405, { error: "method_not_allowed", allowed: methods });
  return false;
}

export async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString("utf8");
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody);
  } catch {
    const error = new Error("Invalid JSON body");
    error.code = "invalid_json";
    throw error;
  }
}

export function getRequestUser(request) {
  return {
    id: request.headers["x-nexaremit-user-id"] || "sandbox-user",
    email: request.headers["x-nexaremit-user-email"] || "sandbox@nexaremit.com",
    kycStatus: request.headers["x-nexaremit-kyc-status"] || "approved"
  };
}
