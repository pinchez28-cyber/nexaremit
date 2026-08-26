// scripts/verify-deployment.mjs
//
// Probe a deployed NexaRemit and report which controls are actually live.
//
// Every control in this codebase is enforced server-side, which means none of
// them can be confirmed by reading the browser bundle or by a unit test. This
// asks the deployment itself, so "we enforce X" is a thing that was checked
// rather than a thing that was intended.
//
//   node scripts/verify-deployment.mjs https://nexaremit.com
//
// It sends no authenticated requests and creates nothing. Every probe is
// either a read or a deliberately unauthenticated call that must be refused —
// a refusal IS the passing result for most of these.

const target = (process.argv[2] || "").replace(/\/+$/, "");

if (!target) {
  console.error("Usage: node scripts/verify-deployment.mjs <https://your-deployment>");
  process.exit(2);
}

const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
}

async function probe(path, init = {}) {
  const response = await fetch(`${target}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init.headers || {}) },
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json — that is itself a finding */
  }
  return { status: response.status, json, text };
}

console.log(`Verifying ${target}\n`);

// 1. Health should describe itself, not crash. A misconfigured deployment is
//    expected to answer 503 and name what is missing.
{
  const { status, json } = await probe("/api/health");
  if (json && (status === 200 || status === 503)) {
    const missing = json.misconfigured || [];
    record(
      "health reports configuration",
      true,
      status === 200
        ? "200 — fully configured"
        : `503 — missing: ${missing.join(", ") || "(unnamed)"}`
    );
  } else {
    record("health reports configuration", false, `status ${status}, non-JSON body`);
  }
}

// 2. No route may fall through to the SPA. An /api path answering with HTML
//    means the rewrite is swallowing it and the function never ran.
{
  const paths = [
    "/api/health",
    "/api/recipients",
    "/api/transfer-records",
    "/api/settlement/prepare",
    "/api/create-payment-intent",
  ];
  const htmlFallbacks = [];
  const crashes = [];

  for (const path of paths) {
    const { status, text } = await probe(path);
    if (text.startsWith("<!doctype") || text.startsWith("<!DOCTYPE")) htmlFallbacks.push(path);
    if (text.includes("FUNCTION_INVOCATION_FAILED")) crashes.push(`${path} (${status})`);
  }

  record(
    "every API route reaches its function",
    htmlFallbacks.length === 0,
    htmlFallbacks.length ? `served HTML: ${htmlFallbacks.join(", ")}` : "no SPA fallbacks"
  );
  record(
    "no route crashes on load",
    crashes.length === 0,
    crashes.length ? `FUNCTION_INVOCATION_FAILED: ${crashes.join(", ")}` : "none crashed"
  );
}

// 3. The money path must refuse an unauthenticated caller. This is the single
//    most important probe here: if it returns a client secret, anyone can
//    create a charge.
{
  const { status, json } = await probe("/api/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 25000, currency: "USD" }),
  });

  const refused = status === 401 || status === 403 || status === 503;
  const leaked = Boolean(json?.clientSecret);

  record(
    "payment path refuses unauthenticated callers",
    refused && !leaked,
    leaked
      ? "CRITICAL: returned a client secret without authentication"
      : `status ${status} — ${json?.error || json?.message || "refused"}`
  );
}

// 4. Recipients must not be readable without a session.
{
  const { status, json } = await probe("/api/recipients");
  const refused = status === 401 || status === 403 || status === 503;
  record(
    "recipients require authentication",
    refused,
    `status ${status} — ${json?.error || "refused"}`
  );
}

// 5. The shipped bundle must not contain the demo identities that were once
//    hardcoded into it.
{
  const page = await fetch(target);
  const html = await page.text();
  const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
  const names = ["Amara Okafor", "Daniel Mwangi", "Efua Mensah", "Kofi Boateng", "NX-DEMO"];
  const found = new Set();

  for (const src of scripts) {
    const url = src.startsWith("http") ? src : `${target}${src}`;
    const body = await (await fetch(url)).text();
    for (const name of names) if (body.includes(name)) found.add(name);
  }

  record(
    "no fabricated demo data in the bundle",
    found.size === 0,
    found.size ? `found: ${[...found].join(", ")}` : `checked ${scripts.length} script(s)`
  );
}

// 6. Whether real card payments can be taken. Not a pass/fail — a statement of
//    fact that should match what you have told partners.
{
  const page = await fetch(target);
  const html = await page.text();
  const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
  let live = false;
  let test = false;

  for (const src of scripts) {
    const url = src.startsWith("http") ? src : `${target}${src}`;
    const body = await (await fetch(url)).text();
    if (/pk_live_/.test(body)) live = true;
    if (/pk_test_/.test(body)) test = true;
  }

  record(
    "Stripe key mode",
    !live,
    live
      ? "LIVE key shipped — this deployment can take real card payments"
      : test
        ? "test key — cannot take real payments"
        : "no Stripe publishable key found in the bundle"
  );
}

const failed = results.filter((result) => !result.ok);

console.log(
  `\n${results.length - failed.length}/${results.length} checks passed.`
);

if (failed.length) {
  console.log("\nNeeds attention:");
  for (const result of failed) console.log(`  - ${result.name}: ${result.detail}`);
  process.exit(1);
}
