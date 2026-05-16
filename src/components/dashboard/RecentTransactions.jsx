import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecentTransactions({ transactions, isLoading }) {
  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <div className="h-28 rounded-xl bg-neutral-100 animate-pulse" />}
        {!isLoading && transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between gap-4 border border-neutral-200 rounded-lg p-4">
            <div>
              <p className="font-semibold text-primary">{transaction.recipient_name}</p>
              <p className="text-sm text-neutral-500">{transaction.destination_country} · {transaction.created_date}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{transaction.currency} {transaction.send_amount.toLocaleString()}</p>
              <Badge className="bg-green-100 text-green-800">{transaction.status}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
