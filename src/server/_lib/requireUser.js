// src/server/_lib/requireUser.js
//
// Establishes who is making a request, server-side.
//
// The browser sends a Supabase access token in the Authorization header. That
// token is verified against Supabase here — it is never trusted on its face,
// and no user id is ever read from the request body. A caller cannot become
// someone else by editing a payload.
//
// This replaces the device-id convention used before authentication existed,
// which separated browsers but proved nothing about who was behind one.

import { getSupabaseAdminClient } from "./supabaseClient.js";
import { createHttpError } from "./http.js";

function readBearerToken(req) {
  const raw = req.headers?.authorization || req.headers?.Authorization || "";
  const value = Array.isArray(raw) ? raw[0] : String(raw || "");
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

/**
 * Resolve the caller, or null when there is no valid session.
 *
 * Returns null rather than throwing so routes that serve both signed-in and
 * anonymous callers can decide for themselves.
 */
export async function getAuthenticatedUser(req) {
  const token = readBearerToken(req);
  if (!token) return null;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  const { user } = data;

  return {
    id: user.id,
    email: user.email || "",
    phone: user.phone || "",
    createdAt: user.created_at || null,
  };
}

/**
 * Resolve the caller or refuse the request.
 *
 * Distinguishes "sign-in is not available on this deployment" from "you are
 * not signed in", because the fix for each is completely different and a
 * single 401 for both wastes a lot of debugging time.
 */
export async function requireAuthenticatedUser(req) {
  if (!getSupabaseAdminClient()) {
    throw createHttpError(
      503,
      "Authentication is unavailable because Supabase is not configured on this deployment.",
      { reason: "supabase_not_configured" }
    );
  }

  const user = await getAuthenticatedUser(req);

  if (!user) {
    throw createHttpError(401, "You must be signed in to do this.", {
      reason: "authentication_required",
    });
  }

  return user;
}

/**
 * Dependency-injectable form of requireAuthenticatedUser for tests and for
 * routes that want to control enough of the wiring to prove — with mocked
 * Supabase — that no Stripe call happens before authentication succeeds.
 */
export async function requireAuthenticatedUserWithDeps(req, deps = {}) {
  const {
    getSupabaseAdmin = getSupabaseAdminClient,
    getUser = getAuthenticatedUser,
  } = deps;

  if (!getSupabaseAdmin()) {
    throw createHttpError(
      503,
      "Authentication is unavailable because Supabase is not configured on this deployment.",
      { reason: "supabase_not_configured" }
    );
  }

  const user = await getUser(req);

  if (!user || !user.id) {
    throw createHttpError(401, "You must be signed in to do this.", {
      reason: "authentication_required",
    });
  }

  return user;
}
