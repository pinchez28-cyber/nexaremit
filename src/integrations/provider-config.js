export const providerConfig = {
  mode: import.meta.env.VITE_TRANSFER_MODE || "testnet",
  kycProvider: import.meta.env.VITE_KYC_PROVIDER || "persona-test",
  sanctionsProvider: import.meta.env.VITE_SANCTIONS_PROVIDER || "screening-rules",
  fundingProvider: import.meta.env.VITE_FUNDING_PROVIDER || "stripe-card",
  exchangeProvider: import.meta.env.VITE_EXCHANGE_PROVIDER || "quote-engine",
  settlementProvider: import.meta.env.VITE_SETTLEMENT_PROVIDER || "xrpl",
  xrplNetwork: import.meta.env.VITE_XRPL_NETWORK || "testnet",
  xrplAsset: import.meta.env.VITE_XRPL_ASSET || "USD issued currency",
  payoutProvider: import.meta.env.VITE_PAYOUT_PROVIDER || "payout-queue"
};

export const integrationChecklist = [
  { key: "kyc", label: "KYC identity verification", provider: providerConfig.kycProvider, required: "Verify senders and high-risk receivers before transfer creation." },
  { key: "sanctions", label: "Sanctions and watchlist screening", provider: providerConfig.sanctionsProvider, required: "Screen sender, receiver, countries, and wallet addresses." },
  { key: "funding", label: "Sender funding", provider: providerConfig.fundingProvider, required: "Charge card, debit bank account, or collect local payment." },
  { key: "exchange", label: "FX and exchange quote", provider: providerConfig.exchangeProvider, required: "Lock rates, fees, spread, and quote expiration." },
  { key: "settlement", label: "XRPL settlement rail", provider: `${providerConfig.settlementProvider} (${providerConfig.xrplNetwork})`, required: "Prepare and submit XRPL Testnet settlement before any mainnet value movement." },
  { key: "payout", label: "Receiver payout", provider: providerConfig.payoutProvider, required: "Deliver to bank account, mobile money, wallet, or cash pickup." }
];
