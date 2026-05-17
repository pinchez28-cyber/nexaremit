import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, Building2, Plus, ShieldCheck, Smartphone, Wallet } from "lucide-react";

const recipients = [
  { name: "Amara Okafor", country: "Nigeria", method: "Bank transfer", currency: "NGN", status: "Verified", icon: Building2 },
  { name: "Daniel Mwangi", country: "Kenya", method: "Mobile money", currency: "KES", status: "Verified", icon: Smartphone },
  { name: "Efua Mensah", country: "Ghana", method: "Wallet payout", currency: "GHS", status: "Review required", icon: Wallet },
  { name: "Priya Sharma", country: "India", method: "Bank transfer", currency: "INR", status: "Verified", icon: Building2 },
  { name: "Maria Santos", country: "Philippines", method: "Mobile wallet", currency: "PHP", status: "Verified", icon: Smartphone },
  { name: "Carlos Rivera", country: "Mexico", method: "Bank transfer", currency: "MXN", status: "Verified", icon: Building2 },
  { name: "Ana Oliveira", country: "Brazil", method: "PIX payout", currency: "BRL", status: "Verified", icon: Wallet },
  { name: "Ahmed Khan", country: "Pakistan", method: "Bank transfer", currency: "PKR", status: "Review required", icon: Building2 },
  { name: "Nusrat Rahman", country: "Bangladesh", method: "Mobile money", currency: "BDT", status: "Verified", icon: Smartphone },
  { name: "Thabo Mbeki", country: "South Africa", method: "Bank transfer", currency: "ZAR", status: "Verified", icon: Building2 },
  { name: "Mariam Hassan", country: "Egypt", method: "Cash pickup", currency: "EGP", status: "Review required", icon: Wallet },
  { name: "Youssef El Amrani", country: "Morocco", method: "Bank transfer", currency: "MAD", status: "Verified", icon: Building2 }
];

export default function Recipients() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Recipients</h1>
            <p className="text-neutral-600">Manage payout profiles, verification status, and transfer corridors.</p>
          </div>
          <Link to={createPageUrl("Setup")}>
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Add Recipient
            </Button>
          </Link>
        </div>
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Recipient creation is a prototype screen. Production onboarding needs identity checks, sanctions screening, account validation, and duplicate detection.
          </AlertDescription>
        </Alert>
        <div className="recipient-directory">
          {recipients.map((recipient) => {
            const Icon = recipient.icon;
            return (
              <Card key={recipient.name} className="shadow-premium border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="recipient-icon"><Icon className="w-5 h-5" /></span>
                    {recipient.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Country</span>
                    <strong className="text-primary">{recipient.country}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Payout</span>
                    <strong className="text-primary">{recipient.method}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Currency</span>
                    <strong className="text-primary">{recipient.currency}</strong>
                  </div>
                  <Badge className={recipient.status === "Verified" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {recipient.status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
