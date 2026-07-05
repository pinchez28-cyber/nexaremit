import React, { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const STRIPE_PUBLISHABLE_KEY = (
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
).trim();

const stripePromise =
  /^pk_(test|live)_/i.test(STRIPE_PUBLISHABLE_KEY)
    ? loadStripe(STRIPE_PUBLISHABLE_KEY)
    : null;

const isStripeConfigured = Boolean(stripePromise);
const isProdWithTestKey =
  import.meta.env.PROD && /^pk_test_/i.test(STRIPE_PUBLISHABLE_KEY);

function getPaymentIntentErrorMessage(payload) {
  if (!payload || typeof payload !== "object") {
    return "Unable to create payment intent.";
  }

  if (payload?.safety?.failures?.length) {
    return payload.safety.failures.join(" ");
  }

  return (
    payload.message ||
    payload.error ||
    "Unable to create payment intent."
  );
}

function StripeAuthorizationForm({ onAuthorized }) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setErrorText("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorText(error.message || "Payment authorization failed.");
      setSubmitting(false);
      return;
    }

    onAuthorized?.(paymentIntent?.id || "stripe_authorized");
    setSubmitting(false);
  };

  return (
    <form className="stripe-checkout-form" onSubmit={handleSubmit}>
      <div style={{ marginBottom: 16 }}>
        <PaymentElement />
      </div>

      <p className="text-sm text-neutral-600" style={{ marginBottom: 16 }}>
        Enter the card details required for the current environment and submit
        to authorize the transfer funding step.
      </p>

      {errorText ? (
        <div
          className="border-red-200 bg-red-50"
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #fecaca",
            color: "#991b1b",
          }}
        >
          {errorText}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full"
        style={{
          width: "100%",
          height: 44,
          border: "none",
          borderRadius: 8,
          background: "#0f766e",
          color: "#ffffff",
          fontWeight: 600,
          cursor: !stripe || submitting ? "not-allowed" : "pointer",
          opacity: !stripe || submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Authorizing..." : "Authorize Payment"}
      </button>
    </form>
  );
}

export default function SecurePaymentAuthorization({
  transferData,
  onAuthorized,
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorText, setErrorText] = useState("");

  const elementsOptions = useMemo(() => {
    if (!clientSecret) return null;

    return {
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#0f766e",
          borderRadius: "8px",
        },
      },
    };
  }, [clientSecret]);

  useEffect(() => {
    let active = true;

    async function createPaymentIntent() {
      if (!isStripeConfigured || isProdWithTestKey) {
        return;
      }

      setStatus("loading");
      setErrorText("");

      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transferData),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(getPaymentIntentErrorMessage(payload));
        }

        if (!payload?.clientSecret) {
          throw new Error("Missing clientSecret in payment intent response.");
        }

        if (active) {
          setClientSecret(payload.clientSecret);
          setStatus("ready");
        }
      } catch (error) {
        if (active) {
          setErrorText(
            error?.message || "Unable to prepare secure payment form."
          );
          setStatus("error");
        }
      }
    }

    createPaymentIntent();

    return () => {
      active = false;
    };
  }, [transferData]);

  if (!isStripeConfigured) {
    return (
      <div
        className="border-yellow-200 bg-yellow-50"
        style={{
          padding: 12,
          borderRadius: 8,
          border: "1px solid #fde68a",
          color: "#92400e",
        }}
      >
        Stripe is not configured for this deployment. Add{" "}
        <strong>VITE_STRIPE_PUBLISHABLE_KEY</strong> to enable the secure
        payment form.
      </div>
    );
  }

  if (isProdWithTestKey) {
    return (
      <div
        className="border-red-200 bg-red-50"
        style={{
          padding: 12,
          borderRadius: 8,
          border: "1px solid #fecaca",
          color: "#991b1b",
        }}
      >
        Production is using a <strong>test Stripe publishable key</strong>.
        Replace <strong>VITE_STRIPE_PUBLISHABLE_KEY</strong> with a live{" "}
        <strong>pk_live_...</strong> key and redeploy.
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="payment-loading">
        Preparing secure payment form...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="border-red-200 bg-red-50"
        style={{
          padding: 12,
          borderRadius: 8,
          border: "1px solid #fecaca",
          color: "#991b1b",
        }}
      >
        {errorText}
      </div>
    );
  }

  if (!clientSecret || !elementsOptions) {
    return null;
  }

  return (
    <div className="stripe-payment-card">
      <div
        className="p-6"
        style={{
          padding: 24,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#ffffff",
        }}
      >
        <div className="stripe-payment-head" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Secure payment authorization</h3>
          <p style={{ margin: "6px 0 0 0", color: "#525252" }}>
            Complete card authorization to fund this transfer.
          </p>
        </div>

        <Elements stripe={stripePromise} options={elementsOptions}>
          <StripeAuthorizationForm onAuthorized={onAuthorized} />
        </Elements>
      </div>
    </div>
  );
}
