// src/lib/fx-rates.js
//
// Live FX rates with caching and a guaranteed fallback.
//
// The bundled corridorRates table in transfer-pricing.js is a static snapshot,
// so quoted rates drift further from reality every day the app is deployed.
// This module refreshes them from a public rates feed and caches the result,
// falling back to the bundled table whenever the network, the feed, or the
// browser storage is unavailable. A quote is never blocked by a rates failure.
//
// NOTE: these rates are for DISPLAY and quoting only. Settlement-grade rates
// should be locked server-side by the FX provider before money moves.

import { corridorRates } from "./transfer-pricing.js";

const CACHE_KEY = "nexaremit:fx:v1";
const DEFAULT_TTL_MS = 60 * 60 * 1000; // refresh at most once an hour
const REQUEST_TIMEOUT_MS = 6000;

const RATES_ENDPOINT = "https://open.er-api.com/v6/latest/";

// base -> { rates, fetchedAt }
const memoryCache = new Map();

function now() {
  return Date.now();
}

function normalizeCode(code, fallback = "USD") {
  const value = String(code || fallback).trim().toUpperCase();
  return value || fallback;
}

function readStorage() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(payload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable (private mode, quota) — memory cache still works */
  }
}

function loadCached(base) {
  const key = normalizeCode(base);

  if (memoryCache.has(key)) return memoryCache.get(key);

  const stored = readStorage();
  if (stored?.[key]?.rates) {
    memoryCache.set(key, stored[key]);
    return stored[key];
  }

  return null;
}

function saveCached(base, rates) {
  const key = normalizeCode(base);
  const entry = { rates, fetchedAt: now() };

  memoryCache.set(key, entry);
  writeStorage({ ...(readStorage() || {}), [key]: entry });

  return entry;
}

function isFresh(entry, ttlMs = DEFAULT_TTL_MS) {
  return Boolean(entry?.fetchedAt) && now() - entry.fetchedAt < ttlMs;
}

/** The bundled static rate, used whenever live data is unavailable. */
export function getFallbackRate(from, to) {
  const source = normalizeCode(from);
  const target = normalizeCode(to);
  const rate = corridorRates?.[source]?.[target];
  return Number.isFinite(Number(rate)) && Number(rate) > 0 ? Number(rate) : null;
}

async function requestRates(base) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${RATES_ENDPOINT}${normalizeCode(base)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const payload = await response.json();
    // Support the common shapes: { rates } and { conversion_rates }
    const rates = payload?.rates || payload?.conversion_rates;

    if (!rates || typeof rates !== "object") return null;
    if (payload?.result && payload.result !== "success") return null;

    return rates;
  } catch {
    return null; // timeout, offline, CORS, malformed payload — all non-fatal
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Refresh rates for a base currency if the cache is stale.
 * Returns { rates, fetchedAt, live } — never throws.
 */
export async function refreshRates(base, { ttlMs = DEFAULT_TTL_MS, force = false } = {}) {
  const key = normalizeCode(base);
  const cached = loadCached(key);

  if (!force && isFresh(cached, ttlMs)) {
    return { ...cached, live: true, fromCache: true };
  }

  const rates = await requestRates(key);

  if (rates) {
    return { ...saveCached(key, rates), live: true, fromCache: false };
  }

  // Serve stale cache rather than nothing.
  if (cached?.rates) return { ...cached, live: true, stale: true };

  return { rates: null, fetchedAt: null, live: false };
}

/**
 * Best available rate for a corridor: live cache first, bundled table second.
 * Synchronous — safe to call during render.
 */
export function getRate(from, to) {
  const source = normalizeCode(from);
  const target = normalizeCode(to);

  const cached = loadCached(source);
  const live = Number(cached?.rates?.[target]);

  if (Number.isFinite(live) && live > 0) {
    return { rate: live, source: "live", fetchedAt: cached.fetchedAt };
  }

  const fallback = getFallbackRate(source, target);
  return fallback
    ? { rate: fallback, source: "fallback", fetchedAt: null }
    : { rate: null, source: "none", fetchedAt: null };
}

export const FX_TTL_MS = DEFAULT_TTL_MS;
