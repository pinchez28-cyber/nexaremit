import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Settings } from "lucide-react";

const ChecklistItem = ({ title, description, status }) => {
  const statusConfig = {
    complete: { icon: CheckCircle, color: "text-green-600", badge: "bg-green-100 text-green-800" },
    pending: { icon: Clock, color: "text-orange-500", badge: "bg-orange-100 text-orange-800" }
  };
  const currentStatus = statusConfig[status] || statusConfig.pending;
  const Icon = currentStatus.icon;

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-neutral-200">
      <Icon className={`w-6 h-6 mt-1 ${currentStatus.color}`} />
      <div className="flex-1">
        <div className="flex justify-between items-center gap-3">
          <h4 className="font-semibold text-primary">{title}</h4>
          <Badge className={currentStatus.badge}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
        </div>
        <p className="text-sm text-neutral-600 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default function LaunchChecklist() {
  const checklist = [
    { category: "Backend & Payment Integration", items: [
      { title: "Enable Backend Functions", description: "Activate server-side logic on the base44 platform.", status: "pending" },
      { title: "Integrate Payment Processor", description: "Connect to Stripe or Adyen to handle real card charges.", status: "pending" },
      { title: "Integrate Payout Provider", description: "Connect to Thunes or Nium for global payouts.", status: "pending" }
    ] },
    { category: "Live Data & Security", items: [
      { title: "Live Forex API", description: "Replace simulated exchange rates with a live feed.", status: "pending" },
      { title: "Implement Production Security", description: "Security audits, secret management, and environment variables.", status: "pending" }
    ] },
    { category: "Legal & Compliance", items: [
      { title: "User Verification (KYC)", description: "Integrate Veriff or Onfido for identity verification.", status: "pending" },
      { title: "Obtain Financial Licenses", description: "Secure money transmitter licenses for all operating regions.", status: "pending" }
    ] },
    { category: "Final Polish", items: [
      { title: "User Interface Complete", description: "The application's design and user flow are ready.", status: "complete" },
      { title: "Thorough User Testing", description: "Beta testing with real users to find and fix bugs.", status: "pending" }
    ] }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">NexaRemit Launch Checklist</h1>
          <p className="text-neutral-600">Your roadmap to take the application live</p>
        </div>
        <Card className="bg-blue-50 border-primary mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Important Next Step</h3>
                <p className="text-neutral-700 mb-4">Enable backend functions to connect to real banks and handle real money.</p>
                <Button className="gradient-primary text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Enable Backend Functions in Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-8">
          {checklist.map((section) => (
            <Card key={section.category} className="shadow-premium border-0">
              <CardHeader>
                <CardTitle>{section.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.map((item) => <ChecklistItem key={item.title} {...item} />)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
