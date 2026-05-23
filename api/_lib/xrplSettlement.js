const XRPL_NETWORKS = {
  testnet: {
    label: "XRPL Testnet",
    rpcUrl: "https://s.altnet.rippletest.net:51234/",
    websocketUrl: "wss://s.altnet.rippletest.net:51233/",
    explorerUrl: "https://testnet.xrpl.org"
  },
  devnet: {
    label: "XRPL Devnet",
    rpcUrl: "https://s.devnet.rippletest.net:51234/",
    websocketUrl: "wss://s.devnet.rippletest.net:51233/",
    explorerUrl: "https://devnet.xrpl.org"
  },
  mainnet: {
    label: "XRPL Mainnet",
    rpcUrl: "https://xrplcluster.com/",
    websocketUrl: "wss://xrplcluster.com/",
    explorerUrl: "https://livenet.xrpl.org"
  }
};

function getNetworkKey() {
  const requested = String(process.env.XRPL_NETWORK || "testnet").toLowerCase();
  if (XRPL_NETWORKS[requested]) return requested;
  return "testnet";
}

function getXrplConfig() {
  const networkKey = getNetworkKey();
  const baseConfig = XRPL_NETWORKS[networkKey];
  return {
    networkKey,
    label: baseConfig.label,
    rpcUrl: process.env.XRPL_RPC_URL || baseConfig.rpcUrl,
    websocketUrl: process.env.XRPL_WEBSOCKET_URL || baseConfig.websocketUrl,
    explorerUrl: baseConfig.explorerUrl,
    treasuryAddress: process.env.XRPL_TREASURY_ADDRESS || "",
    destinationAddress: process.env.XRPL_DESTINATION_ADDRESS || "",
    issuerAddress: process.env.XRPL_ISSUER_ADDRESS || "",
    issuedCurrency: process.env.XRPL_ISSUED_CURRENCY || "USD",
    networkCheckEnabled: process.env.XRPL_NETWORK_CHECK === "true"
  };
}

function createTimeoutSignal(timeoutMs = 1800) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

async function checkXrplRpc(config) {
  const timeout = createTimeoutSignal();
  try {
    const response = await fetch(config.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "server_info", params: [{}] }),
      signal: timeout.signal
    });
    const payload = await response.json();
    return {
      checked: true,
      ok: response.ok && !payload.error,
      ledgerVersion: payload.result?.info?.validated_ledger?.seq || payload.result?.info?.validated_ledger?.ledger_index || null,
      message: payload.error_message || payload.error || "XRPL RPC reachable"
    };
  } catch (error) {
    return {
      checked: true,
      ok: false,
      ledgerVersion: null,
      message: error.name === "AbortError" ? "XRPL RPC check timed out" : error.message
    };
  } finally {
    timeout.clear();
  }
}

function createAssetDescriptor({ currency, receiveCurrency, config }) {
  if (currency === "XRP" || receiveCurrency === "XRP") {
    return {
      code: "XRP",
      type: "native",
      label: "Native XRP bridge asset"
    };
  }

  return {
    code: config.issuedCurrency,
    type: "issued_currency",
    issuer: config.issuerAddress || "issuer_not_configured",
    label: `${config.issuedCurrency} issued-currency bridge`
  };
}

function createPaymentDraft({ amount, currency, receiveCurrency, recipient, config, asset }) {
  const destination = recipient?.xrplAddress || config.destinationAddress;
  if (!config.treasuryAddress || !destination) return null;

  const baseDraft = {
    TransactionType: "Payment",
    Account: config.treasuryAddress,
    Destination: destination,
    Network: config.label,
    Memo: "NexaRemit sandbox settlement draft"
  };

  if (asset.type === "native") {
    return {
      ...baseDraft,
      Amount: String(Math.round(Number(amount || 0) * 1_000_000)),
      AmountUnit: "drops"
    };
  }

  return {
    ...baseDraft,
    Amount: {
      currency: asset.code,
      issuer: asset.issuer,
      value: String(Number(amount || 0))
    },
    SendCurrency: currency,
    ReceiveCurrency: receiveCurrency
  };
}

export async function prepareXrplSettlement({ amount, currency, receiveCurrency, recipient }) {
  const config = getXrplConfig();
  const asset = createAssetDescriptor({ currency, receiveCurrency, config });
  const draft = createPaymentDraft({ amount, currency, receiveCurrency, recipient, config, asset });
  const health = config.networkCheckEnabled ? await checkXrplRpc(config) : { checked: false, ok: null };
  const hasTreasuryAddress = Boolean(config.treasuryAddress);
  const hasIssuerForIssuedCurrency = asset.type === "native" || Boolean(config.issuerAddress);

  return {
    provider: process.env.SETTLEMENT_PROVIDER || "xrpl-sandbox",
    rail: `${config.label} settlement adapter`,
    network: config.networkKey,
    endpoint: config.networkCheckEnabled ? config.rpcUrl : "network check disabled",
    websocketUrl: config.websocketUrl,
    explorerUrl: config.explorerUrl,
    asset: asset.label,
    assetCode: asset.code,
    assetType: asset.type,
    issuerConfigured: hasIssuerForIssuedCurrency,
    treasuryConfigured: hasTreasuryAddress,
    status: hasTreasuryAddress && hasIssuerForIssuedCurrency ? "prepared" : "configuration_required",
    signingMode: "offline_or_custody_required",
    transactionDraft: draft,
    health,
    warnings: [
      "Do not store XRPL wallet seeds in browser code.",
      "Submit only on Testnet/Devnet until treasury controls, reconciliation, and compliance review are complete.",
      "Use issued currencies only after issuer, trustline, liquidity, and redemption procedures are verified."
    ]
  };
}
