// api/_lib/xrplSettlement.js

import xrpl from "xrpl";
import { requireEnum, requireUrl } from "../../lib/env.js";
import { lazyConfig } from "./runtimeConfig.js";

const { Client, xrpToDrops } = xrpl;

// Resolved on first use rather than at import: this module is pulled in by
// every settlement route, so validating here at module scope took those
// routes down with an unreadable 500 whenever a variable was unset.
export const settlementConfigSpec = {
  settlementProvider: [
    "SETTLEMENT_PROVIDER",
    (env) => requireEnum(env, "SETTLEMENT_PROVIDER", ["xrpl-mainnet"]),
  ],
  xrplNetwork: [
    "XRPL_NETWORK",
    (env) => requireEnum(env, "XRPL_NETWORK", ["mainnet"]),
  ],
  xrplServerUrl: [
    "XRPL_SERVER_URL",
    (env) => requireUrl(env, "XRPL_SERVER_URL", ["wss:", "https:"]),
  ],
};

const lazyGetConfig = lazyConfig(settlementConfigSpec);

export function getXrplSettlementConfig() {
  return lazyGetConfig();
}

export function assertProductionSettlementConfig() {
  if (getXrplSettlementConfig().settlementProvider !== "xrpl-mainnet") {
    throw new Error(
      `[xrplSettlement] Invalid settlement provider: ${getXrplSettlementConfig().settlementProvider}`
    );
  }

  if (getXrplSettlementConfig().xrplNetwork !== "mainnet") {
    throw new Error(
      `[xrplSettlement] Invalid XRPL network: ${getXrplSettlementConfig().xrplNetwork}`
    );
  }

  return getXrplSettlementConfig();
}

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`[xrplSettlement] ${fieldName} is required`);
  }
  return value.trim();
}

function normalizeAmountToDrops({ amountXrp, amountDrops }) {
  if (amountDrops != null) {
    const normalized = String(amountDrops).trim();
    if (!/^\d+$/.test(normalized)) {
      throw new Error(
        `[xrplSettlement] amountDrops must be a positive integer string in drops. Received: ${amountDrops}`
      );
    }
    if (normalized === "0") {
      throw new Error("[xrplSettlement] amountDrops must be greater than 0");
    }
    return normalized;
  }

  if (amountXrp == null) {
    throw new Error(
      "[xrplSettlement] Either amountDrops or amountXrp must be provided"
    );
  }

  const normalizedXrp = String(amountXrp).trim();
  if (!/^\d+(\.\d+)?$/.test(normalizedXrp)) {
    throw new Error(
      `[xrplSettlement] amountXrp must be numeric. Received: ${amountXrp}`
    );
  }

  const drops = xrpToDrops(normalizedXrp);
  if (!/^\d+$/.test(drops) || drops === "0") {
    throw new Error(
      `[xrplSettlement] Converted XRP amount must be greater than 0. Received: ${amountXrp}`
    );
  }

  return drops;
}

function encodeMemo(memo) {
  if (!memo) return undefined;

  const memoString =
    typeof memo === "string"
      ? memo
      : typeof memo === "object"
        ? JSON.stringify(memo)
        : String(memo);

  return [
    {
      Memo: {
        MemoData: Buffer.from(memoString, "utf8").toString("hex").toUpperCase(),
      },
    },
  ];
}

async function createConnectedClient() {
  assertProductionSettlementConfig();

  const client = new Client(getXrplSettlementConfig().xrplServerUrl);
  await client.connect();
  return client;
}

async function disconnectQuietly(client) {
  if (!client) return;
  try {
    if (client.isConnected()) {
      await client.disconnect();
    }
  } catch {
    // no-op
  }
}

export async function withXrplClient(handler) {
  const client = await createConnectedClient();

  try {
    return await handler(client);
  } finally {
    await disconnectQuietly(client);
  }
}

export async function getNetworkInfo() {
  return withXrplClient(async (client) => {
    const serverInfo = await client.request({ command: "server_info" });

    return {
      provider: getXrplSettlementConfig().settlementProvider,
      network: getXrplSettlementConfig().xrplNetwork,
      serverUrl: getXrplSettlementConfig().xrplServerUrl,
      serverInfo: serverInfo.result,
    };
  });
}

export async function getAccountInfo(address) {
  const account = assertNonEmptyString(address, "address");

  return withXrplClient(async (client) => {
    const response = await client.request({
      command: "account_info",
      account,
      ledger_index: "validated",
    });

    return response.result;
  });
}

export async function prepareSettlement({
  sourceAddress,
  destinationAddress,
  amountDrops,
  amountXrp,
  memo,
  destinationTag,
  feeDrops,
  lastLedgerSequence,
}) {
  const source = assertNonEmptyString(sourceAddress, "sourceAddress");
  const destination = assertNonEmptyString(
    destinationAddress,
    "destinationAddress"
  );
  const normalizedAmountDrops = normalizeAmountToDrops({
    amountXrp,
    amountDrops,
  });

  return withXrplClient(async (client) => {
    const tx = {
      TransactionType: "Payment",
      Account: source,
      Destination: destination,
      Amount: normalizedAmountDrops,
    };

    if (destinationTag != null) {
      const tag = Number(destinationTag);
      if (!Number.isInteger(tag) || tag < 0) {
        throw new Error(
          `[xrplSettlement] destinationTag must be a non-negative integer. Received: ${destinationTag}`
        );
      }
      tx.DestinationTag = tag;
    }

    const memos = encodeMemo(memo);
    if (memos) {
      tx.Memos = memos;
    }

    const autofilled = await client.autofill(tx);

    if (feeDrops != null) {
      const normalizedFee = String(feeDrops).trim();
      if (!/^\d+$/.test(normalizedFee) || normalizedFee === "0") {
        throw new Error(
          `[xrplSettlement] feeDrops must be a positive integer string. Received: ${feeDrops}`
        );
      }
      autofilled.Fee = normalizedFee;
    }

    if (lastLedgerSequence != null) {
      const lls = Number(lastLedgerSequence);
      if (!Number.isInteger(lls) || lls <= 0) {
        throw new Error(
          `[xrplSettlement] lastLedgerSequence must be a positive integer. Received: ${lastLedgerSequence}`
        );
      }
      autofilled.LastLedgerSequence = lls;
    }

    return {
      provider: getXrplSettlementConfig().settlementProvider,
      network: getXrplSettlementConfig().xrplNetwork,
      serverUrl: getXrplSettlementConfig().xrplServerUrl,
      transaction: autofilled,
      signingRequired: true,
      submitMode: "signed_blob_required",
    };
  });
}

export async function submitSignedSettlement({
  signedTransaction,
  failHard = false,
}) {
  const txBlob = assertNonEmptyString(signedTransaction, "signedTransaction");

  return withXrplClient(async (client) => {
    const result = await client.submit(txBlob, { failHard });

    return {
      provider: getXrplSettlementConfig().settlementProvider,
      network: getXrplSettlementConfig().xrplNetwork,
      serverUrl: getXrplSettlementConfig().xrplServerUrl,
      result: result.result ?? result,
    };
  });
}

export async function submitAndWaitSignedSettlement({
  signedTransaction,
  failHard = false,
}) {
  const txBlob = assertNonEmptyString(signedTransaction, "signedTransaction");

  return withXrplClient(async (client) => {
    const result = await client.submitAndWait(txBlob, { failHard });

    return {
      provider: getXrplSettlementConfig().settlementProvider,
      network: getXrplSettlementConfig().xrplNetwork,
      serverUrl: getXrplSettlementConfig().xrplServerUrl,
      result: result.result ?? result,
    };
  });
}

const xrplSettlement = Object.freeze({
  name: "xrpl-mainnet",
  get provider() {
    return getXrplSettlementConfig().settlementProvider;
  },
  get network() {
    return getXrplSettlementConfig().xrplNetwork;
  },
  get serverUrl() {
    return getXrplSettlementConfig().xrplServerUrl;
  },
  getXrplSettlementConfig,
  assertProductionSettlementConfig,
  withXrplClient,
  getNetworkInfo,
  getAccountInfo,
  prepareSettlement,
  submitSignedSettlement,
  submitAndWaitSignedSettlement,
});

export default xrplSettlement;
