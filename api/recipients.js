import { requireMethod, sendJson } from "./_lib/http.js";

const recipients = [
  { id: "recipient_1", name: "Amara Okafor", country: "Nigeria", method: "Bank transfer", receiveCurrency: "NGN", corridor: "US-NG", limit: 2500, risk: "Verified" },
  { id: "recipient_2", name: "Daniel Mwangi", country: "Kenya", method: "Mobile money", receiveCurrency: "KES", corridor: "US-KE", limit: 1500, risk: "Verified" },
  { id: "recipient_3", name: "Efua Mensah", country: "Ghana", method: "Wallet payout", receiveCurrency: "GHS", corridor: "US-GH", limit: 1800, risk: "Review required" }
];

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["GET"])) return;

  sendJson(response, 200, {
    mode: process.env.TRANSFER_MODE || "sandbox",
    recipients
  });
}
