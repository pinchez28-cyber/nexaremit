import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertCircle, CheckCircle, ReceiptText } from "lucide-react";
import { getPaymentIntentLabel, getPaymentMethodLabel } from "@/lib/payment-labels";
import { buildTransferRecord, persistTransferRecord } from "@/lib/transfer-records";

function formatMoney(currency, amount) {
  const numericAmount = Number(amount || 0);
  if (!currency) return numericAmount.toFixed(2);
  return `${currency} ${numericAmount.toFixed(2)}`;
}

function formatNetwork(network) {
  if (!network) return "";
  return `XRPL ${network.charAt(0).toUpperCase()}${network.slice(1)}`;
}

function getStatusPresentation({ status, networkLabel, amountLabel, recipientName }) {
  switch (status) {
    case "confirmed":
      return {
        tone: "success",
        title: "Transfer Confirmed",
        summary: `Your transfer for ${amountLabel} to ${recipientName} was confirmed${networkLabel ? ` on ${networkLabel}` : ""}.`
      };

    case "submitted":
      return {
        tone: "success",
        title: "Transfer Submitted",
        summary: `Your transfer for ${amountLabel} to ${recipientName} was submitted${networkLabel ? ` on ${networkLabel}` : ""} and is awaiting final confirmation.`
      };

    case "funding_authorized":
      return {
        tone: "success",
        title: "Funding Authorized",
        summary: `Funding is authorized for ${amountLabel}. Settlement is prepared${networkLabel ? ` on ${networkLabel}` : ""}.`
      };

    case "requires_payment_authorization":
      return {
        tone: "warning",
        title: "Payment Authorization Required",
        summary: `The transfer for ${amountLabel} to ${recipientName} was created, but payment authorization must be completed before settlement can continue.`
      };

    case "settlement_failed":
      return {
        tone: "warning",
        title: "Transfer Needs Attention",
        summary: `Funding was collected for ${amountLabel}, but settlement could not be completed${networkLabel ? ` on ${networkLabel}` : ""}. Review the transfer details below.`
      };

    case "blocked":
      return {
        tone: "warning",
        title: "Transfer Blocked",
        summary: "This transfer could not proceed because one or more safety or compliance checks blocked the request."
      };

    default:
      return {
        tone: "success",
        title: "Transfer Created",
        summary: `Your transfer for ${amountLabel} to ${recipientName} has been recorded${networkLabel ? ` with ${networkLabel} settlement details` : ""}.`
      };
  }
}

export default function TransferSuccess({ transferData, onDone }) {
  const initialRecord = useMemo(() => buildTransferRecord(transferData), [transferData]);
  const [record, setRecord] = useState(initialRecord);
  const hasSaved = useRef(false);

  const result = transferData?.transferResult || {};
  const transfer = result?.transfer || {};
  const quote = result?.quote || transferData?.quote || {};
  const settlement = quote?.providers?.settlement || null;

  const paymentIntentId = getPaymentIntentLabel(transferData?.paymentMethod);
  const paymentLabel = getPaymentMethodLabel(transferData?.paymentMethod);
  const amountLabel = formatMoney(transferData?.currency || quote?.currency, transferData?.amount || quote?.amount);
  const recipientName = transferData?.recipient?.name || "the selected recipient";
  const networkLabel = formatNetwork(settlement?.network);
  const transferStatus = result?.status || transfer?.status || "created";

  const presentation = getStatusPresentation({
    status: transferStatus,
    networkLabel,
    amountLabel,
    recipientName
  });

  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;
    persistTransferRecord(initialRecord).then(setRecord);
  }, [initialRecord]);

  const isSuccessTone = presentation.tone === "success";
  const StatusIcon = isSuccessTone ? CheckCircle : AlertCircle;
  const iconColor = isSuccessTone ? "text-green-600" : "text-amber-600";
  const badgeClasses = isSuccessTone
    ? "bg-green-100 text-green-800"
    : "bg-amber-100 text-amber-800";

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
                  <p className="font-semibold text-primary">Transfer Receipt {record.id}</p>
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
                </div>
              </div>
            </div>

            {settlement && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h2 className="font-semibold text-primary mb-3">Settlement Details</h2>
                <div className="grid gap-2 text-sm text-neutral-700">
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Rail</span>
                    <span className="font-medium text-right">{settlement.rail || "Settlement provider"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Network</span>
                    <span className="font-medium text-right">{networkLabel || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Asset</span>
                    <span className="font-medium text-right">{settlement.asset || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Settlement status</span>
                    <span className="font-medium text-right">
                      {(settlement.status || "unknown").replace(/_/g, " ")}
                    </span>
                  </div>
                  {transfer.transactionHash && (
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-500">Transaction hash</span>
                      <span className="font-medium text-right break-all">{transfer.transactionHash}</span>
                    </div>
                  )}
                  {transfer.ledgerIndex && (
                    <div className="flex justify-between gap-4">
                      <span className="text-neutral-500">Ledger index</span>
                      <span className="font-medium text-right">{transfer.ledgerIndex}</span>
                    </div>
                  )}
                  {transfer.explorerUrl && (
                    <div className="pt-2">
                      <a
                        href={transfer.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 hover:underline font-medium"
                      >
                        View ledger details
                      </a>
                    </div>
                  )}
                  {settlement.note && (
                    <p className="text-sm text-neutral-600 pt-2">{settlement.note}</p>
                  )}
                  {settlement.error && (
                    <p className="text-sm text-red-700 pt-2">{settlement.error}</p>
                  )}
                </div>
              </div>
            )}
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
