// api/account.js
//
// What the signed-in customer can see and do about their own account.
//
// Three operations behind one function because the Hobby plan caps this
// project at twelve serverless functions and eleven were already in use:
//
//   GET     summary of what is held about this account, and whether it can close
//   POST    { action: "unsubscribe" }  remove the email from the funding list
//   DELETE  close the account
//
// Closing is not the same as erasing, and the response says so explicitly
// rather than implying a clean slate. An MSB has to retain records of the
// money it moved — 31 CFR 1010.410 puts that at five years — so a customer who
// has sent money cannot have those records deleted on request. What can go
// goes: the address book, the mailing list, and the sign-in itself.
//
// Anything still owed to a recipient blocks closure outright. An account with
// an undelivered payout is not a loose end to be tidied away.

import {
  sendJson,
  sendError,
  createHttpError,
  getJsonBody,
} from "../src/server/_lib/http.js";
import { requireAuthenticatedUser } from "../src/server/_lib/requireUser.js";
import { getSupabaseAdminClient } from "../src/server/_lib/supabaseClient.js";
import { recordAuditEvent } from "../src/server/_lib/audit.js";
import { PAYOUT_STATUS } from "../src/server/_lib/payoutProvider.js";

// Payout states that mean money is in flight or owed. Closure has to wait.
const OPEN_PAYOUT_STATUSES = [PAYOUT_STATUS.AWAITING_PROVIDER, PAYOUT_STATUS.PENDING];

function requireSupabase() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw createHttpError(503, "Account management is unavailable: Supabase is not configured.");
  }
  return supabase;
}

async function countRows(supabase, table, column, value) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, value);

  if (error) throw createHttpError(503, `Could not read ${table}: ${error.message}`);
  return count ?? 0;
}

/**
 * Everything held against this account, and what closing it would and would
 * not remove.
 */
async function buildSummary(supabase, user) {
  const [recipients, transfers, openPayouts] = await Promise.all([
    countRows(supabase, "recipients", "user_id", user.id),
    countRows(supabase, "transfer_records", "user_id", user.id),
    supabase
      .from("payouts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", OPEN_PAYOUT_STATUSES),
  ]);

  if (openPayouts.error) {
    throw createHttpError(503, `Could not read payouts: ${openPayouts.error.message}`);
  }

  const owed = openPayouts.count ?? 0;

  const { data: kyc } = await supabase
    .from("kyc_records")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  const email = String(user.email || "");

  const { count: waitlistCount } = email
    ? await supabase
        .from("funding_waitlist")
        .select("id", { count: "exact", head: true })
        .eq("email", email)
    : { count: 0 };

  const mustRetain = transfers > 0 || Boolean(kyc);

  return {
    userId: user.id,
    email: email || null,
    phone: user.phone || null,
    createdAt: user.createdAt || null,
    kycStatus: kyc?.status || "none",
    counts: {
      recipients,
      transfers,
      openPayouts: owed,
      waitlistEntries: waitlistCount ?? 0,
    },
    closure: {
      allowed: owed === 0,
      blockedReason:
        owed > 0
          ? `${owed} transfer${owed === 1 ? " has" : "s have"} not been delivered yet. We cannot close an account while money is still owed to a recipient.`
          : null,
      willDelete: ["Saved recipients", "Funding-list subscription", "Your sign-in"],
      willRetain: mustRetain
        ? [
            "Transfer records and payout records",
            "Identity verification result",
            "Compliance audit trail",
          ]
        : [],
      retentionReason: mustRetain
        ? "US money transmission rules require these to be kept for five years. They are no longer attached to a usable login."
        : "Nothing has to be kept: you have not sent money or completed identity verification.",
    },
  };
}

/**
 * Remove the account's email from the funding list.
 *
 * Offered on its own because "stop emailing me" and "delete everything about
 * me" are different requests, and only one of them should cost you the
 * account.
 */
async function unsubscribe(supabase, user) {
  const email = String(user.email || "");
  if (!email) {
    return { removed: 0, note: "This account has no email address on the funding list." };
  }

  const { data, error } = await supabase
    .from("funding_waitlist")
    .delete()
    .eq("email", email)
    .select("id");

  if (error) throw createHttpError(503, `Could not update the funding list: ${error.message}`);

  await recordAuditEvent({
    action: "account.unsubscribed",
    user,
    status: "completed",
    metadata: { email, removed: (data || []).length },
  });

  return { removed: (data || []).length };
}

async function closeAccount(supabase, user) {
  const summary = await buildSummary(supabase, user);

  if (!summary.closure.allowed) {
    throw createHttpError(409, summary.closure.blockedReason);
  }

  const email = String(user.email || "");

  // The closure record is written before anything is destroyed. If it cannot
  // be written we stop here: deleting an account with no record that it was
  // deleted, and no record of who asked, is worse than refusing.
  const closureRecord = await recordAuditEvent({
    action: "account.closed",
    user,
    status: "completed",
    metadata: {
      email,
      phone: user.phone || null,
      requestedAt: new Date().toISOString(),
      retained: summary.closure.willRetain,
      counts: summary.counts,
    },
  });

  if (!closureRecord.persisted) {
    throw createHttpError(
      503,
      "We could not record the account closure, so nothing has been deleted. Please try again."
    );
  }

  // Recipients go. The transfer and payout rows carry their own copy of the
  // recipient name and destination, so the retained records stay complete.
  const { data: removedRecipients, error: recipientError } = await supabase
    .from("recipients")
    .delete()
    .eq("user_id", user.id)
    .select("id");

  if (recipientError) {
    throw createHttpError(503, `Could not remove saved recipients: ${recipientError.message}`);
  }

  let removedWaitlist = 0;
  if (email) {
    const { data } = await supabase
      .from("funding_waitlist")
      .delete()
      .eq("email", email)
      .select("id");
    removedWaitlist = (data || []).length;
  }

  // Last, because it is the step that ends the session. The retained rows key
  // off user_id as plain text and carry no foreign key into auth, so they
  // survive this intact.
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

  if (deleteError) {
    throw createHttpError(
      503,
      `Your data was removed but the sign-in could not be deleted: ${deleteError.message}. Please contact support.`
    );
  }

  return {
    closed: true,
    deleted: {
      recipients: (removedRecipients || []).length,
      waitlistEntries: removedWaitlist,
      signIn: true,
    },
    retained: summary.closure.willRetain,
    retentionReason: summary.closure.retentionReason,
  };
}

export default async function handler(req, res) {
  try {
    const method = String(req.method || "GET").toUpperCase();

    if (!["GET", "POST", "DELETE"].includes(method)) {
      res.setHeader("Allow", "GET, POST, DELETE");
      throw createHttpError(405, `Method ${method} is not allowed on this route.`);
    }

    const supabase = requireSupabase();
    const user = await requireAuthenticatedUser(req);

    if (method === "GET") {
      return sendJson(res, 200, { ok: true, account: await buildSummary(supabase, user) });
    }

    if (method === "POST") {
      const body = await getJsonBody(req);
      const action = String(body?.action || "").trim();

      if (action !== "unsubscribe") {
        throw createHttpError(400, `Unknown action: ${action || "(none given)"}`);
      }

      return sendJson(res, 200, { ok: true, ...(await unsubscribe(supabase, user)) });
    }

    return sendJson(res, 200, { ok: true, ...(await closeAccount(supabase, user)) });
  } catch (error) {
    return sendError(res, error);
  }
}
