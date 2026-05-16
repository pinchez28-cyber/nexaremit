import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Send, UserRound, WalletCards } from "lucide-react";

export default function StatsOverview({ stats, isLoading }) {
  const items = [
    { label: "Total Sent", value: `$${stats.totalSent.toLocaleString()}`, icon: WalletCards },
    { label: "Transactions", value: stats.totalTransactions, icon: Send },
    { label: "Completed", value: stats.completedTransactions, icon: CheckCircle },
    { label: "Recipients", value: stats.activeRecipients, icon: UserRound }
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="shadow-premium border-0">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">{label}</p>
              <p className="text-2xl font-bold text-primary mt-1">{isLoading ? "..." : value}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
