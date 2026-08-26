// src/lib/payout-destinations.js
//
// The destinations a sender can actually add a recipient in.
//
// This list is deliberately derived from the corridors safetyEngine allows,
// not from the twelve currencies the pricing table happens to carry. Offering
// a destination the safety checks will later refuse produces a recipient the
// sender cannot send to — the failure belongs at the point of adding, not at
// the point of paying.
//
// Sender country is fixed to US for now. When a second sending country opens,
// this becomes a lookup on the sender's own country rather than a constant.

export const SENDER_COUNTRY_CODE = "US";

export const payoutDestinations = [
  {
    countryCode: "NG",
    country: "Nigeria",
    receiveCurrency: "NGN",
    methods: ["bank", "mobile_money"],
    defaultLimit: 2500
  },
  {
    countryCode: "KE",
    country: "Kenya",
    receiveCurrency: "KES",
    methods: ["mobile_money", "bank"],
    defaultLimit: 1500
  },
  {
    countryCode: "GH",
    country: "Ghana",
    receiveCurrency: "GHS",
    methods: ["mobile_money", "bank"],
    defaultLimit: 1800
  },
  {
    countryCode: "PH",
    country: "Philippines",
    receiveCurrency: "PHP",
    methods: ["wallet", "bank"],
    defaultLimit: 2000
  },
  {
    countryCode: "MX",
    country: "Mexico",
    receiveCurrency: "MXN",
    methods: ["bank"],
    defaultLimit: 2500
  }
];

export const payoutMethodLabels = {
  bank: "Bank transfer",
  mobile_money: "Mobile money",
  wallet: "Mobile wallet",
  cash_pickup: "Cash pickup"
};

export const deliveryEstimates = {
  bank: "Same day",
  mobile_money: "Under 30 minutes",
  wallet: "Under 1 hour",
  cash_pickup: "Same day"
};

export function getDestination(countryCode) {
  return payoutDestinations.find(
    (destination) => destination.countryCode === String(countryCode || "").toUpperCase()
  );
}

export function buildCorridor(countryCode) {
  return `${SENDER_COUNTRY_CODE}-${String(countryCode || "").toUpperCase()}`;
}
