import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import RecipientSelection from "../components/send/RecipientSelection";
import AmountInput from "../components/send/AmountInput";
import PaymentMethod from "../components/send/PaymentMethod";
import ReviewTransfer from "../components/send/ReviewTransfer";
import TransferSuccess from "../components/send/TransferSuccess";
import { calculateTransferQuote } from "@/lib/transfer-pricing";
import { getRate, refreshRates, FX_TTL_MS } from "@/lib/fx-rates";

const STEPS = {
  RECIPIENT: "recipient",
  AMOUNT: "amount",
  PAYMENT: "payment",
  REVIEW: "review",
  SUCCESS: "success",
};

const STEP_ORDER = [
  STEPS.RECIPIENT,
  STEPS.AMOUNT,
  STEPS.PAYMENT,
  STEPS.REVIEW,
  STEPS.SUCCESS,
];

const STEP_TITLES = {
  [STEPS.RECIPIENT]: "Select Recipient",
  [STEPS.AMOUNT]: "Enter Amount",
  [STEPS.PAYMENT]: "Payment Method",
  [STEPS.REVIEW]: "Review Transfer",
  [STEPS.SUCCESS]: "Transfer Complete",
};

const QUOTE_TTL_MS = 10 * 60 * 1000;

export default function SendMoney() {
  const [currentStep, setCurrentStep] = useState(STEPS.RECIPIENT);
  const [quoteStatus, setQuoteStatus] = useState("idle");
  const [quoteError, setQuoteError] = useState(null);

  // A stable id for this transfer attempt. It is used as the Stripe
  // idempotency key, so it must NOT be regenerated on every render —
  // otherwise each render would create a new PaymentIntent.
  const transferIdRef = useRef(
    `nexa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  const [transferData, setTransferData] = useState({
    recipient: null,
    amount: null,
    currency: "USD",
    paymentMethod: null,
    purpose: "family_support",
    quote: null,
    transferId: transferIdRef.current,
  });

  const updateTransferData = useCallback((data) => {
    setTransferData((prev) => ({ ...prev, ...data }));
  }, []);

  // ---- Live FX rates -------------------------------------------------
  // Rates refresh on mount, when the send currency changes, on an interval,
  // and whenever the tab regains focus (so a session left open overnight
  // doesn't quote yesterday's rate). Failures fall back to the bundled table.
  const [fx, setFx] = useState(() =>
    getRate(transferData.currency, transferData.recipient?.receiveCurrency)
  );

  const sendCurrency = transferData.currency;
  const receiveCurrency = transferData.recipient?.receiveCurrency;

  useEffect(() => {
    let active = true;

    const sync = async (options) => {
      await refreshRates(sendCurrency, options);
      if (active) setFx(getRate(sendCurrency, receiveCurrency));
    };

    sync();

    const interval = setInterval(sync, FX_TTL_MS);
    const onFocus = () => sync();
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [sendCurrency, receiveCurrency]);

  const goToStep = useCallback((step) => setCurrentStep(step), []);

  const nextStep = useCallback(() => {
    setCurrentStep((step) =>
      STEP_ORDER[Math.min(STEP_ORDER.indexOf(step) + 1, STEP_ORDER.length - 1)]
    );
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep((step) =>
      STEP_ORDER[Math.max(STEP_ORDER.indexOf(step) - 1, 0)]
    );
  }, []);

  // Build the quote, then advance to the payment step.
  // Pricing is computed locally; the authoritative charge amount (including
  // fees) is recomputed server-side in /api/create-payment-intent.
  const requestQuote = useCallback(() => {
    setQuoteError(null);

    const amount = Number(transferData.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setQuoteStatus("error");
      setQuoteError(new Error("Enter an amount greater than zero to continue."));
      return;
    }

    setQuoteStatus("loading");

    try {
      const priced = calculateTransferQuote({
        amount,
        currency: transferData.currency,
        recipient: transferData.recipient,
        rate: fx?.rate,
      });

      if (priced.isOverLimit) {
        setQuoteStatus("error");
        setQuoteError(
          new Error(
            `This recipient's limit is ${transferData.currency} ${priced.transferLimit.toLocaleString()} per transfer.`
          )
        );
        return;
      }

      const quote = {
        id: `q-${transferIdRef.current}`,
        amount,
        currency: transferData.currency,
        rate: priced.rate,
        fee: priced.fee,
        total: priced.total,
        receivedAmount: priced.receivedAmount,
        receiveCurrency: priced.receiveCurrency,
        deliveryEstimate: priced.deliveryEstimate,
        rateSource: fx?.source || "fallback",
        rateFetchedAt: fx?.fetchedAt || null,
        expiresAt: new Date(Date.now() + QUOTE_TTL_MS).toISOString(),
      };

      updateTransferData({ quote });
      setQuoteStatus("ready");
      goToStep(STEPS.PAYMENT);
    } catch (error) {
      setQuoteStatus("error");
      setQuoteError(error);
    }
  }, [
    transferData.amount,
    transferData.currency,
    transferData.recipient,
    fx,
    updateTransferData,
    goToStep,
  ]);

  const progress = useMemo(
    () => ((STEP_ORDER.indexOf(currentStep) + 1) / STEP_ORDER.length) * 100,
    [currentStep]
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.RECIPIENT:
        return (
          <RecipientSelection
            selectedRecipient={transferData.recipient}
            onSelectRecipient={(recipient) => {
              updateTransferData({ recipient, quote: null });
              setQuoteStatus("idle");
              goToStep(STEPS.AMOUNT);
            }}
          />
        );

      case STEPS.AMOUNT:
        return (
          <AmountInput
            recipient={transferData.recipient}
            amount={transferData.amount}
            currency={transferData.currency}
            purpose={transferData.purpose}
            quote={transferData.quote}
            quoteStatus={quoteStatus}
            quoteError={quoteError}
            liveRate={fx?.rate}
            rateSource={fx?.source}
            rateFetchedAt={fx?.fetchedAt}
            onAmountChange={(data) => {
              // Any change invalidates an existing quote.
              updateTransferData({ ...data, quote: null });
              setQuoteStatus("idle");
              setQuoteError(null);
            }}
            onRequestQuote={requestQuote}
            onBack={previousStep}
          />
        );

      case STEPS.PAYMENT:
        return (
          <PaymentMethod
            selectedMethod={
              typeof transferData.paymentMethod === "string"
                ? transferData.paymentMethod
                : transferData.paymentMethod?.type
            }
            transferData={transferData}
            onSelectMethod={(paymentMethod) => {
              updateTransferData({ paymentMethod });
              goToStep(STEPS.REVIEW);
            }}
            onBack={previousStep}
          />
        );

      case STEPS.REVIEW:
        return (
          <ReviewTransfer
            transferData={transferData}
            transferStatus="idle"
            transferError={null}
            onConfirm={() => goToStep(STEPS.SUCCESS)}
            onBack={previousStep}
          />
        );

      case STEPS.SUCCESS:
        return (
          <TransferSuccess
            transferData={transferData}
            onDone={() => {
              transferIdRef.current = `nexa-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`;
              setTransferData({
                recipient: null,
                amount: null,
                currency: "USD",
                paymentMethod: null,
                purpose: "family_support",
                quote: null,
                transferId: transferIdRef.current,
              });
              setQuoteStatus("idle");
              setQuoteError(null);
              goToStep(STEPS.RECIPIENT);
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {STEP_TITLES[currentStep]}
            </h1>
            <p className="text-sm text-neutral-600">
              Step {STEP_ORDER.indexOf(currentStep) + 1} of {STEP_ORDER.length}
            </p>
          </div>
        </div>

        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "#e5e7eb",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#0f766e",
              transition: "width 240ms ease",
            }}
          />
        </div>

        {renderStepContent()}
      </div>
    </div>
  );
}
