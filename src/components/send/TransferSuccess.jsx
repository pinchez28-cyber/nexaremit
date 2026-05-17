import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, ReceiptText } from "lucide-react";
import { getPaymentIntentLabel, getPaymentMethodLabel } from "@/lib/payment-labels";
import { saveTransferRecord } from "@/lib/transfer-records";

export default function TransferSuccess({ transferData, onDone }) {
  const record = useMemo(() => saveTransferRecord(transferData), [transferData]);
  const paymentIntentId = getPaymentIntentLabel(transferData.paymentMethod);
  const paymentLabel = getPaymentMethodLabel(transferData.paymentMethod);
  const hasStripeAuthorization = Boolean(paymentIntentId);
  const title = hasStripeAuthorization ? "Test Payment Authorized" : "Sandbox Transfer Recorded";
  const summary = hasStripeAuthorization
    ? `${paymentLabel} test payment was authorized for ${transferData.currency} ${Number(transferData.amount || 0).toFixed(2)}. No live funds moved and no payout was sent.`
    : `A sandbox transfer for ${transferData.currency} ${Number(transferData.amount || 0).toFixed(2)} was recorded for ${transferData.recipient?.name}. No real money has moved.`;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full shadow-premium border-0">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
          <p className="text-neutral-600 mb-6">
            {summary}
          </p>
          <div className="receipt-preview">
            <ReceiptText className="w-5 h-5 text-blue-700" />
            <div className="text-left">
              <p className="font-semibold text-primary">Sandbox Receipt {record.id}</p>
              <p className="text-sm text-neutral-500">
                {hasStripeAuthorization ? `Stripe test PaymentIntent: ${paymentIntentId}` : "Real providers are not active yet."}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={onDone}>Send Another</Button>
            <Link to={`/Receipt/${record.id}`}>
              <Button variant="outline" className="w-full">View Receipt</Button>
            </Link>
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" className="w-full">Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
