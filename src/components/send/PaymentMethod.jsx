import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Landmark, Wallet } from "lucide-react";
import StripePaymentPanel from "./StripePaymentPanel";

const methods = [
  { id: "card", label: "Debit Card", icon: CreditCard },
  { id: "bank", label: "Bank Account", icon: Landmark },
  { id: "wallet", label: "Digital Wallet", icon: Wallet }
];

export default function PaymentMethod({ selectedMethod, transferData, onSelectMethod, onBack }) {
  const [localMethod, setLocalMethod] = useState(selectedMethod || "card");

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-3 gap-4">
        {methods.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setLocalMethod(id)}
            className={`p-5 rounded-lg border text-center transition-premium ${localMethod === id ? "border-blue-700 bg-blue-50" : "border-neutral-200 hover:border-blue-300"}`}
          >
            <Icon className="w-7 h-7 mx-auto mb-3 text-blue-700" />
            <span className="font-semibold text-primary">{label}</span>
          </button>
        ))}
      </CardContent>
      <CardContent className="pt-3">
        {localMethod === "card" && (
          <StripePaymentPanel transferData={transferData} onAuthorized={(paymentIntentId) => onSelectMethod({ type: "card", paymentIntentId })} />
        )}
        {localMethod === "bank" && (
          <div className="simple-tip">
            <Landmark className="w-5 h-5" />
            Bank-account testing should use Plaid Sandbox or Stripe Financial Connections test mode. Do not enter real bank details yet.
          </div>
        )}
        {localMethod === "wallet" && (
          <div className="simple-tip">
            <Wallet className="w-5 h-5" />
            Wallet funding is prepared as an integration slot and remains mocked until a licensed wallet provider is connected.
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        {localMethod !== "card" && (
          <Button onClick={() => onSelectMethod({ type: localMethod, status: "sandbox_selected" })}>Continue</Button>
        )}
      </CardFooter>
    </Card>
  );
}
