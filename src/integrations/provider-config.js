export const providerConfig = {
  mode: import.meta.env.VITE_TRANSFER_MODE || "sandbox",
  kycProvider: import.meta.env.VITE_KYC_PROVIDER || "mock-kyc",
  sanctionsProvider: import.meta.env.VITE_SANCTIONS_PROVIDER || "mock-screening",
  fundingProvider: import.meta.env.VITE_FUNDING_PROVIDER || "mock-card-bank",
  exchangeProvider: import.meta.env.VITE_EXCHANGE_PROVIDER || "mock-fx",
  settlementProvider: import.meta.env.VITE_SETTLEMENT_PROVIDER || "mock-xrpl",
  payoutProvider: import.meta.env.VITE_PAYOUT_PROVIDER || "mock-payout"
};

export const integrationChecklist = [
  { key: "kyc", label: "KYC identity verification", provider: providerConfig.kycProvider, required: "Verify senders and high-risk receivers before transfer creation." },
  { key: "sanctions", label: "Sanctions and watchlist screening", provider: providerConfig.sanctionsProvider, required: "Screen sender, receiver, countries, and wallet addresses." },
  { key: "funding", label: "Sender funding", provider: providerConfig.fundingProvider, required: "Charge card, debit bank account, or collect local payment." },
  { key: "exchange", label: "FX and exchange quote", provider: providerConfig.exchangeProvider, required: "Lock rates, fees, spread, and quote expiration." },
  { key: "settlement", label: "Settlement rail", provider: providerConfig.settlementProvider, required: "Move value using bank rails, stablecoin rails, XRPL, or partner treasury." },
  { key: "payout", label: "Receiver payout", provider: providerConfig.payoutProvider, required: "Deliver to bank account, mobile money, wallet, or cash pickup." }
];
