import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!stripeWebhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET");
}

const stripe = new Stripe(stripeSecretKey);

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

async function handlePaymentIntentSucceeded(paymentIntent) {
  const currentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);

  if (currentIntent.metadata?.recipientTransferId) {
    return {
      alreadyProcessed: true,
      recipientTransferId: currentIntent.metadata.recipientTransferId,
    };
  }

  const md = currentIntent.metadata || {};

  const referenceId =
    md.referenceId ||
    md.reference_id ||
    currentIntent.id;

  const transferId =
    md.transferId ||
    md.transfer_id ||
    referenceId;

  const recipientStripeAccountId =
    md.recipientStripeAccountId ||
    md.recipient_stripe_account_id;

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

  if (!recipientStripeAccountId) {
    throw new Error(`Missing recipientStripeAccountId metadata on PaymentIntent ${currentIntent.id}`);
  }

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
        const result = await handlePaymentIntentSucceeded(paymentIntent);

        console.log("Recipient transfer processed", {
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
