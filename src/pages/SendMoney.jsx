import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RecipientSelection from "../components/send/RecipientSelection";
import AmountInput from "../components/send/AmountInput";
import PaymentMethod from "../components/send/PaymentMethod";
import ReviewTransfer from "../components/send/ReviewTransfer";
import TransferSuccess from "../components/send/TransferSuccess";

const STEPS = {
  RECIPIENT: "recipient",
  AMOUNT: "amount",
  PAYMENT: "payment",
  REVIEW: "review",
  SUCCESS: "success"
};

export default function SendMoney() {
  const [currentStep, setCurrentStep] = useState(STEPS.RECIPIENT);
  const [transferData, setTransferData] = useState({
    recipient: null,
    amount: null,
    currency: "USD",
    paymentMethod: null,
    purpose: "family_support"
  });

  const stepTitles = {
    [STEPS.RECIPIENT]: "Select Recipient",
    [STEPS.AMOUNT]: "Enter Amount",
    [STEPS.PAYMENT]: "Payment Method",
    [STEPS.REVIEW]: "Review Transfer",
    [STEPS.SUCCESS]: "Transfer Complete"
  };

  const updateTransferData = (data) => setTransferData((prev) => ({ ...prev, ...data }));
  const stepOrder = Object.values(STEPS);
  const nextStep = () => setCurrentStep((step) => stepOrder[Math.min(stepOrder.indexOf(step) + 1, stepOrder.length - 1)]);
  const previousStep = () => setCurrentStep((step) => stepOrder[Math.max(stepOrder.indexOf(step) - 1, 0)]);

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.RECIPIENT:
        return <RecipientSelection selectedRecipient={transferData.recipient} onSelectRecipient={(recipient) => { updateTransferData({ recipient }); nextStep(); }} />;
      case STEPS.AMOUNT:
        return <AmountInput recipient={transferData.recipient} amount={transferData.amount} currency={transferData.currency} purpose={transferData.purpose} onAmountChange={updateTransferData} onNext={nextStep} onBack={previousStep} />;
      case STEPS.PAYMENT:
        return <PaymentMethod selectedMethod={transferData.paymentMethod} onSelectMethod={(paymentMethod) => { updateTransferData({ paymentMethod }); nextStep(); }} onBack={previousStep} />;
      case STEPS.REVIEW:
        return <ReviewTransfer transferData={transferData} onConfirm={nextStep} onBack={previousStep} />;
      case STEPS.SUCCESS:
        return <TransferSuccess transferData={transferData} onDone={() => setCurrentStep(STEPS.RECIPIENT)} />;
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
