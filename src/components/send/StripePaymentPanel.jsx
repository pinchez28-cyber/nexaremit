import React, { useEffect, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isStripeConfigured, stripePromise } from "@/lib/stripe";
import { AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";
import { minorUnitsPerMajor } from "@/lib/money";
import { useAuth } from "@/lib/AuthContext";

function CheckoutForm({ onAuthorized }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setMessage("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required"
    });

    if (error) {
      setMessage(error.message || "Payment authorization failed.");
    } else {
      onAuthorized(paymentIntent?.id || "stripe_authorized");
    }

    setIsSubmitting(false);
  };

  return (
    <form className="stripe-checkout-form" onSubmit={handleSubmit}>
      <PaymentElement />
      <p className="text-sm text-neutral-600">
        Enter the card details required for the current environment and submit to authorize the transfer funding step.
      </p>

      {message && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800">{message}</AlertDescription>
        </Alert>
      )}

      <Button className="w-full" disabled={!stripe || isSubmitting}>
        {isSubmitting ? "Authorizing..." : "Authorize Payment"}
      </Button>
    </form>
  );
}

function getPaymentIntentError(payload) {
  if (payload?.safety?.failures?.length) return payload.safety.failures.join(" ");
  return payload?.message || payload?.error || "Unable to create payment intent.";
}

// Persona inquiry persisted by the Setup page after identity verification.
const KYC_STORAGE_KEY = "nexaremit:persona:return";

function readKycInquiryId() {
  try {
    const raw = localStorage.getItem(KYC_STORAGE_KEY);
    if (!raw) return "";
    return String(JSON.parse(raw)?.inquiryId || "").trim();
  } catch {
    return "";
  }
}

// Server-side gate outcomes that the sender can resolve by verifying.
const KYC_ERROR_CODES = new Set([
  "kyc_required",
  "kyc_incomplete",
  "kyc_declined",
  "kyc_inquiry_not_found",
  "kyc_unverifiable",
  "kyc_provider_error",
  "kyc_provider_unreachable"
]);

export default function StripePaymentPanel({ transferData, onAuthorized }) {
  const { getAccessToken, isAuthenticated } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [needsKyc, setNeedsKyc] = useState(false);

  // P1-3: the API expects the SEND amount in MINOR units of the send currency.
  // transferData.quote.amount is in MAJOR units (what the sender types in).
  // Hard-coding /100 was wrong for JPY (no minor unit) and 3-decimal
  // currencies; minorUnitsPerMajor() carries the ISO 4217 exponent.
  const sendAmountMajor = Number(
    transferData?.quote?.amount ?? transferData?.amount ?? 0
  );
  const currency = String(transferData?.currency || "usd").toLowerCase();
  const amountMinor = Math.round(
    sendAmountMajor * minorUnitsPerMajor(currency)
  );
  const transferId = transferData?.transferId || "";
  const recipientCurrency = String(
    transferData?.quote?.receiveCurrency || currency
  ).toLowerCase();
  // The recipient amount from the local quote is in the RECIPIENT currency's
  // major units (e.g. NGN 2,575,000). Convert it to that currency's minor
  // units (kobo) with the ISO 4217 exponent so a BHD or JPY receive currency
  // is handled correctly, not with a hard-coded /100.
  const receivedAmountMajor = Number(
    transferData?.quote?.receivedAmount ||
    transferData?.quote?.receivedAmountMajor ||
    0
  );
  const recipientAmountMinor = Math.round(
    receivedAmountMajor * minorUnitsPerMajor(recipientCurrency)
  );

  useEffect(() => {
    let isMounted = true;

    async function createIntent() {
      if (!isStripeConfigured) return;

      if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
        setStatus("error");
        setError(
          "No transfer amount is set yet. Go back and enter an amount before authorizing payment."
        );
        return;
      }

      setStatus("loading");
      setError("");
      setNeedsKyc(false);

      try {
        // P0-1: the money path now authenticates FIRST. The bearer token from
        // the Supabase session is required; the server refuses unauthenticated
        // callers before it ever touches KYC or Stripe.
        const token = await getAccessToken();
        if (!token) {
          if (isMounted) {
            setStatus("error");
            setError(
              "You must be signed in before authorizing a payment. Return to the dashboard and sign in."
            );
          }
          return;
        }

        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // Send the major-unit amount explicitly: the server converts it
            // with the currency's ISO 4217 exponent. amountMinor is still
            // emitted for backward compatibility.
            amountMajor: sendAmountMajor,
            amountMinor: amountMinor,
            currency,
            transferId,
            referenceId: transferId,
            recipientCurrency,
            recipientAmountMinor:
              recipientAmountMinor > 0 ? recipientAmountMinor : undefined,
            // Identity check reference. The server verifies this against
            // Persona — it is not trusted as proof on its own.
            kycInquiryId: readKycInquiryId() || undefined
          })
        });

        const payload = await response.json();

        if (response.status === 401) {
          if (isMounted) {
            setStatus("error");
            setError(
              payload?.message ||
                "Your session has expired. Sign in again and retry the authorization."
            );
          }
          return;
        }

        if (!response.ok) {
          if (isMounted && KYC_ERROR_CODES.has(payload?.error)) {
            setNeedsKyc(true);
          }
          throw new Error(getPaymentIntentError(payload));
        }

        if (isMounted) {
          setClientSecret(payload.clientSecret);
          setStatus("ready");
        }
      } catch (nextError) {
        if (isMounted) {
          setError(nextError.message);
          setStatus("error");
        }
      }
    }

    if (isAuthenticated) createIntent();

    return () => {
      isMounted = false;
    };
    // Depend on primitives, not the transferData object: a new object identity
    // on every render would re-create the PaymentIntent in a loop.
  }, [
    amountMinor,
    currency,
    transferId,
    recipientCurrency,
    recipientAmountMinor,
    sendAmountMajor,
    isAuthenticated
  ]);

  if (!isStripeConfigured) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <CreditCard className="w-5 h-5 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Stripe is not configured for this deployment. Add <strong>VITE_STRIPE_PUBLISHABLE_KEY</strong> to enable the secure payment form.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "loading") {
    return <div className="payment-loading">Preparing secure payment form...</div>;
  }

  if (status === "error") {
    return (
      <Alert className={needsKyc ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"}>
        {needsKyc ? (
          <ShieldCheck className="w-5 h-5 text-yellow-600" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-red-600" />
        )}
        <AlertDescription className={needsKyc ? "text-yellow-800" : "text-red-800"}>
          {error}
          {needsKyc && (
            <>
              {" "}
              <a
                href="/Setup"
                style={{ fontWeight: 600, textDecoration: "underline" }}
              >
                Complete identity verification
              </a>
              , then come back to this step.
            </>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) return null;

  return (
    <Card className="stripe-payment-card">
      <CardContent className="p-6">
        <div className="stripe-payment-head">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <div>
            <h3>Secure payment authorization</h3>
            <p>Complete card authorization to fund this transfer.</p>
          </div>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
          <CheckoutForm onAuthorized={onAuthorized} />
        </Elements>
      </CardContent>
    </Card>
  );
}
