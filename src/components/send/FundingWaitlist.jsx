import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, Landmark } from "lucide-react";

// Sent so a waitlist row can be tied to the same browser as its transfer
// records. Not authentication — see api/transfer-records.js.
const DEVICE_KEY = "nexaremit:device-id";

function getDeviceId() {
  try {
    return window.localStorage.getItem(DEVICE_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * Demand capture for bank-account funding.
 *
 * Bank funding needs ACH settlement, which needs a payout partner that can
 * complete the transfer — none of which exists yet. Until it does, the useful
 * thing this step can do is record who wanted it and for how much, rather than
 * turning a sender without a debit card away with nothing.
 */
export default function FundingWaitlist({ transferData }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const quote = transferData?.quote;

  const submit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Enter your email address so we can let you know.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    setError("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-nexa-device-id": getDeviceId()
        },
        body: JSON.stringify({
          email,
          method: "bank",
          sendAmount: transferData?.amount,
          sendCurrency: transferData?.currency,
          receiveCurrency: quote?.receiveCurrency || transferData?.recipient?.receiveCurrency,
          destination: transferData?.recipient
            ? `${transferData.recipient.country} - ${transferData.recipient.method}`
            : ""
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.error || "We could not save your details. Please try again."
        );
      }

      setStatus("done");
    } catch (submitError) {
      setError(submitError.message);
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <AlertDescription className="text-green-800">
          Thanks — we have your email. We will contact you when paying directly
          from a bank account is available. You can still send this transfer
          with a debit card or digital wallet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="border-yellow-200 bg-yellow-50">
        <Landmark className="w-5 h-5 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Paying directly from a bank account is not available yet. Bank
          transfers are cheaper than card payments, and we are working on it —
          leave your email and we will tell you the moment it is ready.
        </AlertDescription>
      </Alert>

      <form onSubmit={submit} className="space-y-3">
        <label htmlFor="waitlist-email" className="block font-semibold text-primary">
          Email address
        </label>

        <input
          id="waitlist-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full p-3 rounded-lg border border-neutral-300 focus:border-blue-700 focus:outline-none"
        />

        {status === "error" && (
          <div className="text-sm text-red-700">{error}</div>
        )}

        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Tell me when it is ready"}
        </Button>

        <p className="text-sm text-neutral-600">
          We will only use this to tell you about bank transfers.
        </p>
      </form>
    </div>
  );
}
