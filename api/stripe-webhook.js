import Stripe from "stripe";
import { recordFundedPayout } from "../src/server/_lib/payoutRecords.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Lazy init so missing env vars produce a clean response instead of crashing
// the function at module load.
let stripeSingleton = null;
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeSingleton) stripeSingleton = new Stripe(key);
  return stripeSingleton;
}

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function handlePaymentIntentSucceeded(stripe, paymentIntent) {
  const currentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);

  if (currentIntent.metadata?.recipientTransferId) {
    return {
      alreadyProcessed: true,
      recipientTransferId: currentIntent.metadata.recipientTransferId,
    };
  }

  const md = currentIntent.metadata || {};

  const recipientStripeAccountId =
    md.recipientStripeAccountId ||
    md.recipient_stripe_account_id;

  // Funding-only charge: the primary NexaRemit flow funds the platform here and
  // pays the recipient through a payout provider, so there is no Stripe
  // Connect recipient. Do
  // NOT throw (that would 500 and make Stripe retry the webhook forever) — just
  // acknowledge the funding event.
  if (!recipientStripeAccountId) {
    // Funding confirmed. Record what is now owed to the recipient, even though
    // nothing can deliver it yet — the row sits in awaiting_provider until a
    // payout partner is connected. Without this a funded transfer left no
    // trace of the obligation at all.
    //
    // A failure here must not throw: Stripe would retry the webhook forever,
    // and the money is already taken either way. Log it and acknowledge.
    try {
      const { payout, created } = await recordFundedPayout({
        transferId: md.transferId || md.transfer_id || currentIntent.id,
        userId: md.userId || "",
        recipientId: md.recipientId || null,
        recipientName: md.recipientName || "Unknown recipient",
        corridor: md.corridor || "",
        payoutMethod: md.payoutMethod || "",
        destinationMasked: md.destinationMasked || "",
        sendAmountMinor: Number(md.sendAmountMinor || currentIntent.amount || 0),
        sendCurrency: currentIntent.currency || "usd",
        receiveAmountMinor: Number(md.receiveAmountMinor || 0),
        receiveCurrency: md.receiveCurrency || "",
        quotedRate: md.quotedRate ? Number(md.quotedRate) : null,
        metadata: { paymentIntentId: currentIntent.id },
      });

      return {
        fundingOnly: true,
        paymentIntentId: currentIntent.id,
        payoutId: payout?.id || null,
        payoutStatus: payout?.status || null,
        payoutCreated: created,
      };
    } catch (payoutError) {
      console.error(
        `[stripe-webhook] funded ${currentIntent.id} but could not record the payout: ${payoutError.message}`
      );
      return {
        fundingOnly: true,
        paymentIntentId: currentIntent.id,
        payoutRecorded: false,
        payoutError: payoutError.message,
      };
    }
  }

  const referenceId =
    md.referenceId ||
    md.reference_id ||
    currentIntent.id;

  const transferId =
    md.transferId ||
    md.transfer_id ||
    referenceId;

  const recipientAmountMinor = Number(
    md.recipientAmountMinor ||
    md.recipient_amount_minor ||
    0
  );

  const recipientCurrency = String(
    md.recipientCurrency ||
    md.recipient_currency ||
    currentIntent.currency
  ).toLowerCase();

  const transferGroup =
    md.transferGroup ||
    md.transfer_group ||
    `remit_${transferId}`;

  const sourceTransaction =
    typeof currentIntent.latest_charge === "string"
      ? currentIntent.latest_charge
      : currentIntent.latest_charge?.id;

  if (!Number.isFinite(recipientAmountMinor) || recipientAmountMinor <= 0) {
    throw new Error(`Invalid recipientAmountMinor metadata on PaymentIntent ${currentIntent.id}`);
  }

  if (!sourceTransaction) {
    throw new Error(`Missing latest_charge on succeeded PaymentIntent ${currentIntent.id}`);
  }

  const transfer = await stripe.transfers.create(
    {
      amount: recipientAmountMinor,
      currency: recipientCurrency,
      destination: recipientStripeAccountId,
      source_transaction: sourceTransaction,
      transfer_group: transferGroup,
      description: `NexaRemit recipient transfer for ${referenceId}`,
      metadata: {
        paymentIntentId: currentIntent.id,
        referenceId,
        transferId,
        transferGroup,
        source: "stripe-webhook",
      },
    },
    {
      idempotencyKey: `recipient-transfer-${currentIntent.id}`,
    }
  );

  await stripe.paymentIntents.update(currentIntent.id, {
    metadata: {
      recipientTransferId: transfer.id,
      recipientTransferStatus: "created",
      recipientTransferTriggeredAt: new Date().toISOString(),
    },
  });

  return {
    alreadyProcessed: false,
    recipientTransferId: transfer.id,
    transferGroup,
  };
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.error("Payment failed", {
    paymentIntentId: paymentIntent.id,
    lastPaymentError: paymentIntent.last_payment_error?.message || null,
    metadata: paymentIntent.metadata || {},
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method not allowed. Use POST." });
  }

  const stripe = getStripe();
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !stripeWebhookSecret) {
    return json(res, 500, {
      ok: false,
      error: "Server is missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET",
    });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return json(res, 400, { ok: false, error: "Missing Stripe-Signature header" });
  }

  let event;

  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return json(res, 400, {
      ok: false,
      error: "Invalid webhook signature",
      message: err.message,
    });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const result = await handlePaymentIntentSucceeded(stripe, paymentIntent);

        console.log("Payment intent succeeded", {
          paymentIntentId: paymentIntent.id,
          result,
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
        break;
    }

    return json(res, 200, { ok: true, received: true, eventType: event.type });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    return json(res, 500, {
      ok: false,
      error: "Webhook processing failed",
      message: err.message,
    });
  }
}
