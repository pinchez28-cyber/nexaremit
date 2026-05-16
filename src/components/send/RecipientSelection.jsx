import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Smartphone, Wallet } from "lucide-react";

const recipients = [
  { id: 1, name: "Amara Okafor", country: "Nigeria", method: "Bank transfer", receiveCurrency: "NGN", deliveryEstimate: "Same day", limit: 2500, risk: "Verified", icon: Building2 },
  { id: 2, name: "Daniel Mwangi", country: "Kenya", method: "Mobile money", receiveCurrency: "KES", deliveryEstimate: "Under 30 minutes", limit: 1500, risk: "Verified", icon: Smartphone },
  { id: 3, name: "Efua Mensah", country: "Ghana", method: "Wallet payout", receiveCurrency: "GHS", deliveryEstimate: "Within 2 hours", limit: 1800, risk: "Review required", icon: Wallet }
];

export default function RecipientSelection({ selectedRecipient, onSelectRecipient }) {
  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle>Choose Recipient</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recipients.map((recipient) => {
          const Icon = recipient.icon;
          return (
            <button
              key={recipient.id}
              type="button"
              onClick={() => onSelectRecipient(recipient)}
              className={`recipient-tile ${selectedRecipient?.id === recipient.id ? "border-blue-700 bg-blue-50" : "border-neutral-200 hover:border-blue-300"}`}
            >
              <div className="recipient-icon">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center gap-3">
                  <p className="font-semibold text-primary">{recipient.name}</p>
                  <Badge className={recipient.risk === "Verified" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>{recipient.risk}</Badge>
                </div>
                <p className="text-sm text-neutral-600">{recipient.country} - {recipient.method}</p>
                <p className="text-xs text-neutral-500">Receives {recipient.receiveCurrency} - limit {recipient.limit.toLocaleString()} per transfer</p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
