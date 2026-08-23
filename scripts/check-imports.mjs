// scripts/check-imports.mjs
//
// Import every serverless route with a deliberately empty environment.
//
// Six routes were once down in production at the same time with
// FUNCTION_INVOCATION_FAILED — Vercel's response when a function throws before
// its handler exists. The causes (config validated at module scope, a wrong
// relative import path, a dependency override that broke `xrpl`) were all
// invisible to `vite build`, because none of this code is part of the bundle.
//
// A route that imports cleanly here can always return a real HTTP response,
// even when it is misconfigured. Run with: npm run check:imports

import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const ROUTE_DIR = "api";

// Cleared so that anything resolving config at import time fails here rather
// than in production. Routes must defer that work to request time.
const ENV_KEYS_TO_CLEAR = [
  "TRANSFER_MODE",
  "SETTLEMENT_PROVIDER",
  "XRPL_NETWORK",
  "XRPL_SERVER_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RECIPIENTS_API_URL",
  "KYC_VERIFY_SENDER_URL",
  "SANCTIONS_SCREEN_TRANSFER_URL",
  "FUNDING_ESTIMATE_URL",
  "EXCHANGE_QUOTE_URL",
  "PAYOUT_ESTIMATE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PERSONA_API_KEY",
];

async function findRoutes(dir, found = []) {
  for (const entry of await readdir(dir)) {
    const path = join(dir, entry);
    if ((await stat(path)).isDirectory()) {
      await findRoutes(path, found);
    } else if (path.endsWith(".js")) {
      found.push(path);
    }
  }
  return found;
}

for (const key of ENV_KEYS_TO_CLEAR) {
  delete process.env[key];
}

// Packages that must resolve through CommonJS as well as ESM.
//
// Vercel's function bundler can take the "require" condition where local Node
// takes "import", so a package can import cleanly here and still crash in
// production with ERR_REQUIRE_ESM. That is exactly what xrpl did: importing it
// as ESM worked everywhere, while the deployed CJS path hit
// @xrplf/isomorphic requiring an ESM-only @noble/hashes. Checking both
// resolutions is the only way to catch it without deploying.
const CJS_REQUIRED_PACKAGES = ["xrpl"];

const require = createRequire(import.meta.url);

for (const name of CJS_REQUIRED_PACKAGES) {
  try {
    require(name);
    console.log(`ok    require("${name}") resolves through CommonJS`);
  } catch (error) {
    console.error(
      `FAIL  require("${name}") — ${String(error?.message || error).split(/\r?\n/)[0]}`
    );
    console.error(
      "      Imports as ESM but not as CommonJS: this crashes on Vercel only."
    );
    process.exit(1);
  }
}

const routes = (await findRoutes(ROUTE_DIR)).sort();
const failures = [];

for (const route of routes) {
  try {
    const module = await import(pathToFileURL(route).href);

    if (typeof module.default !== "function") {
      failures.push([route, "no default export handler"]);
      console.log(`FAIL  ${route} — no default export handler`);
      continue;
    }

    console.log(`ok    ${relative(ROUTE_DIR, route)}`);
  } catch (error) {
    const reason = String(error?.message || error).split("\n")[0];
    failures.push([route, reason]);
    console.log(`FAIL  ${relative(ROUTE_DIR, route)} — ${reason}`);
  }
}

console.log("");

if (failures.length) {
  console.error(
    `${failures.length} of ${routes.length} routes crash at import — these return an unreadable 500 in production:`
  );
  for (const [route, reason] of failures) {
    console.error(`  ${route}: ${reason}`);
  }
  process.exit(1);
}

// Vercel Hobby allows 12 serverless functions per deployment. Going over
// fails the deploy, so it is worth knowing before pushing.
console.log(`${routes.length} routes import cleanly (Hobby plan allows 12).`);
