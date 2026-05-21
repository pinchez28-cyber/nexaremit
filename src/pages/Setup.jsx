import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";
import { ArrowRight, CheckCircle, CreditCard, ExternalLink, FileCheck, Home, Landmark, Loader2, Phone, ShieldCheck, Smartphone, UserRound } from "lucide-react";

const payoutOptions = [
  { id: "bank", label: "Bank account", icon: Landmark, helper: "Best for receivers who use a bank." },
  { id: "mobile", label: "Mobile money", icon: Smartphone, helper: "Good for quick phone-based payouts." },
  { id: "cash", label: "Cash pickup", icon: Home, helper: "Useful when the receiver does not use banking apps." }
];

const setupSteps = [
  "Sender",
  "Receiver",
  "Review"
];

const setupNeeds = [
  "Sender name and phone number",
  "Receiver name and country",
  "How the receiver wants to collect money"
];

export default function Setup() {
  const [payoutMethod, setPayoutMethod] = useState("mobile");
  const [kycState, setKycState] = useState({ status: "idle", message: "" });

  const startKyc = async () => {
    setKycState({ status: "loading", message: "Preparing identity check..." });

    try {
      const response = await fetch("/api/kyc-start", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setKycState({
          status: "error",
          message: data?.kyc?.error || "KYC provider is not ready yet."
        });
        return;
      }

      setKycState({
        status: data?.kyc?.verificationUrl ? "ready" : "sandbox",
        message: data?.kyc?.message || "Identity check prepared.",
        verificationUrl: data?.kyc?.verificationUrl,
        inquiryId: data?.kyc?.inquiryId
      });
    } catch {
      setKycState({
        status: "error",
        message: "Could not reach the KYC service. Try again after deployment finishes."
      });
    }
  };

  return (
    <div className="setup-page">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="setup-hero">
          <div className="setup-heading">
            <p className="home-kicker"><ShieldCheck className="w-5 h-5" /> Start here</p>
            <h1>Set up the sender and receiver one step at a time.</h1>
            <p>Use this guided form for fewer choices, bigger controls, and simple wording that works for first-time users.</p>
          </div>
          <div className="setup-helper-panel">
            <div className="setup-helper-icon">
              <FileCheck className="w-7 h-7" />
            </div>
            <h2>What you need</h2>
            <div className="setup-needs-list">
              {setupNeeds.map((item) => (
                <span key={item}><CheckCircle className="w-5 h-5" /> {item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="setup-stepper" aria-label="Setup steps">
          {setupSteps.map((step, index) => (
            <div key={step} className="setup-step-pill">
              <strong>{index + 1}</strong>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <Alert className="setup-safety-alert border-yellow-200 bg-yellow-50">
          <ShieldCheck className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Prototype mode: use test details only. A live service must verify identity, validate accounts, and check sanctions lists before real transfers.
          </AlertDescription>
        </Alert>

        <Card className="kyc-start-card shadow-premium border-0">
          <CardContent className="p-6">
            <div className="kyc-start-copy">
              <div className="setup-helper-icon">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h2>Identity check comes before real transfers</h2>
                <p>
                  Start here when Persona sandbox credentials are added. NexaRemit will keep transfers blocked until KYC is approved by the backend.
                </p>
                {kycState.message && (
                  <div className={`kyc-message ${kycState.status === "error" ? "is-error" : ""}`}>
                    {kycState.message}
                    {kycState.inquiryId && <span>Reference: {kycState.inquiryId}</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="kyc-actions">
              <Button type="button" onClick={startKyc} disabled={kycState.status === "loading"} className="setup-next-button">
                {kycState.status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Start KYC Check
              </Button>
              {kycState.verificationUrl && (
                <a href={kycState.verificationUrl} target="_blank" rel="noreferrer" className="kyc-link">
                  Open Persona
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="setup-grid">
          <Card className="setup-form-card shadow-premium border-0">
            <CardHeader>
              <CardTitle className="setup-title">
                <span className="setup-card-number">1</span>
                <UserRound className="w-6 h-6" />
                Who is sending?
              </CardTitle>
            </CardHeader>
            <CardContent className="easy-form">
              <label>
                <span>Sender full name</span>
                <input placeholder="Example: Maria Johnson" />
              </label>
              <label>
                <span>Sender phone number</span>
                <input placeholder="Example: +1 555 123 4567" />
              </label>
              <label>
                <span>How will the sender pay?</span>
                <select>
                  <option>Debit card</option>
                  <option>Bank transfer</option>
                  <option>Digital wallet</option>
                </select>
              </label>
              <div className="simple-tip">
                <CreditCard className="w-5 h-5" />
                Card or bank details are added later through a secure payment partner.
              </div>
            </CardContent>
          </Card>

          <Card className="setup-form-card shadow-premium border-0">
            <CardHeader>
              <CardTitle className="setup-title">
                <span className="setup-card-number">2</span>
                <Phone className="w-6 h-6" />
                Who receives?
              </CardTitle>
            </CardHeader>
            <CardContent className="easy-form">
              <label>
                <span>Receiver full name</span>
                <input placeholder="Example: Daniel Mwangi" />
              </label>
              <label>
                <span>Receiver country</span>
                <select>
                  <option>Kenya</option>
                  <option>Nigeria</option>
                  <option>Ghana</option>
                  <option>India</option>
                  <option>Philippines</option>
                  <option>Mexico</option>
                  <option>Brazil</option>
                  <option>Pakistan</option>
                  <option>Bangladesh</option>
                  <option>South Africa</option>
                  <option>Egypt</option>
                  <option>Morocco</option>
                  <option>Other supported country</option>
                </select>
              </label>
              <div>
                <span className="field-label">How should they receive the money?</span>
                <p className="field-helper">Choose the option your receiver will understand and can use easily.</p>
                <div className="payout-choice-grid">
                  {payoutOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPayoutMethod(option.id)}
                        className={`payout-choice ${payoutMethod === option.id ? "is-selected" : ""}`}
                      >
                        <Icon className="w-6 h-6" />
                        <strong>{option.label}</strong>
                        <span>{option.helper}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="setup-review-card shadow-premium border-0">
          <CardContent className="p-6">
            <div className="setup-review-copy">
              <span className="setup-card-number">3</span>
              <div>
                <h2>Review before sending</h2>
                <p>Next, choose an amount and see the fee, exchange rate, delivery time, and receiver amount before confirming.</p>
              </div>
            </div>
            <Link to={createPageUrl("SendMoney")}>
              <Button className="setup-next-button">
                Continue to Transfer
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
