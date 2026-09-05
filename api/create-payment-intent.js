// api/create-payment-intent.js
//
// Server-side card-funding route (sandbox only; never point live Stripe keys
// at this). All logic lives in src/server/_lib/createPaymentIntentHandler.js;
// this file is the production wiring: lazy Stripe singleton, real
// requireAuthenticatedUser, real verifyKycInquiry.

import { createRequire } from "node:module";
import { requireAuthenticatedUser } from "../src/server/_lib/requireUser.js";
import { verifyKycInquiry } from "../src/server/_lib/kycGate.js";
import { createPaymentIntentHandler } from "../src/server/_lib/createPaymentIntentHandler.js";
import { getSupabaseAdminClient } from "../src/server/_lib/supabaseClient.js";

// Batch 2: the funding route is bound to the server-owned transfer. The store
// adapter reads the transfer/quote and persists the PI id + amount at creation
// so the webhook reconciles against server-recorded values only.
function makeTransferStore() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  return {
    async getTransferById(id) {
      const { data, error } = await supabase
        .from("transfer_records")
        .select("*")
        .eq("id", String(id))
        .maybeSingle();
      return { data, error };
    },
    async getQuoteById(id) {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", String(id))
        .maybeSingle();
      return { data, error };
    },
    async bindPaymentIntent({ id, paymentIntentId, paymentIntentAmountMinor }) {
      const { error } = await supabase
        .from("transfer_records")
        .update({
          payment_intent_id: String(paymentIntentId),
          payment_intent_amount_minor: Number(paymentIntentAmountMinor),
        })
        .eq("id", String(id));
      return { ok: !error, error };
    },
  };
}

// Stripe is created lazily inside getStripe so a missing/invalid key returns
// a clean JSON error instead of crashing the function at module load (which
// surfaces on Vercel as an opaque FUNCTION_INVOCATION_FAILED).
let stripeSingleton = null;
function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) return null;
  if (!stripeSingleton) {
    // Import lazily too: `stripe` is a CommonJS package, and Vercel loads
    // serverless functions through its own loader. Keeping the require inside
    // a function means a missing key still produces a clean error instead of
    // a module-load crash, and the singleton is cached after first use.
    const Stripe = createRequire(import.meta.url)("stripe");
    stripeSingleton = new Stripe(stripeSecretKey);
  }
  return stripeSingleton;
}

export default createPaymentIntentHandler({
  getStripeImpl: getStripe,
  requireAuthenticatedUser,
  verifyKyc: verifyKycInquiry,
  transferStore: makeTransferStore(),
});