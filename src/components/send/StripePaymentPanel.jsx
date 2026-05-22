import React, { useEffect, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isStripeConfigured, stripePromise } from "@/lib/stripe";
import { AlertTriangle, CreditCard, RefreshCw, ShieldCheck } from "lucide-react";

function CheckoutForm({ onAuthorized, onChangeCard }) {
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
      <div className="stripe-card-tools">
        <button type="button" onClick={onChangeCard}>
          <RefreshCw className="w-4 h-4" />
          Change or add test card
        </button>
        <span>Use 4242 4242 4242 4242 for a successful Stripe test card.</span>
      </div>
      <PaymentElement />
      {message && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800">{message}</AlertDescription>
        </Alert>
      )}
      <Button className="w-full" disabled={!stripe || isSubmitting}>
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
    setClientSecret("");
    setIntentRefreshKey((key) => key + 1);
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
        <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
          <CheckoutForm onAuthorized={onAuthorized} onChangeCard={handleChangeCard} />
        </Elements>
      </CardContent>
    </Card>
  );
}
