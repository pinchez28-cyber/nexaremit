import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { calculateTransferQuote } from "@/lib/transfer-pricing";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function ReviewTransfer({ transferData, onConfirm, onBack }) {
  const quote = calculateTransferQuote(transferData);

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <div className="flex justify-between items-center gap-3">
          <CardTitle>Review Transfer</CardTitle>
          <Badge className="bg-orange-100 text-orange-800">Sandbox approval</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            This confirms the prototype flow only. A production app must run KYC, sanctions screening, velocity limits, and payment authorization before creating a transfer.
          </AlertDescription>
        </Alert>
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Recipient</span>
          <span className="font-semibold">{transferData.recipient?.name}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Destination</span>
          <span className="font-semibold">{transferData.recipient?.country} - {transferData.recipient?.method}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Send amount</span>
          <span className="font-semibold">{transferData.currency} {Number(transferData.amount || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Fee</span>
          <span className="font-semibold">{transferData.currency} {quote.fee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Recipient receives</span>
          <span className="font-semibold">{quote.receiveCurrency} {quote.receivedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="font-semibold text-primary">Total</span>
          <span className="font-bold text-primary">{transferData.currency} {quote.total.toFixed(2)}</span>
        </div>
        <div className="review-security">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span>Quote expires in 60 seconds. Re-price before submitting to a real payment processor.</span>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onConfirm}>Confirm Transfer</Button>
      </CardFooter>
    </Card>
  );
}
