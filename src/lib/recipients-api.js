// src/lib/recipients-api.js
//
// Browser client for /api/recipients.
//
// Reads the access token straight from the Supabase session rather than
// through React, so plain functions and components can both call it.

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

async function authorizedInit(extra = {}) {
  const client = getSupabaseBrowserClient();
  let accessToken = "";

  if (client) {
    try {
      const { data } = await client.auth.getSession();
      accessToken = data?.session?.access_token || "";
    } catch {
      accessToken = "";
    }
  }

  return {
    ...extra,
    headers: {
      ...(extra.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    }
  };
}

async function readError(response) {
  const payload = await response.json().catch(() => ({}));
  return new Error(
    payload?.error || payload?.message || `Request failed (${response.status})`
  );
}

export async function fetchRecipients() {
  const response = await fetch("/api/recipients", await authorizedInit());
  if (!response.ok) throw await readError(response);
  const payload = await response.json();
  return payload.recipients || [];
}

export async function addRecipient(input) {
  const response = await fetch(
    "/api/recipients",
    await authorizedInit({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    })
  );
  if (!response.ok) throw await readError(response);
  const payload = await response.json();
  return payload.recipient;
}

export async function removeRecipient(id) {
  const response = await fetch(
    `/api/recipients?id=${encodeURIComponent(id)}`,
    await authorizedInit({ method: "DELETE" })
  );
  if (!response.ok) throw await readError(response);
  return true;
}
