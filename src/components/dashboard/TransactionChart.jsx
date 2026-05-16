import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionChart({ transactions, isLoading }) {
  const max = Math.max(...transactions.map((transaction) => transaction.send_amount), 1);

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle>Transfer Volume</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-56 rounded-xl bg-neutral-100 animate-pulse" />
        ) : (
          <div className="h-56 flex items-end gap-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-md gradient-primary" style={{ height: `${Math.max((transaction.send_amount / max) * 180, 24)}px` }} />
                <span className="text-xs text-neutral-500">{transaction.currency}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
