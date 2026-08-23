// src/server/_lib/runtimeConfig.js
//
// Lazy, accumulating environment configuration.
//
// Backend routes used to build their config at module scope, so one missing
// variable threw during import — before the handler existed. Vercel has
// nothing to call at that point, so it returns an opaque HTML 500
// (FUNCTION_INVOCATION_FAILED) with no indication of which variable was
// wrong. Six of this app's routes were down that way at once.
//
// These helpers defer the same validation to request time and report *every*
// problem together as a JSON 503, so a misconfiguration is distinguishable
// from a code bug and fixable in one pass instead of one variable per deploy.

import { createHttpError } from "./http.js";

/**
 * Resolve a config spec against process.env.
 *
 * The spec maps each config key to [ENV_VAR_NAME, resolver]. Every resolver
 * runs even after one fails, so the caller learns about all bad variables at
 * once rather than only the first.
 *
 * Throws a 503 http error whose details name the offending variables.
 */
export function resolveConfig(spec, envSource = process.env) {
  const values = {};
  const failed = [];
  const messages = [];

  for (const [key, [envName, resolve]] of Object.entries(spec)) {
    try {
      values[key] = resolve(envSource);
    } catch (error) {
      failed.push(envName);
      messages.push(error?.message || `[env] ${envName} is missing or invalid`);
    }
  }

  if (failed.length) {
    // Validation messages can echo the offending value (a URL, a key prefix),
    // so the detail stays in the server log. The response names variables only.
    console.error(`[runtime-config] ${messages.join(" | ")}`);

    throw createHttpError(503, "Server is not configured for this request.", {
      missingOrInvalidEnv: [...new Set(failed)],
    });
  }

  return Object.freeze(values);
}

/**
 * Defer resolveConfig to first use and cache the result.
 *
 * A failed resolve is not cached, so fixing the environment and redeploying —
 * or simply the next cold start — picks up the correction.
 */
export function lazyConfig(spec) {
  let cached = null;

  return function getConfig() {
    if (!cached) {
      cached = resolveConfig(spec);
    }
    return cached;
  };
}

/**
 * Evaluate a spec without throwing, for health reporting.
 *
 * Returns { ok, values, checks } where checks maps each config key to
 * { env, status: "pass" | "fail", error } — a health endpoint should be able
 * to say what is broken, which is exactly what it could not do while its own
 * config threw at import time.
 */
export function inspectConfig(spec, envSource = process.env) {
  const values = {};
  const checks = {};
  let ok = true;

  for (const [key, [envName, resolve]] of Object.entries(spec)) {
    try {
      values[key] = resolve(envSource);
      checks[key] = { env: envName, status: "pass" };
    } catch (error) {
      ok = false;
      checks[key] = {
        env: envName,
        status: "fail",
        error: error?.message || `${envName} is missing or invalid`,
      };
    }
  }

  return { ok, values, checks };
}
