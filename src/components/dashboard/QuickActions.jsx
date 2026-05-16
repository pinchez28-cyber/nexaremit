import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ListChecks, ReceiptText, Send, ShieldCheck } from "lucide-react";

export default function QuickActions() {
  const actions = [
    { label: "Easy Setup", helper: "Simple sender and receiver setup", icon: ReceiptText, to: "Setup" },
    { label: "Quote Transfer", helper: "Fees, delivery, and received amount", icon: Send, to: "SendMoney" },
    { label: "Launch Checklist", helper: "What must exist before go-live", icon: ListChecks, to: "LaunchChecklist" },
    { label: "Compliance Status", helper: "KYC, AML, privacy, and fraud gaps", icon: ShieldCheck, to: "SecurityCompliance" },
  ];

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="quick-action-grid">
        {actions.map(({ label, helper, icon: Icon, to }) => (
          <Link key={label} to={createPageUrl(to)}>
            <div className="quick-action-tile">
              <Icon className="w-6 h-6 text-blue-700" />
              <div>
                <p className="font-semibold text-primary">{label}</p>
                <p className="text-sm text-neutral-500">{helper}</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
