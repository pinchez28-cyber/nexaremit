import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CircleDashed, ShieldAlert } from "lucide-react";

const readiness = [
  { label: "UI transfer flow", done: true },
  { label: "KYC verification provider", done: false },
  { label: "AML transaction monitoring", done: false },
  { label: "Licensed payout partner", done: false }
];

export default function ComplianceReadiness() {
  const completed = readiness.filter((item) => item.done).length;

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          Launch Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="readiness-meter" aria-label={`${completed} of ${readiness.length} readiness items complete`}>
          <div style={{ width: `${(completed / readiness.length) * 100}%` }} />
        </div>
        <Badge className="bg-orange-100 text-orange-800">{completed} of {readiness.length} complete</Badge>
        <div className="space-y-3">
          {readiness.map((item) => {
            const Icon = item.done ? CheckCircle : CircleDashed;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${item.done ? "text-green-600" : "text-orange-500"}`} />
                <span className="text-sm text-neutral-700">{item.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
