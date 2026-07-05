import {
  mockExchangeProvider,
  mockFundingProvider,
  mockKycProvider,
  mockPayoutProvider,
  mockSanctionsProvider,
  mockSettlementProvider
} from "./mock-providers";
import { providerConfig } from "./provider-config";

export function createTransferOrchestrator() {
  return {
    async createQuote({ amount = 0, currency = "USD", recipient, purpose }) {
      const funding = await mockFundingProvider.estimateFunding({ amount, currency });
      const fx = await mockExchangeProvider.quote({ amount, currency, recipient });
      const payout = await mockPayoutProvider.estimatePayout({ recipient });
      const settlement = await mockSettlementProvider.prepareSettlement({ amount, currency, recipient });
      const sanctions = await mockSanctionsProvider.screenTransfer({ recipient, amount, currency, purpose });
      const kyc = await mockKycProvider.verifySender();
      const numericAmount = Number(amount || 0);
      const transferLimit = recipient?.limit || 2500;

      return {
        mode: providerConfig.mode,
        amount: numericAmount,
        currency,
        purpose,
        recipient,
        fee: funding.fee,
        total: numericAmount + funding.fee,
        rate: fx.rate,
        receiveCurrency: fx.receiveCurrency,
        receivedAmount: fx.receivedAmount,
        transferLimit,
        isOverLimit: numericAmount > transferLimit,
        expiresInSeconds: fx.expiresInSeconds,
        deliveryEstimate: payout.deliveryEstimate,
        providers: {
          kyc,
          sanctions,
          funding,
          exchange: fx,
          settlement,
          payout
        }
      };
    },

    async prepareTransfer(transferData) {
      const quote = await this.createQuote(transferData);
      return {
        ...quote,
        transferReference: `NX-${Date.now().toString().slice(-8)}`,
        nextRequiredAction: quote.providers.sanctions.status === "manual_review" ? "Compliance review" : "Payment authorization"
      };
    }
  };
}

export const transferOrchestrator = createTransferOrchestrator();
