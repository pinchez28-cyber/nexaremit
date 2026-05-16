import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Landmark, Wallet } from "lucide-react";

const methods = [
  { id: "card", label: "Debit Card", icon: CreditCard },
  { id: "bank", label: "Bank Account", icon: Landmark },
  { id: "wallet", label: "Digital Wallet", icon: Wallet }
];

export default function PaymentMethod({ selectedMethod, onSelectMethod, onBack }) {
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
            onClick={() => onSelectMethod(id)}
            className={`p-5 rounded-lg border text-center transition-premium ${selectedMethod === id ? "border-blue-700 bg-blue-50" : "border-neutral-200 hover:border-blue-300"}`}
          >
            <Icon className="w-7 h-7 mx-auto mb-3 text-blue-700" />
            <span className="font-semibold text-primary">{label}</span>
          </button>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack}>Back</Button>
      </CardFooter>
    </Card>
  );
}
