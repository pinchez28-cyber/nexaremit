import { requireMethod, sendJson } from "./_lib/http.js";

const recipients = [
  { id: "recipient_1", name: "Amara Okafor", country: "Nigeria", method: "Bank transfer", receiveCurrency: "NGN", corridor: "US-NG", limit: 2500, risk: "Verified" },
  { id: "recipient_2", name: "Daniel Mwangi", country: "Kenya", method: "Mobile money", receiveCurrency: "KES", corridor: "US-KE", limit: 1500, risk: "Verified" },
  { id: "recipient_3", name: "Efua Mensah", country: "Ghana", method: "Wallet payout", receiveCurrency: "GHS", corridor: "US-GH", limit: 1800, risk: "Review required" },
  { id: "recipient_4", name: "Priya Sharma", country: "India", method: "Bank transfer", receiveCurrency: "INR", corridor: "GB-IN", limit: 3000, risk: "Verified" },
  { id: "recipient_5", name: "Maria Santos", country: "Philippines", method: "Mobile wallet", receiveCurrency: "PHP", corridor: "US-PH", limit: 2000, risk: "Verified" },
  { id: "recipient_6", name: "Carlos Rivera", country: "Mexico", method: "Bank transfer", receiveCurrency: "MXN", corridor: "US-MX", limit: 2500, risk: "Verified" },
  { id: "recipient_7", name: "Ana Oliveira", country: "Brazil", method: "PIX payout", receiveCurrency: "BRL", corridor: "EU-BR", limit: 2200, risk: "Verified" },
  { id: "recipient_8", name: "Ahmed Khan", country: "Pakistan", method: "Bank transfer", receiveCurrency: "PKR", corridor: "GB-PK", limit: 1800, risk: "Review required" },
  { id: "recipient_9", name: "Nusrat Rahman", country: "Bangladesh", method: "Mobile money", receiveCurrency: "BDT", corridor: "SG-BD", limit: 1600, risk: "Verified" },
  { id: "recipient_10", name: "Thabo Mbeki", country: "South Africa", method: "Bank transfer", receiveCurrency: "ZAR", corridor: "EU-ZA", limit: 2400, risk: "Verified" },
  { id: "recipient_11", name: "Mariam Hassan", country: "Egypt", method: "Cash pickup", receiveCurrency: "EGP", corridor: "AE-EG", limit: 1700, risk: "Review required" },
  { id: "recipient_12", name: "Youssef El Amrani", country: "Morocco", method: "Bank transfer", receiveCurrency: "MAD", corridor: "EU-MA", limit: 1900, risk: "Verified" }
];

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["GET"])) return;

  sendJson(response, 200, {
    mode: process.env.TRANSFER_MODE || "sandbox",
    recipients
  });
}
