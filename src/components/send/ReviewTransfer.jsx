import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getPaymentIntentLabel, getPaymentMethodLabel } from "@/lib/payment-labels";
import { AlertTriangle, CheckCircle, Landmark, ShieldCheck } from "lucide-react";

const statusLabels = {
  configuration_required: "Configuration required",
  prepared: "Prepared",
  funding_authorized: "Funding authorized",
  requires_payment_authorization: "Requires payment authorization",
  submitted: "Submitted",
  confirmed: "Confirmed",
  settlement_failed: "Settlement failed"
};

function formatStatus(status) {
  if (!status) return "Unknown";
  return statusLabels[status] || status.replace(/_/g, " ");
}

function getModeLabel() {
  return "Quote ready";
}


export default function ReviewTransfer({ transferData, transferStatus, transferError, onConfirm, onBack }) {
  const quote = transferData.quote;
  const transferResult = transferData.transferResult;

  const paymentMethodType =
    typeof transferData.paymentMethod === "string"
      ? transferData.paymentMethod
      : transferData.paymentMethod?.type || "";

  const hasStripeAuthorization = Boolean(transferData.paymentMethod?.paymentIntentId);
  const paymentLabel = getPaymentMethodLabel(transferData.paymentMethod);
  const paymentIntentId = getPaymentIntentLabel(transferData.paymentMethod);


  const kycStatus =
    transferResult?.quote?.providers?.kyc?.status ||
    quote?.providers?.kyc?.status ||
    "unknown";

  const sanctionsStatus =
    transferResult?.quote?.providers?.sanctions?.status ||
    quote?.providers?.sanctions?.status ||
    "unknown";

  if (!quote) {
    return (
      <Card className="shadow-premium border-0">
        <CardHeader>
          <div className="flex justify-between items-center gap-3">
            <CardTitle>Review Transfer</CardTitle>
            <Badge className="bg-red-100 text-red-800">Quote missing</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">
              No live quote is available. Go back and create a quote before reviewing this transfer.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={onBack}>Back</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <div className="flex justify-between items-center gap-3">
          <CardTitle>Review Transfer</CardTitle>
          <Badge className="bg-blue-100 text-blue-800">{getModeLabel()}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasStripeAuthorization && paymentMethodType === "card" && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              No Stripe payment has been authorized for this transfer yet. Complete payment authorization before submitting the transfer.
            </AlertDescription>
          </Alert>
        )}

        {!paymentMethodType && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">
              A payment method is required before review. Go back and choose how the transfer will be funded.
            </AlertDescription>
          </Alert>
        )}

        {transferError?.message && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">
              {transferError.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Recipient</span>
          <span className="font-semibold">{transferData.recipient?.name || "—"}</span>
        </div>

        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Destination</span>
          <span className="font-semibold">
            {transferData.recipient?.country || "—"} - {transferData.recipient?.method || "—"}
          </span>
        </div>

        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Payment method</span>
          <span className="font-semibold">{paymentLabel || "—"}</span>
        </div>

        {paymentIntentId && (
          <div className="flex justify-between border-b border-neutral-100 pb-3">
            <span className="text-neutral-600">Stripe payment</span>
            <span className="font-semibold">{paymentIntentId}</span>
          </div>
        )}

        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Send amount</span>
          <span className="font-semibold">
            {quote.currency} {Number(quote.amount || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Fee</span>
          <span className="font-semibold">
            {quote.currency} {Number(quote.fee || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between border-b border-neutral-100 pb-3">
          <span className="text-neutral-600">Recipient receives</span>
          <span className="font-semibold">
            {quote.receiveCurrency} {Number(quote.receivedAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between text-lg">
          <span className="font-semibold text-primary">Total</span>
          <span className="font-bold text-primary">
            {quote.currency} {Number(quote.total || 0).toFixed(2)}
          </span>
        </div>

        <div className="review-security">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span>
            Quote expires at {quote.expiresAt ? new Date(quote.expiresAt).toLocaleString() : "the configured expiry time"}.
          </span>
        </div>

        <div className="provider-readiness">
          <div>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>KYC: {kycStatus}</span>
          </div>

          <div>
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span>Screening: {sanctionsStatus}</span>
          </div>

        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button
          disabled={!paymentMethodType || (paymentMethodType === "card" && !hasStripeAuthorization) || transferStatus === "submitting"}
          onClick={onConfirm}
        >
          {transferStatus === "submitting" ? "Submitting..." : "Submit Transfer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
