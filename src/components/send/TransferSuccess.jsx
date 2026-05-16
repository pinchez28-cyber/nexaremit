import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, ReceiptText } from "lucide-react";

export default function TransferSuccess({ transferData, onDone }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full shadow-premium border-0">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-primary mb-2">Transfer Complete</h1>
          <p className="text-neutral-600 mb-6">
            {transferData.currency} {Number(transferData.amount || 0).toFixed(2)} is on its way to {transferData.recipient?.name}.
          </p>
          <div className="receipt-preview">
            <ReceiptText className="w-5 h-5 text-blue-700" />
            <div className="text-left">
              <p className="font-semibold text-primary">Receipt ID AS-{Date.now().toString().slice(-6)}</p>
              <p className="text-sm text-neutral-500">Prototype confirmation. No real funds moved.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={onDone}>Send Another</Button>
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" className="w-full">Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
