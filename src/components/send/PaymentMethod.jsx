import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CreditCard, Landmark, Wallet } from "lucide-react";
import StripePaymentPanel from "./StripePaymentPanel";

const methods = [
  { id: "card", label: "Debit Card", icon: CreditCard, enabled: true },
  { id: "bank", label: "Bank Account", icon: Landmark, enabled: false },
  // Wallets run on the same Stripe card rails as the debit-card flow, so they
  // need no additional licensing or provider integration.
  { id: "wallet", label: "Digital Wallet", icon: Wallet, enabled: true }
];

export default function PaymentMethod({ selectedMethod, transferData, onSelectMethod, onBack }) {
  const [localMethod, setLocalMethod] = useState(selectedMethod || null);

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle>Choose Payment Method</CardTitle>
      </CardHeader>

      <CardContent className="pt-3">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="w-5 h-5 text-blue-700" />
          <AlertDescription className="text-blue-800">
            Debit card and digital wallets (Apple Pay, Google Pay, Link) are active funding flows for this transfer. Bank account remains unavailable until its live integration is completed.
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardContent className="grid sm:grid-cols-3 gap-4">
        {methods.map(({ id, label, icon: Icon, enabled }) => (
          <button
            key={id}
            type="button"
            disabled={!enabled}
            onClick={() => enabled && setLocalMethod(id)}
            className={`p-5 rounded-lg border text-center transition-premium ${
              localMethod === id
                ? "border-blue-700 bg-blue-50"
                : enabled
                  ? "border-neutral-200 hover:border-blue-300"
                  : "border-neutral-200 opacity-50 cursor-not-allowed"
            }`}
          >
            <Icon className="w-7 h-7 mx-auto mb-3 text-blue-700" />
            <span className="font-semibold text-primary">{label}</span>
            {!enabled && <div className="text-xs text-neutral-500 mt-2">Coming soon</div>}
          </button>
        ))}
      </CardContent>

      <CardContent className="pt-3">
        {!localMethod && (
          <div className="payment-choice-empty">
            Select Debit Card to continue with the active transfer funding flow.
          </div>
        )}

        {localMethod === "card" && (
          <StripePaymentPanel
            transferData={transferData}
            onAuthorized={(paymentIntentId) =>
              onSelectMethod({ type: "card", provider: "stripe", paymentIntentId })
            }
          />
        )}

        {localMethod === "bank" && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Landmark className="w-5 h-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Bank-account funding is not live yet for this flow. Please use Debit Card.
            </AlertDescription>
          </Alert>
        )}

        {localMethod === "wallet" && (
          <>
            <Alert className="border-blue-200 bg-blue-50">
              <Wallet className="w-5 h-5 text-blue-700" />
              <AlertDescription className="text-blue-800">
                Apple Pay, Google Pay and Link appear below when your device and browser support them. If no wallet is available, you can still pay by card here.
              </AlertDescription>
            </Alert>

            <StripePaymentPanel
              transferData={transferData}
              onAuthorized={(paymentIntentId) =>
                onSelectMethod({ type: "wallet", provider: "stripe", paymentIntentId })
              }
            />
          </>
        )}
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
      </CardFooter>
    </Card>
  );
}
