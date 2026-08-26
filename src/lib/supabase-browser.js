// src/lib/supabase-browser.js
//
// Browser-side Supabase client, used only for authentication.
//
// This is the ANON key, which is safe to ship to the browser — it grants only
// what row level security allows. The service role key must never appear here;
// it stays in src/server/_lib/supabaseClient.js, which only serverless
// functions import.
//
// Returns null when Supabase is not configured, so the app still builds and
// runs without it. Callers must handle null rather than assume a client.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let cachedClient;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Phone sign-in needs an SMS provider configured inside Supabase (Twilio or
// similar), which costs money per message. It is opt-in so the option can stay
// hidden until that is set up, rather than failing in front of a sender.
export function isPhoneAuthEnabled() {
  return (
    isSupabaseConfigured() &&
    String(import.meta.env.VITE_ENABLE_PHONE_AUTH || "")
      .trim()
      .toLowerCase() === "true"
  );
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Needed so the magic-link redirect back into the app is picked up.
        detectSessionInUrl: true,
      },
    });
  }

  return cachedClient;
}
