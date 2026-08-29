import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, BellOff, LogIn, ShieldCheck, Trash2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/AuthContext";

// Typed rather than clicked, because a misclick should not be able to end an
// account.
const CONFIRM_PHRASE = "CLOSE MY ACCOUNT";

async function authHeaders(extra = {}) {
  const client = getSupabaseBrowserClient();
  let token = "";

  if (client) {
    try {
      const { data } = await client.auth.getSession();
      token = data?.session?.access_token || "";
    } catch {
      token = "";
    }
  }

  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function callAccount(method, body) {
  const res = await fetch("/api/account", {
    method,
    headers: await authHeaders({
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    }),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Request failed (${res.status}).`);
  }
  return data;
}

export default function Account() {
  const { isAuthenticated, isAuthConfigured, isLoadingAuth, signOut } = useAuth();

  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [closed, setClosed] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const data = await callAccount("GET");
      setAccount(data.account);
      setStatus("ready");
    } catch (err) {
      setError(err?.message || "Could not load your account.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (isLoadingAuth || !isAuthenticated) return;
    load();
  }, [isLoadingAuth, isAuthenticated, load]);

  const handleUnsubscribe = useCallback(async () => {
    setError("");
    setNotice("");
    try {
      const data = await callAccount("POST", { action: "unsubscribe" });
      setNotice(
        data.removed > 0
          ? `Removed from the funding list. You will not be emailed about launch updates.`
          : data.note || "You were not on the funding list."
      );
      load();
    } catch (err) {
      setError(err?.message || "Could not update your subscription.");
    }
  }, [load]);

  const handleClose = useCallback(async () => {
    setError("");
    setNotice("");
    setStatus("closing");
    try {
      const data = await callAccount("DELETE");
      setClosed(data);
      // The sign-in no longer exists server-side; clear the local session so
      // the app does not keep presenting a token that resolves to nobody.
      await signOut();
    } catch (err) {
      setError(err?.message || "Could not close your account.");
      setStatus("ready");
    }
  }, [signOut]);

  if (!isAuthConfigured) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Accounts are unavailable on this deployment because sign-in is not
              configured.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (closed) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-primary">Your account is closed</h1>
          <Card className="shadow-premium border-0">
            <CardContent className="pt-6 space-y-4 text-neutral-700">
              <p>
                Your sign-in has been deleted, along with{" "}
                {closed.deleted?.recipients ?? 0} saved recipient
                {closed.deleted?.recipients === 1 ? "" : "s"}. You can no longer
                sign in with that email.
              </p>
              {closed.retained?.length > 0 && (
                <div>
                  <p className="font-semibold text-primary">
                    What we are required to keep
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {closed.retained.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-neutral-600">
                    {closed.retentionReason}
                  </p>
                </div>
              )}
              <Link to="/" className="inline-block">
                <Button variant="outline">Back to home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isLoadingAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Alert className="border-yellow-200 bg-yellow-50">
            <LogIn className="w-5 h-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You are not signed in.{" "}
              <Link to="/SignIn" className="underline font-semibold">
                Sign in
              </Link>{" "}
              to manage your account.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const canClose = account?.closure?.allowed;

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Your account</h1>
          <p className="text-neutral-600">
            What we hold about you, and how to stop holding it.
          </p>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {notice && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <AlertDescription className="text-emerald-800">{notice}</AlertDescription>
          </Alert>
        )}

        {status === "loading" && <p className="text-neutral-600">Loading…</p>}

        {account && (
          <>
            <Card className="shadow-premium border-0">
              <CardHeader>
                <CardTitle>Signed in</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-neutral-700">
                <p>
                  <span className="font-semibold text-primary">Email:</span>{" "}
                  {account.email || "—"}
                </p>
                {account.phone && (
                  <p>
                    <span className="font-semibold text-primary">Phone:</span>{" "}
                    {account.phone}
                  </p>
                )}
                <p>
                  <span className="font-semibold text-primary">
                    Identity verification:
                  </span>{" "}
                  {account.kycStatus}
                </p>
                <p className="text-sm text-neutral-500 break-all">
                  Account ID: {account.userId}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-0">
              <CardHeader>
                <CardTitle>What we hold</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-neutral-700">
                <p>Saved recipients: {account.counts.recipients}</p>
                <p>Transfers on record: {account.counts.transfers}</p>
                <p>Undelivered transfers: {account.counts.openPayouts}</p>
                <p>Funding-list entries: {account.counts.waitlistEntries}</p>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-0">
              <CardHeader>
                <CardTitle>Email preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-neutral-700">
                <p>
                  Leave the funding list without closing your account. You keep
                  your sign-in and your recipients.
                </p>
                <Button
                  variant="outline"
                  onClick={handleUnsubscribe}
                  disabled={account.counts.waitlistEntries === 0}
                >
                  <BellOff className="w-4 h-4 mr-2" />
                  {account.counts.waitlistEntries === 0
                    ? "Not on the funding list"
                    : "Unsubscribe from the funding list"}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-0">
              <CardHeader>
                <CardTitle className="text-red-700">Close your account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-neutral-700">
                <div>
                  <p className="font-semibold text-primary">This deletes</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {account.closure.willDelete.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                {account.closure.willRetain.length > 0 && (
                  <div>
                    <p className="font-semibold text-primary">
                      This does not delete
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {account.closure.willRetain.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-sm text-neutral-600">
                  {account.closure.retentionReason}
                </p>

                {!canClose ? (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {account.closure.blockedReason}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    <label
                      className="block text-sm font-semibold text-primary"
                      htmlFor="confirm-close"
                    >
                      Type {CONFIRM_PHRASE} to confirm
                    </label>
                    <input
                      id="confirm-close"
                      type="text"
                      value={confirmText}
                      onChange={(event) => setConfirmText(event.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                      autoComplete="off"
                      placeholder={CONFIRM_PHRASE}
                    />
                    <Button
                      onClick={handleClose}
                      disabled={
                        confirmText.trim() !== CONFIRM_PHRASE || status === "closing"
                      }
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {status === "closing" ? "Closing…" : "Close my account"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
