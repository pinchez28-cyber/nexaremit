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
    dialCode: "+234",
    mobileExample: "801 234 5678",
    country: "Nigeria",
    receiveCurrency: "NGN",
    methods: ["bank", "mobile_money"],
    defaultLimit: 2500
  },
  {
    countryCode: "KE",
    dialCode: "+254",
    mobileExample: "712 345 678",
    country: "Kenya",
    receiveCurrency: "KES",
    methods: ["mobile_money", "bank"],
    defaultLimit: 1500
  },
  {
    countryCode: "GH",
    dialCode: "+233",
    mobileExample: "24 123 4567",
    country: "Ghana",
    receiveCurrency: "GHS",
    methods: ["mobile_money", "bank"],
    defaultLimit: 1800
  },
  {
    countryCode: "PH",
    dialCode: "+63",
    mobileExample: "917 123 4567",
    country: "Philippines",
    receiveCurrency: "PHP",
    methods: ["wallet", "bank"],
    defaultLimit: 2000
  },
  {
    countryCode: "MX",
    dialCode: "+52",
    mobileExample: "55 1234 5678",
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

/**
 * Turn what someone types into an E.164 number.
 *
 * People give their own number the way they say it at home - 0712 345 678 in
 * Kenya, 0801... in Nigeria - and a payout provider needs +254712345678. The
 * leading zero is a national trunk prefix that must be dropped once a country
 * code is present, so keeping it produces a number that looks right and does
 * not exist.
 */
export function toE164(dialCode, localNumber) {
  const digits = String(localNumber || "").replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return "";

  const code = String(dialCode || "").replace(/\D/g, "");
  // Already includes the country code, e.g. pasted as 254712345678.
  if (code && digits.startsWith(code)) return `+${digits}`;

  return `+${code}${digits}`;
}

export function buildCorridor(countryCode) {
  return `${SENDER_COUNTRY_CODE}-${String(countryCode || "").toUpperCase()}`;
}
