import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const STEPS = ["Sender", "Receiver", "Review"];

const NEEDS = [
  "Sender name and phone number",
  "Receiver name and country",
  "How the receiver wants to collect money",
];

const COUNTRIES = [
  { label: "Kenya", code: "KE" },
  { label: "Nigeria", code: "NG" },
  { label: "Ghana", code: "GH" },
  { label: "India", code: "IN" },
  { label: "Philippines", code: "PH" },
  { label: "Mexico", code: "MX" },
  { label: "Brazil", code: "BR" },
  { label: "Pakistan", code: "PK" },
  { label: "Bangladesh", code: "BD" },
  { label: "South Africa", code: "ZA" },
  { label: "Egypt", code: "EG" },
  { label: "Morocco", code: "MA" },
  { label: "Other supported country", code: "OTHER" },
];

const PAYOUT_OPTIONS = [
  {
    id: "bank",
    label: "Bank account",
    helper: "Best for receivers who use a bank.",
    icon: "🏦",
  },
  {
    id: "mobile",
    label: "Mobile money",
    helper: "Good for quick phone-based payouts.",
    icon: "📱",
  },
  {
    id: "cash",
    label: "Cash pickup",
    helper: "Useful when the receiver does not use banking apps.",
    icon: "💵",
  },
];

function splitFullName(fullName) {
  const cleaned = String(fullName || "").trim().replace(/\s+/g, " ");
  if (!cleaned) {
    return { first: "", last: "" };
  }

  const parts = cleaned.split(" ");
  if (parts.length === 1) {
    return { first: parts[0], last: "" };
  }

  return {
    first: parts[0],
    last: parts.slice(1).join(" "),
  };
}

function normalizeKycStartResponse(payload) {
  const inquiry = payload?.inquiry ?? null;

  const verificationUrl =
    payload?.verificationUrl ||
    payload?.hostedUrl ||
    payload?.inquiryUrl ||
    inquiry?.attributes?.verification_url ||
    inquiry?.attributes?.["verification-url"] ||
    "";

  const inquiryId = payload?.inquiryId || inquiry?.id || "";

  const inquiryStatus =
    payload?.inquiryStatus ||
    inquiry?.attributes?.status ||
    "";

  const stage = payload?.stage || "";

  const message =
    payload?.message ||
    (payload?.ok
      ? verificationUrl
        ? "Identity check prepared. Opening Persona..."
        : inquiryId
          ? `Identity check prepared. Reference: ${inquiryId}`
          : "Identity check prepared."
      : payload?.error || "Failed to prepare identity check.");

  return {
    ok: payload?.ok === true,
    message,
    inquiryId,
    inquiryStatus,
    verificationUrl,
    stage,
    raw: payload,
  };
}

function getKycMessageStyle(status) {
  if (status === "error") {
    return {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#991b1b",
      borderRadius: "12px",
      padding: "12px 14px",
      marginTop: "12px",
      lineHeight: 1.45,
    };
  }

  if (status === "success") {
    return {
      background: "#ecfdf5",
      border: "1px solid #a7f3d0",
      color: "#065f46",
      borderRadius: "12px",
      padding: "12px 14px",
      marginTop: "12px",
      lineHeight: 1.45,
    };
  }

  if (status === "loading") {
    return {
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      color: "#1d4ed8",
      borderRadius: "12px",
      padding: "12px 14px",
      marginTop: "12px",
      lineHeight: 1.45,
    };
  }

  return {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    borderRadius: "12px",
    padding: "12px 14px",
    marginTop: "12px",
    lineHeight: 1.45,
  };
}

function buildReferenceId() {
  return `setup-${Date.now()}`;
}

export default function Setup() {
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderPaymentMethod, setSenderPaymentMethod] = useState("Debit card");

  const [receiverName, setReceiverName] = useState("");
  const [receiverCountry, setReceiverCountry] = useState("Kenya");
  const [selectedPayout, setSelectedPayout] = useState("mobile");

  const [kycState, setKycState] = useState({
    status: "idle", // idle | loading | success | error
    message: "",
    inquiryId: "",
    inquiryStatus: "",
    verificationUrl: "",
    stage: "",
    raw: null,
  });

  const selectedCountryCode = useMemo(() => {
    return (
      COUNTRIES.find((country) => country.label === receiverCountry)?.code || ""
    );
  }, [receiverCountry]);

  const senderNameParts = useMemo(() => splitFullName(senderName), [senderName]);

  function buildKycRequestBody() {
    const fields = {};

    if (senderNameParts.first) {
      fields["name-first"] = senderNameParts.first;
    }

    if (senderNameParts.last) {
      fields["name-last"] = senderNameParts.last;
    }

    if (selectedCountryCode && selectedCountryCode !== "OTHER") {
      fields["selected-country-code"] = selectedCountryCode;
    }

    return {
      transferMode: "production",
      settlementProvider: "xrpl-mainnet",
      provider: "xrpl-mainnet",
      xrplNetwork: "mainnet",
      referenceId: buildReferenceId(),
      note: "KYC launch from Setup page",
      metadata: {
        source: "setup-page",
        senderName: senderName || null,
        senderPhone: senderPhone || null,
        senderPaymentMethod,
        receiverName: receiverName || null,
        receiverCountry,
        receiverCountryCode: selectedCountryCode || null,
        payoutMethod: selectedPayout,
      },
      ...(Object.keys(fields).length > 0 ? { fields } : {}),
    };
  }

  async function startKycCheck() {
    setKycState({
      status: "loading",
      message: "Preparing identity check...",
      inquiryId: "",
      inquiryStatus: "",
      verificationUrl: "",
      stage: "",
      raw: null,
    });

    try {
      const response = await fetch("/api/kyc-start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildKycRequestBody()),
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      const normalized = normalizeKycStartResponse(payload);

      if (!response.ok || !normalized.ok) {
        setKycState({
          status: "error",
          message: normalized.message || `KYC start failed (${response.status}).`,
          inquiryId: normalized.inquiryId,
          inquiryStatus: normalized.inquiryStatus,
          verificationUrl: normalized.verificationUrl,
          stage: normalized.stage,
          raw: normalized.raw,
        });
        return;
      }

      setKycState({
        status: "success",
        message: normalized.message,
        inquiryId: normalized.inquiryId,
        inquiryStatus: normalized.inquiryStatus,
        verificationUrl: normalized.verificationUrl,
        stage: normalized.stage,
        raw: normalized.raw,
      });

      if (normalized.verificationUrl) {
        window.open(normalized.verificationUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setKycState({
        status: "error",
        message:
          error?.message ||
          "Could not reach the KYC service. Try again after deployment finishes.",
        inquiryId: "",
        inquiryStatus: "",
        verificationUrl: "",
        stage: "",
        raw: null,
      });
    }
  }

  return (
    <div className="setup-page">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="setup-hero">
          <div className="setup-heading">
            <p className="home-kicker">
              <span aria-hidden="true">🛡️</span> Start here
            </p>
            <h1>Set up the sender and receiver one step at a time.</h1>
            <p>
              Use this guided form for fewer choices, bigger controls, and simple
              wording that works for first-time users.
            </p>
          </div>

          <div className="setup-helper-panel">
            <div className="setup-helper-icon" aria-hidden="true">
              📝
            </div>
            <h2>What you need</h2>
            <div className="setup-needs-list">
              {NEEDS.map((item) => (
                <span key={item}>✓ {item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="setup-stepper" aria-label="Setup steps">
          {STEPS.map((step, index) => (
            <div className="setup-step-pill" key={step}>
              <strong>{index + 1}</strong>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <div
          className="setup-safety-alert"
          style={{
            border: "1px solid #fde68a",
            background: "#fffbeb",
            color: "#92400e",
            borderRadius: "14px",
            padding: "14px 16px",
          }}
        >
          Live launch note: transfers should remain blocked until KYC is approved,
          sanctions checks pass, and payment methods are correctly configured.
        </div>

        <div
          className="kyc-start-card shadow-premium border-0"
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)",
            borderRadius: "18px",
            padding: "24px",
          }}
        >
          <div className="kyc-start-copy">
            <div className="setup-helper-icon" aria-hidden="true">
              🛡️
            </div>

            <div>
              <h2>Identity check comes before real transfers</h2>
              <p>
                Start here to create a live Persona inquiry. Transfers should remain
                blocked until KYC is approved by the backend.
              </p>

              {kycState.message ? (
                <div style={getKycMessageStyle(kycState.status)}>
                  <div>{kycState.message}</div>

                  {kycState.inquiryId ? (
                    <div style={{ marginTop: "6px", fontWeight: 700 }}>
                      Reference: {kycState.inquiryId}
                    </div>
                  ) : null}

                  {kycState.inquiryStatus ? (
                    <div style={{ marginTop: "4px" }}>
                      Status: {kycState.inquiryStatus}
                    </div>
                  ) : null}

                  {kycState.stage ? (
                    <div style={{ marginTop: "4px", opacity: 0.85 }}>
                      Stage: {kycState.stage}
                    </div>
                  ) : null}

                  {kycState.status === "success" && !kycState.verificationUrl ? (
                    <div style={{ marginTop: "8px" }}>
                      Inquiry created successfully. This response did not include a
                      hosted Persona URL, so the UI cannot open Persona automatically yet.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div
            className="kyc-actions"
            style={{
              marginTop: "16px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={startKycCheck}
              disabled={kycState.status === "loading"}
              className="setup-next-button"
            >
              {kycState.status === "loading" ? "Preparing..." : "Start KYC Check"}
            </button>

            {kycState.verificationUrl ? (
              <a
                href={kycState.verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="kyc-link"
              >
                Open Persona
              </a>
            ) : null}
          </div>
        </div>

        <div className="setup-grid">
          <div className="setup-form-card shadow-premium border-0">
            <div className="setup-title">
              <span className="setup-card-number">1</span>
              <span>Who is sending?</span>
            </div>

            <div className="easy-form">
              <label>
                <span>Sender full name</span>
                <input
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                  placeholder="Example: Maria Johnson"
                />
              </label>

              <label>
                <span>Sender phone number</span>
                <input
                  value={senderPhone}
                  onChange={(event) => setSenderPhone(event.target.value)}
                  placeholder="Example: +1 555 123 4567"
                />
              </label>

              <label>
                <span>How will the sender pay?</span>
                <select
                  value={senderPaymentMethod}
                  onChange={(event) => setSenderPaymentMethod(event.target.value)}
                >
                  <option>Debit card</option>
                  <option>Bank transfer</option>
                  <option>Digital wallet</option>
                </select>
              </label>

              <div className="simple-tip">
                Card or bank details are added later through a secure payment partner.
              </div>
            </div>
          </div>

          <div className="setup-form-card shadow-premium border-0">
            <div className="setup-title">
              <span className="setup-card-number">2</span>
              <span>Who receives?</span>
            </div>

            <div className="easy-form">
              <label>
                <span>Receiver full name</span>
                <input
                  value={receiverName}
                  onChange={(event) => setReceiverName(event.target.value)}
                  placeholder="Example: Daniel Mwangi"
                />
              </label>

              <label>
                <span>Receiver country</span>
                <select
                  value={receiverCountry}
                  onChange={(event) => setReceiverCountry(event.target.value)}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.label} value={country.label}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="field-label">How should they receive the money?</span>
                <p className="field-helper">
                  Choose the option your receiver will understand and can use easily.
                </p>

                <div className="payout-choice-grid">
                  {PAYOUT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedPayout(option.id)}
                      className={`payout-choice ${
                        selectedPayout === option.id ? "is-selected" : ""
                      }`}
                    >
                      <span aria-hidden="true" style={{ fontSize: 22 }}>
                        {option.icon}
                      </span>
                      <strong>{option.label}</strong>
                      <span>{option.helper}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="setup-review-card shadow-premium border-0">
          <div className="p-6">
            <div className="setup-review-copy">
              <span className="setup-card-number">3</span>
              <div>
                <h2>Review before sending</h2>
                <p>
                  Next, choose an amount and see the fee, exchange rate, delivery
                  time, and receiver amount before confirming.
                </p>
              </div>
            </div>

            <Link to="/SendMoney" className="setup-next-button">
              Continue to Transfer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
