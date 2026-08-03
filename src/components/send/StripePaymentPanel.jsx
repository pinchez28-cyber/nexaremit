import React, { useEffect, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isStripeConfigured, stripePromise } from "@/lib/stripe";
import { AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";

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

export default function StripePaymentPanel({ transferData, onAuthorized }) {
  const [clientSecret, setClientSecret] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  // The API expects the SEND amount in minor units (cents) and adds platform,
  // FX and processing fees on top. Sending major units here would undercharge
  // by 100x, so the conversion is explicit rather than passing transferData raw.
  const sendAmountMajor = Number(
    transferData?.quote?.amount ?? transferData?.amount ?? 0
  );
  const amountMinor = Math.round(sendAmountMajor * 100);
  const currency = String(transferData?.currency || "usd").toLowerCase();
  const transferId = transferData?.transferId || "";
  const recipientCurrency = String(
    transferData?.quote?.receiveCurrency || currency
  ).toLowerCase();
  const recipientAmountMinor = Math.round(
    Number(transferData?.quote?.receivedAmount || 0) * 100
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

      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountMinor,
            currency,
            transferId,
            referenceId: transferId,
            recipientCurrency,
            recipientAmountMinor:
              recipientAmountMinor > 0 ? recipientAmountMinor : undefined
          })
        });

        const payload = await response.json();

        if (!response.ok) {
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

    createIntent();

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
    recipientAmountMinor
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
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
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
