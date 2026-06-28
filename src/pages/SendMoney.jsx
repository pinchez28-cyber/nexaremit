import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RecipientSelection from "../components/send/RecipientSelection";
import AmountInput from "../components/send/AmountInput";
import PaymentMethod from "../components/send/PaymentMethod";
import ReviewTransfer from "../components/send/ReviewTransfer";
import TransferSuccess from "../components/send/TransferSuccess";
import { useAuth } from "@/lib/AuthContext";
import { createIdempotencyKey, requestTransferQuote, submitTransferRequest } from "@/lib/transfer-api";

const STEPS = {
  RECIPIENT: "recipient",
  AMOUNT: "amount",
  PAYMENT: "payment",
  REVIEW: "review",
  SUCCESS: "success"
};

function getDefaultTransferData() {
  return {
    recipient: null,
    amount: null,
    currency: "USD",
    paymentMethod: null,
    purpose: "family_support",
    quote: null,
    quoteId: "",
    transferResult: null,
    lastIdempotencyKey: ""
  };
}

export default function SendMoney() {
  const { navigateToLogin } = useAuth();
  const [currentStep, setCurrentStep] = useState(STEPS.RECIPIENT);
  const [transferData, setTransferData] = useState(getDefaultTransferData);
  const [quoteRequest, setQuoteRequest] = useState({ status: "idle", error: null });
  const [transferRequest, setTransferRequest] = useState({ status: "idle", error: null });

  const stepTitles = {
    [STEPS.RECIPIENT]: "Select Recipient",
    [STEPS.AMOUNT]: "Create Quote",
    [STEPS.PAYMENT]: "Payment Method",
    [STEPS.REVIEW]: "Review Transfer",
    [STEPS.SUCCESS]: "Transfer Complete"
  };

  const stepOrder = useMemo(() => Object.values(STEPS), []);
  const nextStep = () => setCurrentStep((step) => stepOrder[Math.min(stepOrder.indexOf(step) + 1, stepOrder.length - 1)]);
  const previousStep = () => setCurrentStep((step) => stepOrder[Math.max(stepOrder.indexOf(step) - 1, 0)]);

  const updateTransferData = (data) => {
    const pricingKeys = ["recipient", "amount", "currency", "purpose"];
    const shouldResetPricing = pricingKeys.some((key) => Object.prototype.hasOwnProperty.call(data, key));

    setTransferData((prev) => ({
      ...prev,
      ...data,
      ...(shouldResetPricing ? {
        quote: null,
        quoteId: "",
        transferResult: null,
        lastIdempotencyKey: "",
        paymentMethod: Object.prototype.hasOwnProperty.call(data, "paymentMethod") ? data.paymentMethod : null
      } : {})
    }));

    if (shouldResetPricing) {
      setQuoteRequest({ status: "idle", error: null });
      setTransferRequest({ status: "idle", error: null });
    }
  };

  const resetFlow = () => {
    setTransferData(getDefaultTransferData());
    setQuoteRequest({ status: "idle", error: null });
    setTransferRequest({ status: "idle", error: null });
    setCurrentStep(STEPS.RECIPIENT);
  };

  const handleApiError = (error, setter) => {
    setter({ status: "error", error });
    if (error?.status === 401) navigateToLogin?.();
  };

  const handleCreateQuote = async () => {
    setQuoteRequest({ status: "loading", error: null });
    setTransferRequest({ status: "idle", error: null });

    try {
      const quote = await requestTransferQuote({
        recipient: transferData.recipient,
        amount: transferData.amount,
        currency: transferData.currency,
        purpose: transferData.purpose
      });

      setTransferData((prev) => ({
        ...prev,
        quote,
        quoteId: quote.id,
        transferResult: null,
        lastIdempotencyKey: ""
      }));
      setQuoteRequest({ status: "success", error: null });
      nextStep();
    } catch (error) {
      handleApiError(error, setQuoteRequest);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!transferData.quoteId) {
      setTransferRequest({
        status: "error",
        error: { message: "Create a quote before submitting the transfer." }
      });
      return;
    }

    const idempotencyKey = transferData.lastIdempotencyKey || createIdempotencyKey();
    setTransferRequest({ status: "submitting", error: null });

    try {
      const transferResult = await submitTransferRequest({
        quoteId: transferData.quoteId,
        paymentMethod: transferData.paymentMethod,
        purpose: transferData.purpose,
        amount: transferData.amount,
        currency: transferData.currency,
        recipient: transferData.recipient,
        idempotencyKey
      });

      setTransferData((prev) => ({
        ...prev,
        transferResult,
        lastIdempotencyKey: idempotencyKey
      }));
      setTransferRequest({ status: "success", error: null });
      nextStep();
    } catch (error) {
      setTransferData((prev) => ({
        ...prev,
        lastIdempotencyKey: idempotencyKey
      }));
      handleApiError(error, setTransferRequest);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.RECIPIENT:
        return <RecipientSelection selectedRecipient={transferData.recipient} onSelectRecipient={(recipient) => { updateTransferData({ recipient }); nextStep(); }} />;
      case STEPS.AMOUNT:
        return (
          <AmountInput
            recipient={transferData.recipient}
            amount={transferData.amount}
            currency={transferData.currency}
            purpose={transferData.purpose}
            quote={transferData.quote}
            quoteStatus={quoteRequest.status}
            quoteError={quoteRequest.error}
            onAmountChange={updateTransferData}
            onRequestQuote={handleCreateQuote}
            onBack={previousStep}
          />
        );
      case STEPS.PAYMENT:
        return <PaymentMethod selectedMethod={typeof transferData.paymentMethod === "string" ? transferData.paymentMethod : transferData.paymentMethod?.type} transferData={transferData} onSelectMethod={(paymentMethod) => { updateTransferData({ paymentMethod }); nextStep(); }} onBack={previousStep} />;
      case STEPS.REVIEW:
        return <ReviewTransfer transferData={transferData} transferStatus={transferRequest.status} transferError={transferRequest.error} onConfirm={handleConfirmTransfer} onBack={previousStep} />;
      case STEPS.SUCCESS:
        return <TransferSuccess transferData={transferData} onDone={resetFlow} />;
      default:
        return null;
    }
  };

  const getStepProgress = () => ((stepOrder.indexOf(currentStep) + 1) / stepOrder.length) * 100;
  if (currentStep === STEPS.SUCCESS) return renderStepContent();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" size="icon" className="hover:bg-neutral-100">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-primary">Send Money</h1>
              <p className="text-neutral-600">{stepTitles[currentStep]}</p>
            </div>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div className="gradient-primary h-2 rounded-full transition-all duration-500" style={{ width: `${getStepProgress()}%` }} />
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">{renderStepContent()}</div>
    </div>
  );
}
