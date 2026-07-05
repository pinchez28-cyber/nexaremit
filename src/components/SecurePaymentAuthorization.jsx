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

function formatMoneyFromCents(cents, currency = "usd") {
  if (!Number.isFinite(Number(cents))) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(Number(cents) / 100);
}

function getPaymentIntentErrorMessage(payload) {
  if (!payload || typeof payload !== "object") {
    return "Unable to create payment intent.";
  }
  if (payload?.safety?.failures?.length) {
    return payload.safety.failures.join(" ");
  }
  return payload.message || payload.error || "Unable to create payment intent.";
}

function FeeBreakdown({ quote, currency = "usd" }) {
  if (!quote) return null;

  const rows = [
    {
      label: "Transfer amount",
      value: formatMoneyFromCents(quote.sendAmountCents, currency),
    },
    {
      label: "Platform fee",
      value: formatMoneyFromCents(quote.platformFeeCents, currency),
      hide: !quote.platformFeeCents,
    },
    {
      label: "FX markup",
      value: formatMoneyFromCents(quote.fxMarkupCents, currency),
      hide: !quote.fxMarkupCents,
    },
    {
      label: "Payout cost",
      value: formatMoneyFromCents(quote.payoutCostCents, currency),
      hide: !quote.payoutCostCents,
    },
    {
      label: "Compliance buffer",
      value: formatMoneyFromCents(quote.complianceBufferCents, currency),
      hide: !quote.complianceBufferCents,
    },
    {
      label: "Stripe processing (estimated)",
      value: formatMoneyFromCents(quote.stripeFeeEstimateCents, currency),
      hide: !quote.stripeFeeEstimateCents,
    },
    {
      label: "Total charged to sender",
      value: formatMoneyFromCents(quote.totalChargeCents, currency),
      strong: true,
    },
    {
      label: "Recipient gets",
      value:
        quote.recipientGetsCents != null
          ? formatMoneyFromCents(quote.recipientGetsCents, currency)
          : null,
      hide: quote.recipientGetsCents == null,
    },
  ].filter((row) => !row.hide);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        background: "#fafafa",
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: 12 }}>Transfer pricing</h4>
      {rows.map((row) => (
        <div
          key={row.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            padding: "8px 0",
            borderBottom:
              row.label === "Total charged to sender"
                ? "1px solid #d1d5db"
                : "1px solid #f1f5f9",
            fontWeight: row.strong ? 700 : 400,
          }}
        >
          <span>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function StripeAuthorizationForm({ onAuthorized }) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!stripe || !elements) return;

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
  }

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
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#991b1b",
          }}
        >
          {errorText}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || submitting}
        style={{
          width: "100%",
          height: 44,
          border: "none",
          borderRadius: 8,
          background: "#0f766e",
          color: "#fff",
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
  const [quote, setQuote] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorText, setErrorText] = useState("");

  const currency = transferData?.currency || "usd";

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
      if (!stripePromise) {
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
          setQuote(payload.quote || null);
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

  if (!stripePromise) {
    return (
      <div
        style={{
          padding: 12,
          borderRadius: 8,
          border: "1px solid #fde68a",
          background: "#fffbeb",
          color: "#92400e",
        }}
      >
        Stripe is not configured for this deployment. Add{" "}
        <strong>VITE_STRIPE_PUBLISHABLE_KEY</strong> to enable the secure
        payment form.
      </div>
    );
  }

  if (status === "loading") {
    return <div>Preparing secure payment form...</div>;
  }

  if (status === "error") {
    return (
      <div
        style={{
          padding: 12,
          borderRadius: 8,
          border: "1px solid #fecaca",
          background: "#fef2f2",
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
        style={{
          padding: 24,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#ffffff",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Secure payment authorization</h3>
          <p style={{ margin: "6px 0 0 0", color: "#525252" }}>
            Complete card authorization to fund this transfer.
          </p>
        </div>

        <FeeBreakdown quote={quote} currency={currency} />

        <Elements stripe={stripePromise} options={elementsOptions}>
          <StripeAuthorizationForm onAuthorized={onAuthorized} />
        </Elements>
      </div>
    </div>
  );
}
