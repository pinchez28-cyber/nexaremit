import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertCircle, CheckCircle, ReceiptText } from "lucide-react";
import { getPaymentMethodLabel } from "@/lib/payment-labels";

function formatMoney(currency, amount) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return "";
  return currency ? `${currency} ${numericAmount.toFixed(2)}` : numericAmount.toFixed(2);
}

function normalizeTransferResult(result, source = {}) {
  const transfer = result?.transfer || result || {};
  const persistedRecord = transfer?.record || result?.record || null;
  const settlement = persistedRecord?.settlement || transfer?.settlement || result?.settlement || null;
  const fundingAuthorization =
    persistedRecord?.fundingAuthorization ||
    transfer?.fundingAuthorization ||
    result?.fundingAuthorization ||
    null;

  return {
    id: persistedRecord?.id || transfer?.id || result?.id || "",
    quoteId:
      persistedRecord?.quoteId ||
      transfer?.quoteId ||
      result?.quoteId ||
      source?.quoteId ||
      source?.quote?.id ||
      "",
    status: persistedRecord?.status || transfer?.status || result?.status || settlement?.status || "",
    paymentIntentId:
      persistedRecord?.paymentIntentId ||
      transfer?.paymentIntentId ||
      result?.paymentIntentId ||
      fundingAuthorization?.reference ||
      "",
    fundingAuthorization,
    settlement,
    recipientName:
      persistedRecord?.recipientName ||
      transfer?.recipientName ||
      source?.recipient?.name ||
      source?.recipientName ||
      "",
    destination:
      persistedRecord?.destination ||
      transfer?.destination ||
      source?.recipient?.destination ||
      source?.destination ||
      "",
    sendAmount:
      persistedRecord?.sendAmount ?? transfer?.sendAmount ?? source?.amount ?? source?.sendAmount ?? 0,
    sendCurrency:
      persistedRecord?.sendCurrency ||
      transfer?.sendCurrency ||
      source?.currency ||
      source?.sendCurrency ||
      "",
    receiveAmount:
      persistedRecord?.receiveAmount ?? transfer?.receiveAmount ?? source?.receiveAmount ?? 0,
    receiveCurrency:
      persistedRecord?.receiveCurrency ||
      transfer?.receiveCurrency ||
      source?.receiveCurrency ||
      "",
    createdAt:
      persistedRecord?.createdAt || transfer?.createdAt || result?.createdAt || new Date().toISOString(),
  };
}

function getTransferTitle(status, settlement) {
  const effectiveStatus = settlement?.status || status;

  switch (effectiveStatus) {
    case "settlement_confirmed":
    case "confirmed":
      return "Transfer Completed";
    case "settlement_submitted":
    case "submitted":
      return "Transfer Submitted";
    case "settlement_prepared":
    case "prepared":
      return "Transfer Prepared";
    case "settlement_configuration_required":
    case "configuration_required":
    case "not_submitted":
      return "Transfer Requires Configuration";
    case "failed":
    case "transfer_failed":
      return "Transfer Failed";
    default:
      return "Transfer Created";
  }
}

function getTransferSummary({ status, settlement, recipientName, amountText, paymentLabel, paymentReference }) {
  const effectiveStatus = settlement?.status || status;
  const recipientSuffix = recipientName ? ` for ${recipientName}` : "";
  const amountPrefix = amountText ? `${amountText} ` : "";

  switch (effectiveStatus) {
    case "settlement_confirmed":
    case "confirmed":
      return `Transfer completed${recipientSuffix}.`;
    case "settlement_submitted":
    case "submitted":
      return `Transfer submitted${recipientSuffix}. Settlement is in progress.`;
    case "settlement_prepared":
    case "prepared":
      return `Transfer prepared${recipientSuffix}. Settlement is ready for submission.`;
    case "settlement_configuration_required":
    case "configuration_required":
    case "not_submitted":
      return `Transfer created${recipientSuffix}, but XRPL settlement configuration is incomplete.`;
    case "failed":
    case "transfer_failed":
      return `Transfer creation failed${recipientSuffix}.`;
    default:
      return paymentReference
        ? `${paymentLabel || "Payment"} reference ${paymentReference} was accepted for ${amountPrefix.trim() || "the transfer"}${recipientSuffix}.`
        : `Transfer created${recipientSuffix}. Settlement is being processed.`;
  }
}

function ErrorState({ message, onDone }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full shadow-premium border-0">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-primary mb-2">Transfer Unavailable</h1>
          <p className="text-neutral-600 mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={onDone || (() => {})}>Start New Transfer</Button>
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" className="w-full">
                Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TransferSuccess({ transferData, onDone }) {
  const paymentMethod = transferData?.paymentMethod || transferData?.payment_method || "";
  const paymentLabel = getPaymentMethodLabel(paymentMethod);
  const record = useMemo(() => {
    if (!transferData?.transferResult) return null;
    return normalizeTransferResult(transferData.transferResult, transferData);
  }, [transferData]);

  if (!transferData) {
    return <ErrorState message="No transfer details were available for this request." onDone={onDone} />;
  }

  if (!transferData.transferResult) {
    return <ErrorState message="No completed transfer result was available for this session." onDone={onDone} />;
  }

  if (!record || (!record.id && !record.status && !record.settlement)) {
    return <ErrorState message="The transfer response did not include a usable receipt record." onDone={onDone} />;
  }

  const status = record.status || "";
  const settlement = record.settlement || null;
  const receiptId = record.id || "";
  const paymentReference = record.paymentIntentId || record.fundingAuthorization?.reference || "";
  const title = getTransferTitle(status, settlement);
  const summary = getTransferSummary({
    status,
    settlement,
    recipientName: record.recipientName,
    amountText: formatMoney(record.sendCurrency, record.sendAmount),
    paymentLabel,
    paymentReference,
  });

  const settlementNetwork = settlement?.network || "";
  const settlementLedgerStatus = settlement?.ledgerStatus || "";
  const settlementHash = settlement?.transactionHash || "";
  const settlementExplorerUrl = settlement?.explorerTransactionUrl || "";
  const settlementAssetCode = settlement?.assetCode || settlement?.asset || "";
  const settlementSubmittedAt = settlement?.submittedAt || "";
  const settlementConfirmedAt = settlement?.confirmedAt || "";

  const receiptMeta = paymentReference
    ? `Payment reference: ${paymentReference}`
    : settlementHash
      ? `Settlement transaction: ${settlementHash}`
      : "Transfer submitted to the settlement flow.";

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full shadow-premium border-0">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-5" />

          <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
          <p className="text-neutral-600 mb-6">{summary}</p>

          <div className="receipt-preview flex items-start gap-3 rounded-lg bg-white p-4 border">
            <ReceiptText className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />

            <div className="text-left w-full">
              <p className="font-semibold text-primary">
                {receiptId ? `Transfer Receipt ${receiptId}` : "Transfer Receipt"}
              </p>

              <p className="text-sm text-neutral-500">{receiptMeta}</p>

              <div className="mt-3 space-y-1 text-sm text-neutral-600">
                {record.quoteId ? (
                  <p>
                    <span className="font-medium">Quote ID:</span> {record.quoteId}
                  </p>
                ) : null}

                {settlementNetwork ? (
                  <p>
                    <span className="font-medium">Network:</span> {String(settlementNetwork).toUpperCase()}
                  </p>
                ) : null}

                {settlementAssetCode ? (
                  <p>
                    <span className="font-medium">Asset:</span> {settlementAssetCode}
                  </p>
                ) : null}

                {settlementLedgerStatus ? (
                  <p>
                    <span className="font-medium">Ledger status:</span> {settlementLedgerStatus}
                  </p>
                ) : null}

                {settlementHash ? (
                  <p className="break-all">
                    <span className="font-medium">Transaction hash:</span> {settlementHash}
                  </p>
                ) : null}

                {settlementSubmittedAt ? (
                  <p>
                    <span className="font-medium">Submitted at:</span> {settlementSubmittedAt}
                  </p>
                ) : null}

                {settlementConfirmedAt ? (
                  <p>
                    <span className="font-medium">Confirmed at:</span> {settlementConfirmedAt}
                  </p>
                ) : null}

                {settlementExplorerUrl ? (
                  <a
                    href={settlementExplorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-primary underline"
                  >
                    View transaction
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <Button onClick={onDone || (() => {})}>Send Another</Button>

            {receiptId ? (
              <Link to={`/Receipt/${receiptId}`}>
                <Button variant="outline" className="w-full">
                  View Receipt
                </Button>
              </Link>
            ) : null}

            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" className="w-full">
                Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
