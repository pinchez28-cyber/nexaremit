import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculateSandboxQuote } from "@/lib/transfer-pricing";
import { sendCurrencies } from "@/lib/currency-options";
import { AlertTriangle, Clock, PlugZap, ReceiptText } from "lucide-react";

function formatRateAge(fetchedAt) {
  if (!fetchedAt) return null;
  const minutes = Math.max(0, Math.round((Date.now() - fetchedAt) / 60000));
  if (minutes < 1) return "updated just now";
  if (minutes === 1) return "updated 1 minute ago";
  if (minutes < 60) return `updated ${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? "updated 1 hour ago" : `updated ${hours} hours ago`;
}

export default function AmountInput({ recipient, amount, currency, purpose, quote, quoteStatus, quoteError, onAmountChange, onRequestQuote, onBack, liveRate, rateSource, rateFetchedAt }) {
  const fallbackQuote = calculateSandboxQuote({ amount, currency, recipient, rate: liveRate });
  const mergedQuote = {
    ...fallbackQuote,
    ...(quote || {}),
    receiveCurrency: quote?.receiveCurrency || fallbackQuote.receiveCurrency,
    deliveryEstimate: quote?.providers?.payout?.deliveryEstimate || fallbackQuote.deliveryEstimate,
    transferLimit: recipient?.limit || fallbackQuote.transferLimit,
    isOverLimit: fallbackQuote.isOverLimit
  };

  const updateAmount = (nextAmount) => onAmountChange({ amount: nextAmount, currency, purpose });
  const updateCurrency = (nextCurrency) => onAmountChange({ amount, currency: nextCurrency, purpose });
  const updatePurpose = (nextPurpose) => onAmountChange({ amount, currency, purpose: nextPurpose });

  return (
    <Card className="shadow-premium border-0">
      <CardHeader>
        <CardTitle>Quote Transfer to {recipient?.name}</CardTitle>
      </CardHeader>
      <CardContent className="quote-layout">
        <div className="quote-form">
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-neutral-700">You send</span>
            <input className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3" type="number" min="1" value={amount || ""} onChange={(event) => updateAmount(Number(event.target.value))} placeholder="250" />
          </label>
          <label>
            <span className="text-sm font-medium text-neutral-700">Currency</span>
            <select className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3" value={currency} onChange={(event) => updateCurrency(event.target.value)}>
              {sendCurrencies.map((option) => (
                <option key={option.code} value={option.code}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-3">
            <span className="text-sm font-medium text-neutral-700">Purpose</span>
            <select className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3" value={purpose} onChange={(event) => updatePurpose(event.target.value)}>
              <option value="family_support">Family support</option>
              <option value="education">Education</option>
              <option value="medical">Medical</option>
              <option value="business">Business</option>
            </select>
          </label>
          {quoteStatus === "error" && (
            <Alert className="sm:col-span-3 border-red-200 bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDescription className="text-red-800">{quoteError?.message || "Unable to create a quote right now."}</AlertDescription>
            </Alert>
          )}
          {mergedQuote.isOverLimit && (
            <Alert className="sm:col-span-3 border-red-200 bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDescription className="text-red-800">
                This recipient's current limit is {currency} {mergedQuote.transferLimit.toLocaleString()} per transfer.
              </AlertDescription>
            </Alert>
          )}
          {quote?.safety?.warnings?.length > 0 && (
            <Alert className="sm:col-span-3 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <AlertDescription className="text-yellow-800">{quote.safety.warnings.join(" ")}</AlertDescription>
            </Alert>
          )}
        </div>
        <aside className="quote-summary">
          <div className="quote-summary-head">
            <ReceiptText className="w-5 h-5" />
            <span>{quote?.id ? "Server quote ready" : "Quote preview"}</span>
          </div>
          <div className="quote-row">
            <span>
              Rate
              {rateSource === "live" && rateFetchedAt ? (
                <small style={{ display: "block", color: "#525252", fontWeight: 400 }}>
                  Live rate, {formatRateAge(rateFetchedAt)}
                </small>
              ) : rateSource === "fallback" ? (
                <small style={{ display: "block", color: "#92400e", fontWeight: 400 }}>
                  Indicative rate — live rates unavailable
                </small>
              ) : null}
            </span>
            <strong>1 {currency} = {Number(mergedQuote.rate || 0).toFixed(2)} {mergedQuote.receiveCurrency}</strong>
          </div>
          <div className="quote-row">
            <span>Fee</span>
            <strong>{currency} {Number(mergedQuote.fee || 0).toFixed(2)}</strong>
          </div>
          <div className="quote-row">
            <span>Recipient gets</span>
            <strong>{mergedQuote.receiveCurrency} {Number(mergedQuote.receivedAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="delivery-chip">
            <Clock className="w-4 h-4" />
            {quoteStatus === "loading" ? "Fetching fresh quote..." : mergedQuote.deliveryEstimate}
          </div>
          <div className="integration-chip">
            <PlugZap className="w-4 h-4" />
            {quote?.id ? `Quote ID ${quote.id}` : "Create a quote before continuing"}
          </div>
        </aside>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onRequestQuote} disabled={!amount || mergedQuote.isOverLimit || quoteStatus === "loading"}>
          {quoteStatus === "loading" ? "Creating Quote..." : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
