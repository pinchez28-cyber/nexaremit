import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CreditCard, Landmark, Wallet } from "lucide-react";
import StripePaymentPanel from "./StripePaymentPanel";
import FundingWaitlist from "./FundingWaitlist";

// "fundable" is whether this method can actually pay for a transfer today.
// Bank is selectable but not fundable: choosing it collects demand instead of
// money, so a sender with no debit card leaves a signal rather than just
// leaving. See FundingWaitlist.jsx.
const methods = [
  { id: "card", label: "Debit Card", icon: CreditCard, fundable: true },
  { id: "bank", label: "Bank Account", icon: Landmark, fundable: false },
  // Wallets run on the same Stripe card rails as the debit-card flow, so they
  // need no additional licensing or provider integration.
  { id: "wallet", label: "Digital Wallet", icon: Wallet, fundable: true }
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
            Debit card and digital wallets (Apple Pay, Google Pay, Link) are active funding flows for this transfer. Bank transfers are not available yet — choose Bank Account to be told when they are.
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardContent className="grid sm:grid-cols-3 gap-4">
        {methods.map(({ id, label, icon: Icon, fundable }) => (
          <button
            key={id}
            type="button"
            onClick={() => setLocalMethod(id)}
            className={`p-5 rounded-lg border text-center transition-premium ${
              localMethod === id
                ? "border-blue-700 bg-blue-50"
                : "border-neutral-200 hover:border-blue-300"
            }`}
          >
            <Icon className="w-7 h-7 mx-auto mb-3 text-blue-700" />
            <span className="font-semibold text-primary">{label}</span>
            {!fundable && (
              <div className="text-xs text-neutral-500 mt-2">Not available yet</div>
            )}
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

        {localMethod === "bank" && <FundingWaitlist transferData={transferData} />}

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
