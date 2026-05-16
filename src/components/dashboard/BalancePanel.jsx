import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, WalletCards } from "lucide-react";

const wallets = [
  { currency: "USD", balance: 18420.5, change: "+8.4%", trend: "up" },
  { currency: "GBP", balance: 6420.25, change: "-1.2%", trend: "down" },
  { currency: "EUR", balance: 9350, change: "+3.1%", trend: "up" }
];

export default function BalancePanel() {
  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletCards className="w-5 h-5" />
          Treasury Wallets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {wallets.map((wallet) => {
          const TrendIcon = wallet.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={wallet.currency} className="wallet-row">
              <div>
                <p className="font-semibold text-primary">{wallet.currency}</p>
                <p className="text-sm text-neutral-500">Available balance</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <Badge className={wallet.trend === "up" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                  <TrendIcon className="w-4 h-4 mr-2" />
                  {wallet.change}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
