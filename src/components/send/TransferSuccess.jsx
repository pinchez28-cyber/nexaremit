import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertCircle, Clock, ReceiptText } from "lucide-react";
import { getPaymentIntentLabel, getPaymentMethodLabel } from "@/lib/payment-labels";

function formatMoney(currency, amount) {
  const numericAmount = Number(amount || 0);
  if (!currency) return numericAmount.toFixed(2);
  return `${currency} ${numericAmount.toFixed(2)}`;
}

// Batch 2 (UI honesty): status is SERVER-OWNED only. The success screen never
// claims a transfer "succeeded" or was "paid" — funding is received at most,
// and the recipient has NOT been paid (no payout provider exists). The honest
// terminal copy is "Funding received — payout pending".
//
// Statuses that were previously invented locally (confirmed / submitted /
// funding_authorized / sandbox_complete) are gone. The only success-toned
// presentation is a server-owned `funded`/`payout_pending` transfer, rendered
// with payout-pending language — never success.
function getStatusPresentation({ status, amountLabel, recipientName }) {
  const statusKey = String(status || "created").toLowerCase();

  if (statusKey === "pending_funding" || statusKey === "created") {
    return {
      tone: "warning",
      title: "Funding Authorization Required",
      summary: `Funding for ${amountLabel} to ${recipientName} has not been received yet. Complete payment authorization before this transfer can proceed. Funding received does NOT pay the recipient.`,
    };
  }

  if (statusKey === "funded" || statusKey === "payout_pending") {
    return {
      tone: "info",
      title: "Funding Received — Payout Pending",
      summary: `We received funding for ${amountLabel} to ${recipientName}. The recipient has NOT been paid — no payout provider is connected yet, so the money is pending settlement.`,
    };
  }

  if (statusKey === "reconciliation_failed") {
    return {
      tone: "warning",
      title: "Transfer Needs Attention",
      summary: `Funding for ${amountLabel} did not reconcile exactly against the server record. No payout is owed until this is reviewed.`,
    };
  }

  if (statusKey === "cancelled" || statusKey === "expired") {
    return {
      tone: "warning",
      title: "Transfer Not Completed",
      summary: `The transfer for ${amountLabel} to ${recipientName} was ${statusKey}. No money was paid out.`,
    };
  }

  return {
    tone: "warning",
    title: "Transfer Status",
    summary: `The transfer for ${amountLabel} to ${recipientName} has not been paid. No payout provider is connected yet.`,
  };
}

export default function TransferSuccess({ transferData, onDone }) {
  const result = transferData?.transferResult || {};
  const transfer = result?.transfer || {};
  const quote = result?.quote || transferData?.quote || {};

  // Server-owned status only. If the local transferData has no server status,
  // we render "awaiting funding" — we never invent success.
  const transferStatus = transfer?.status || transferData?.serverStatus || "pending_funding";

  const paymentIntentId = getPaymentIntentLabel(transferData?.paymentMethod);
  const paymentLabel = getPaymentMethodLabel(transferData?.paymentMethod);
  const amountLabel = formatMoney(
    transferData?.currency || quote?.currency,
    transferData?.amount || quote?.amount
  );
  const recipientName = transferData?.recipient?.name || "the selected recipient";

  const presentation = getStatusPresentation({
    status: transferStatus,
    amountLabel,
    recipientName,
  });

  const isWarning = presentation.tone !== "success";
  const StatusIcon = isWarning ? AlertCircle : Clock;
  const iconColor = isWarning ? "text-amber-600" : "text-blue-700";
  const badgeClasses = isWarning
    ? "bg-amber-100 text-amber-800"
    : "bg-blue-100 text-blue-800";

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full shadow-premium border-0">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <StatusIcon className={`w-16 h-16 mx-auto mb-5 ${iconColor}`} />
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-4 ${badgeClasses}`}>
              {transferStatus.replace(/_/g, " ")}
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">{presentation.title}</h1>
            <p className="text-neutral-600">{presentation.summary}</p>
          </div>

          <div className="grid gap-4 mb-6">
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <ReceiptText className="w-5 h-5 text-blue-700 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-primary">Transfer {transfer.id || "(pending server record)"}</p>
                  <div className="mt-3 grid gap-2 text-sm text-neutral-700">
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-500">Recipient</span>
                      <span className="font-medium text-right">{recipientName}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-500">Amount</span>
                      <span className="font-medium text-right">{amountLabel}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-500">Payment method</span>
                      <span className="font-medium text-right">{paymentLabel}</span>
                    </div>
                    {paymentIntentId && (
                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-500">Stripe payment</span>
                        <span className="font-medium text-right break-all">{paymentIntentId}</span>
                      </div>
                    )}
                    {transfer.reference && (
                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-500">Reference</span>
                        <span className="font-medium text-right">{transfer.reference}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-500">Status</span>
                      <span className="font-medium text-right">{transferStatus.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-neutral-600">
                    Funding received does not pay the recipient. No payout provider is
                    connected yet, so this transfer is pending settlement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={onDone}>Send Another</Button>
            {transfer.id && (
              <Link to={`/Receipt/${transfer.id}`}>
                <Button variant="outline" className="w-full">View Receipt</Button>
              </Link>
            )}
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" className="w-full">Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}