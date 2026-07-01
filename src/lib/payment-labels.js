export function getPaymentMethodLabel(paymentMethod) {
  const type = typeof paymentMethod === "string" ? paymentMethod : paymentMethod?.type;

  const labels = {
    card: "Debit Card",
    bank: "Bank Account",
    wallet: "Digital Wallet"
  };

  return labels[type] || "Not selected";
}

export function getPaymentIntentLabel(paymentMethod) {
  return paymentMethod?.paymentIntentId || "";
}
