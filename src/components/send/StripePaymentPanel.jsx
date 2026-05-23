import React, { useEffect, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isStripeConfigured, stripePromise } from "@/lib/stripe";
import { AlertTriangle, CreditCard, RefreshCw, ShieldCheck } from "lucide-react";

const sandboxCards = [
  {
    id: "visa",
    brand: "Visa",
    number: "4242 4242 4242 4242",
    note: "Standard successful test card"
  },
  {
    id: "mastercard",
    brand: "Mastercard",
    number: "5555 5555 5555 4444",
    note: "Alternate successful test card"
  }
];

function CheckoutForm({
  onAuthorized,
  onChangeCard,
  showTestCards,
  onAuthorizeTestCard,
  manualStatus,
  manualMessage
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const isManualLoading = manualStatus === "loading";

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
      <div className="stripe-card-tools">
        <button type="button" onClick={onChangeCard} aria-expanded={showTestCards}>
          <RefreshCw className="w-4 h-4" />
          {showTestCards ? "Hide test card choices" : "Change or add test card"}
        </button>
        <span>Pick a sandbox card below, or use Stripe Link's saved test card.</span>
      </div>

      {showTestCards && (
        <div className="grid gap-3 md:grid-cols-2">
          {sandboxCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => onAuthorizeTestCard(card.id)}
              disabled={isManualLoading}
              className="rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-teal-500 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="mb-2 flex items-center gap-2 font-semibold text-primary">
                <CreditCard className="h-4 w-4 text-teal-700" />
                Use {card.brand} test card
              </span>
              <span className="block text-sm font-medium text-neutral-700">{card.number}</span>
              <span className="block text-xs text-neutral-500">{card.note}</span>
            </button>
          ))}
        </div>
      )}

      {manualMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800">{manualMessage}</AlertDescription>
        </Alert>
      )}

      <PaymentElement />
      {message && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800">{message}</AlertDescription>
        </Alert>
      )}
      <Button className="w-full" disabled={!stripe || isSubmitting || isManualLoading}>
        {isSubmitting ? "Authorizing..." : "Authorize Test Payment"}
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
  const [intentRefreshKey, setIntentRefreshKey] = useState(0);
  const [showTestCards, setShowTestCards] = useState(false);
  const [manualStatus, setManualStatus] = useState("idle");
  const [manualMessage, setManualMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function createIntent() {
      if (!isStripeConfigured) return;
      setStatus("loading");
      setError("");
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transferData)
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(getPaymentIntentError(payload));
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
  }, [transferData, intentRefreshKey]);

  const handleChangeCard = () => {
    setManualMessage("");
    setShowTestCards((isVisible) => !isVisible);
  };

  const authorizeTestCard = async (testCard) => {
    setManualStatus("loading");
    setManualMessage("");
    try {
      const response = await fetch("/api/authorize-test-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...transferData, testCard })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(getPaymentIntentError(payload));
      onAuthorized(payload.paymentIntentId || `stripe_${testCard}_authorized`);
    } catch (nextError) {
      setManualMessage(nextError.message || "Could not authorize the selected test card.");
    } finally {
      setManualStatus("idle");
    }
  };

  if (!isStripeConfigured) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <CreditCard className="w-5 h-5 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Stripe test payments are ready in code. Add <strong>VITE_STRIPE_PUBLISHABLE_KEY</strong> in Vercel to show the Payment Element.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "loading") {
    return <div className="payment-loading">Preparing secure Stripe test payment...</div>;
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
            <h3>Secure test payment</h3>
            <p>Use Stripe test card numbers only. Do not enter real card or bank details.</p>
          </div>
        </div>
        <Elements stripe={stripePromise} options={{ clientSecret }} key={`${clientSecret}-${intentRefreshKey}`}>
          <CheckoutForm
            onAuthorized={onAuthorized}
            onChangeCard={handleChangeCard}
            showTestCards={showTestCards}
            onAuthorizeTestCard={authorizeTestCard}
            manualStatus={manualStatus}
            manualMessage={manualMessage}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}
