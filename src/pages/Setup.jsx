import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/AuthContext";

const RETURN_STORAGE_KEY = "nexaremit:persona:return";

// kyc-start now binds the Persona inquiry to the signed-in customer, so both
// calls have to carry the session.
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

function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function isTerminalStatus(status) {
  return [
    "completed",
    "approved",
    "passed",
    "needs_review",
    "declined",
    "failed",
    "expired",
    "canceled",
    "cancelled",
  ].includes(normalizeStatus(status));
}

function isSuccessfulStatus(status) {
  return ["completed", "approved", "passed"].includes(normalizeStatus(status));
}

function messageForStatus(status) {
  const s = normalizeStatus(status);

  if (!s || s === "idle") return "Start your live identity check to continue.";
  if (["created", "pending", "initiated"].includes(s)) {
    return "Identity check created. Complete the Persona flow to continue.";
  }
  if (["in_progress", "processing"].includes(s)) {
    return "Identity verification is in progress.";
  }
  if (["completed", "approved", "passed"].includes(s)) {
    return "Identity verification is complete.";
  }
  if (s === "needs_review") {
    return "Identity verification was submitted and is under review.";
  }
  if (["declined", "failed", "expired", "canceled", "cancelled"].includes(s)) {
    return "Identity verification did not complete successfully.";
  }

  return `Identity verification status: ${status}`;
}

function getReturnedInquiryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("inquiry-id") || params.get("inquiryId") || "";
}

function cleanupReturnParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete("inquiry-id");
  url.searchParams.delete("inquiryId");
  url.searchParams.delete("kyc_return");
  const qs = url.searchParams.toString();
  const nextUrl = `${url.pathname}${qs ? `?${qs}` : ""}${url.hash || ""}`;
  window.history.replaceState({}, "", nextUrl);
}

export default function Setup() {
  const { isAuthenticated, isAuthConfigured } = useAuth();

  const pollRef = useRef(null);
  const closeTimerRef = useRef(null);

  const [kyc, setKyc] = useState({
    loading: false,
    stage: "idle",
    inquiryId: "",
    inquiryStatus: "idle",
    verificationUrl: "",
    message: "Start your live identity check to continue.",
    error: "",
    returnedFromPersona: false,
    popupBlocked: false,
    lastCheckedAt: "",
  });

  const isPopupCallback = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.opener && window.opener !== window && getReturnedInquiryId());
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const refreshStatus = useCallback(
    async (incomingInquiryId) => {
      const inquiryId = incomingInquiryId || kyc.inquiryId;
      if (!inquiryId) return null;

      try {
        setKyc((prev) => ({
          ...prev,
          loading: true,
          error: "",
          stage: prev.returnedFromPersona
            ? "refreshing-returned-inquiry"
            : "refreshing-inquiry",
          message: "Refreshing identity verification status...",
        }));

        const res = await fetch(
          `/api/kyc-start?inquiryId=${encodeURIComponent(inquiryId)}`,
          {
            method: "GET",
            headers: await authHeaders({ Accept: "application/json" }),
          }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Failed to refresh KYC status.");
        }

        const inquiryStatus = data.inquiryStatus || "unknown";
        const terminal = Boolean(data.isTerminal);

        setKyc((prev) => ({
          ...prev,
          loading: false,
          error: "",
          stage: terminal ? "status-terminal" : "status-active",
          inquiryId,
          inquiryStatus,
          message: messageForStatus(inquiryStatus),
          lastCheckedAt: new Date().toISOString(),
        }));

        if (terminal) {
          stopPolling();
        }

        return data;
      } catch (err) {
        setKyc((prev) => ({
          ...prev,
          loading: false,
          stage: "status-error",
          error: err?.message || "Failed to refresh KYC status.",
          message: "Could not refresh identity verification status.",
          lastCheckedAt: new Date().toISOString(),
        }));
        return null;
      }
    },
    [kyc.inquiryId, stopPolling]
  );

  const startPolling = useCallback(
    (inquiryId) => {
      if (!inquiryId) return;
      stopPolling();
      pollRef.current = window.setInterval(async () => {
        await refreshStatus(inquiryId);
      }, 5000);
    },
    [refreshStatus, stopPolling]
  );

  const notifyParentAndPersistReturn = useCallback((inquiryId) => {
    if (!inquiryId) return;

    try {
      localStorage.setItem(
        RETURN_STORAGE_KEY,
        JSON.stringify({
          inquiryId,
          at: Date.now(),
        })
      );
    } catch (_) {}

    try {
      if (window.opener && window.opener !== window) {
        window.opener.postMessage(
          {
            type: "persona-return",
            inquiryId,
          },
          window.location.origin
        );
      }
    } catch (_) {}
  }, []);

  const openPersona = useCallback((verificationUrl) => {
    if (!verificationUrl) return false;

    const popup = window.open(
      verificationUrl,
      "personaKyc",
      "popup=yes,width=540,height=760,resizable=yes,scrollbars=yes"
    );

    if (popup && !popup.closed) {
      try {
        popup.focus();
      } catch (_) {}
      return true;
    }

    return false;
  }, []);

  const startKyc = useCallback(async () => {
    try {
      setKyc((prev) => ({
        ...prev,
        loading: true,
        error: "",
        popupBlocked: false,
        stage: "creating-inquiry",
        message: "Preparing identity check...",
      }));

      const res = await fetch("/api/kyc-start", {
        method: "POST",
        headers: await authHeaders({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create KYC inquiry.");
      }

      const inquiryId = data.inquiryId || "";
      const inquiryStatus = data.inquiryStatus || "created";
      const verificationUrl =
        data.verificationUrl || data.hostedUrl || data.shortVerificationUrl || "";

      setKyc((prev) => ({
        ...prev,
        loading: false,
        error: "",
        stage: "persona-ready",
        inquiryId,
        inquiryStatus,
        verificationUrl,
        message: verificationUrl
          ? "Identity check prepared. Opening Persona..."
          : "Identity check prepared.",
        lastCheckedAt: new Date().toISOString(),
      }));

      if (inquiryId) {
        startPolling(inquiryId);
      }

      if (verificationUrl) {
        const opened = openPersona(verificationUrl);

        if (!opened) {
          setKyc((prev) => ({
            ...prev,
            popupBlocked: true,
            message:
              "Popup was blocked. Redirecting to Persona in this tab instead.",
          }));
          window.location.assign(verificationUrl);
          return;
        }
      }
    } catch (err) {
      setKyc((prev) => ({
        ...prev,
        loading: false,
        stage: "create-error",
        error: err?.message || "Failed to start KYC.",
        message: /authentication_required|signed in/i.test(err?.message || "")
          ? "Please sign in before starting identity verification."
          : "Identity verification could not be started.",
      }));
    }
  }, [openPersona, startPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [stopPolling]);

  useEffect(() => {
    const onMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "persona-return") return;

      const inquiryId = String(event.data?.inquiryId || "").trim();
      if (!inquiryId) return;

      setKyc((prev) => ({
        ...prev,
        returnedFromPersona: true,
        inquiryId,
        stage: "received-popup-return",
        message: "Refreshing identity verification status...",
      }));

      await refreshStatus(inquiryId);
      startPolling(inquiryId);
    };

    const onStorage = async (event) => {
      if (event.key !== RETURN_STORAGE_KEY || !event.newValue) return;

      try {
        const parsed = JSON.parse(event.newValue);
        const inquiryId = String(parsed?.inquiryId || "").trim();
        if (!inquiryId) return;

        setKyc((prev) => ({
          ...prev,
          returnedFromPersona: true,
          inquiryId,
          stage: "received-storage-return",
          message: "Refreshing identity verification status...",
        }));

        await refreshStatus(inquiryId);
        startPolling(inquiryId);
      } catch (_) {}
    };

    window.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
    };
  }, [refreshStatus, startPolling]);

  useEffect(() => {
    const returnedInquiryId = getReturnedInquiryId();
    if (!returnedInquiryId) return;

    setKyc((prev) => ({
      ...prev,
      returnedFromPersona: true,
      inquiryId: returnedInquiryId,
      stage: "persona-return-detected",
      message: "Refreshing identity verification status...",
    }));

    notifyParentAndPersistReturn(returnedInquiryId);

    refreshStatus(returnedInquiryId).then(() => {
      startPolling(returnedInquiryId);
    });

    cleanupReturnParams();

    if (isPopupCallback) {
      closeTimerRef.current = window.setTimeout(() => {
        try {
          window.close();
        } catch (_) {}
      }, 800);
    }
  }, [isPopupCallback, notifyParentAndPersistReturn, refreshStatus, startPolling]);

  const canContinue = isSuccessfulStatus(kyc.inquiryStatus);
  const terminal = isTerminalStatus(kyc.inquiryStatus);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Setup</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Complete your identity verification before sending money.
      </p>

      {/* Identity verification attaches to an account, so there is nothing
          useful this page can do for a signed-out visitor. Say that plainly
          rather than letting the request fail and reporting a provider error. */}
      {isAuthConfigured && !isAuthenticated ? (
        <div
          style={{
            border: "1px solid #fde68a",
            borderRadius: 12,
            padding: 20,
            background: "#fffbeb",
            color: "#92400e",
            marginBottom: 20,
          }}
        >
          <strong>Please sign in first.</strong>
          <p style={{ margin: "8px 0 0" }}>
            Identity verification is linked to your account, so you need to be
            signed in before starting it.{" "}
            <a href="/SignIn" style={{ fontWeight: 600, textDecoration: "underline", color: "inherit" }}>
              Sign in
            </a>
            , then come back to this page.
          </p>
        </div>
      ) : null}

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <strong>KYC status:</strong> <span>{kyc.inquiryStatus || "idle"}</span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>Message:</strong> <span>{kyc.message}</span>
        </div>

        {kyc.inquiryId ? (
          <div style={{ marginBottom: 12 }}>
            <strong>Inquiry ID:</strong> <span>{kyc.inquiryId}</span>
          </div>
        ) : null}

        {kyc.error ? (
          <div
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 8,
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            }}
          >
            {kyc.error}
          </div>
        ) : null}

        {kyc.returnedFromPersona ? (
          <div
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 8,
              background: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
            }}
          >
            Persona returned to NexaRemit. This page will refresh the inquiry
            status automatically.
          </div>
        ) : null}

        {kyc.popupBlocked ? (
          <div
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 8,
              background: "#fff7ed",
              color: "#9a3412",
              border: "1px solid #fed7aa",
            }}
          >
            Popup was blocked, so the verification flow was opened in this tab.
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <button
            type="button"
            onClick={startKyc}
            disabled={kyc.loading}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #111827",
              background: "#111827",
              color: "#fff",
              cursor: kyc.loading ? "not-allowed" : "pointer",
            }}
          >
            {kyc.loading ? "Preparing identity check..." : "Start KYC Check"}
          </button>

          <button
            type="button"
            onClick={() => refreshStatus()}
            disabled={!kyc.inquiryId || kyc.loading}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#fff",
              color: "#111827",
              cursor: !kyc.inquiryId || kyc.loading ? "not-allowed" : "pointer",
            }}
          >
            Refresh status
          </button>

          {kyc.verificationUrl ? (
            <a
              href={kyc.verificationUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                color: "#111827",
                textDecoration: "none",
                background: "#fff",
              }}
            >
              Open Persona
            </a>
          ) : null}

          {canContinue ? (
            <a
              href="/SendMoney"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #16a34a",
                color: "#fff",
                textDecoration: "none",
                background: "#16a34a",
              }}
            >
              Continue to Transfer
            </a>
          ) : null}
        </div>

        {terminal && !canContinue ? (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              background: "#fff7ed",
              color: "#9a3412",
              border: "1px solid #fed7aa",
            }}
          >
            Verification ended with status <strong>{kyc.inquiryStatus}</strong>.
            Review the inquiry result before allowing transfer continuation.
          </div>
        ) : null}

        {kyc.lastCheckedAt ? (
          <div style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>
            Last checked: {new Date(kyc.lastCheckedAt).toLocaleString()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
