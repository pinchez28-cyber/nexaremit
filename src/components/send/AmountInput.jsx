import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculateSandboxQuote } from "@/lib/transfer-pricing";
import { transferOrchestrator } from "@/integrations/transfer-orchestrator";
import { AlertTriangle, Clock, PlugZap, ReceiptText } from "lucide-react";

export default function AmountInput({ recipient, amount, currency, purpose, onAmountChange, onNext, onBack }) {
  const fallbackQuote = calculateSandboxQuote({ amount, currency, recipient });
  const [providerQuote, setProviderQuote] = useState(null);
  const quote = providerQuote || fallbackQuote;
  const updateAmount = (nextAmount) => onAmountChange({ amount: nextAmount, currency, purpose });
  const updateCurrency = (nextCurrency) => onAmountChange({ amount, currency: nextCurrency, purpose });
  const updatePurpose = (nextPurpose) => onAmountChange({ amount, currency, purpose: nextPurpose });

  useEffect(() => {
    let isMounted = true;
    transferOrchestrator.createQuote({ amount, currency, recipient, purpose }).then((nextQuote) => {
      if (isMounted) setProviderQuote(nextQuote);
    });
    return () => {
      isMounted = false;
    };
  }, [amount, currency, recipient, purpose]);

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
              <option>USD</option>
              <option>GBP</option>
              <option>EUR</option>
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
          {quote.isOverLimit && (
            <Alert className="sm:col-span-3 border-red-200 bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDescription className="text-red-800">
                This recipient's current limit is {currency} {quote.transferLimit.toLocaleString()} per transfer.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <aside className="quote-summary">
          <div className="quote-summary-head">
            <ReceiptText className="w-5 h-5" />
            <span>Provider-ready quote</span>
          </div>
          <div className="quote-row">
            <span>Rate</span>
            <strong>1 {currency} = {quote.rate.toFixed(2)} {quote.receiveCurrency}</strong>
          </div>
          <div className="quote-row">
            <span>Fee</span>
            <strong>{currency} {quote.fee.toFixed(2)}</strong>
          </div>
          <div className="quote-row">
            <span>Recipient gets</span>
            <strong>{quote.receiveCurrency} {quote.receivedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="delivery-chip">
            <Clock className="w-4 h-4" />
            {quote.deliveryEstimate}
          </div>
          <div className="integration-chip">
            <PlugZap className="w-4 h-4" />
            Sandbox adapters active
          </div>
        </aside>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={!amount || quote.isOverLimit}>Continue</Button>
      </CardFooter>
    </Card>
  );
}
