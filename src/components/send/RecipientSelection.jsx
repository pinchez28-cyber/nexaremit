import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Smartphone, Wallet } from "lucide-react";

const recipients = [
  { id: 1, name: "Amara Okafor", country: "Nigeria", method: "Bank transfer", receiveCurrency: "NGN", corridor: "US-NG", deliveryEstimate: "Same day", limit: 2500, risk: "Verified", icon: Building2 },
  { id: 2, name: "Daniel Mwangi", country: "Kenya", method: "Mobile money", receiveCurrency: "KES", corridor: "US-KE", deliveryEstimate: "Under 30 minutes", limit: 1500, risk: "Verified", icon: Smartphone },
  { id: 3, name: "Efua Mensah", country: "Ghana", method: "Wallet payout", receiveCurrency: "GHS", corridor: "US-GH", deliveryEstimate: "Within 2 hours", limit: 1800, risk: "Review required", icon: Wallet },
  { id: 4, name: "Priya Sharma", country: "India", method: "Bank transfer", receiveCurrency: "INR", corridor: "GB-IN", deliveryEstimate: "Same day", limit: 3000, risk: "Verified", icon: Building2 },
  { id: 5, name: "Maria Santos", country: "Philippines", method: "Mobile wallet", receiveCurrency: "PHP", corridor: "US-PH", deliveryEstimate: "Under 1 hour", limit: 2000, risk: "Verified", icon: Smartphone },
  { id: 6, name: "Carlos Rivera", country: "Mexico", method: "Bank transfer", receiveCurrency: "MXN", corridor: "US-MX", deliveryEstimate: "Same day", limit: 2500, risk: "Verified", icon: Building2 },
  { id: 7, name: "Ana Oliveira", country: "Brazil", method: "PIX payout", receiveCurrency: "BRL", corridor: "EU-BR", deliveryEstimate: "Under 2 hours", limit: 2200, risk: "Verified", icon: Wallet },
  { id: 8, name: "Ahmed Khan", country: "Pakistan", method: "Bank transfer", receiveCurrency: "PKR", corridor: "GB-PK", deliveryEstimate: "Within 1 business day", limit: 1800, risk: "Review required", icon: Building2 },
  { id: 9, name: "Nusrat Rahman", country: "Bangladesh", method: "Mobile money", receiveCurrency: "BDT", corridor: "SG-BD", deliveryEstimate: "Same day", limit: 1600, risk: "Verified", icon: Smartphone },
  { id: 10, name: "Thabo Mbeki", country: "South Africa", method: "Bank transfer", receiveCurrency: "ZAR", corridor: "EU-ZA", deliveryEstimate: "Within 1 business day", limit: 2400, risk: "Verified", icon: Building2 },
  { id: 11, name: "Mariam Hassan", country: "Egypt", method: "Cash pickup", receiveCurrency: "EGP", corridor: "AE-EG", deliveryEstimate: "Same day", limit: 1700, risk: "Review required", icon: Wallet },
  { id: 12, name: "Youssef El Amrani", country: "Morocco", method: "Bank transfer", receiveCurrency: "MAD", corridor: "EU-MA", deliveryEstimate: "Within 1 business day", limit: 1900, risk: "Verified", icon: Building2 }
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
