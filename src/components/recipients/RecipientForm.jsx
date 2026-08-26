import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { addRecipient } from "@/lib/recipients-api";
import {
  payoutDestinations,
  payoutMethodLabels,
  getDestination,
  toE164
} from "@/lib/payout-destinations";

const inputClass =
  "w-full p-3 rounded-lg border border-neutral-300 focus:border-blue-700 focus:outline-none";

/**
 * Add a payout destination.
 *
 * The country list comes from payout-destinations, which is derived from the
 * corridors safetyEngine will actually allow. A sender therefore cannot create
 * a recipient that the payment step would later refuse.
 */
export default function RecipientForm({ onAdded, onCancel }) {
  const [countryCode, setCountryCode] = useState(payoutDestinations[0].countryCode);
  const [payoutMethod, setPayoutMethod] = useState(payoutDestinations[0].methods[0]);
  const [name, setName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountIdentifier, setAccountIdentifier] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const destination = useMemo(() => getDestination(countryCode), [countryCode]);
  const needsAccount = payoutMethod !== "cash_pickup";
  // Mobile money and wallets are addressed by phone number, so the country's
  // dialling code is shown alongside rather than left for the sender to
  // remember and type.
  const isMobileNumber = payoutMethod === "mobile_money" || payoutMethod === "wallet";
  const isUpi = payoutMethod === "upi";

  const kindOf = (method) => {
    if (method === "mobile_money" || method === "wallet") return "phone";
    if (method === "upi") return "vpa";
    return "account";
  };

  const onMethodChange = (nextMethod) => {
    if (kindOf(payoutMethod) !== kindOf(nextMethod)) setAccountIdentifier("");
    setPayoutMethod(nextMethod);
  };

  const onCountryChange = (nextCode) => {
    setCountryCode(nextCode);
    // A method valid for the old country may not exist for the new one.
    const nextDestination = getDestination(nextCode);
    if (nextDestination && !nextDestination.methods.includes(payoutMethod)) {
      setPayoutMethod(nextDestination.methods[0]);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus("saving");
    setError("");

    try {
      const recipient = await addRecipient({
        name,
        countryCode,
        payoutMethod,
        accountName,
        // Sent as E.164. Someone entering 0712 345 678 in Nairobi and someone
        // entering 712345678 should reach the same wallet.
        accountIdentifier: isMobileNumber
          ? toE164(destination?.dialCode, accountIdentifier)
          : accountIdentifier
      });
      setStatus("idle");
      setName("");
      setAccountName("");
      setAccountIdentifier("");
      onAdded?.(recipient);
    } catch (submitError) {
      setError(submitError.message);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <label htmlFor="recipient-name" className="block font-semibold text-primary mb-1">
          Who are you sending to?
        </label>
        <input
          id="recipient-name"
          className={inputClass}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Full name, as it appears on their account"
        />
      </div>

      <div>
        <label htmlFor="recipient-country" className="block font-semibold text-primary mb-1">
          Which country?
        </label>
        <select
          id="recipient-country"
          className={inputClass}
          value={countryCode}
          onChange={(event) => onCountryChange(event.target.value)}
        >
          {payoutDestinations.map((option) => (
            <option key={option.countryCode} value={option.countryCode}>
              {option.country} ({option.receiveCurrency})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="recipient-method" className="block font-semibold text-primary mb-1">
          How should they receive it?
        </label>
        <select
          id="recipient-method"
          className={inputClass}
          value={payoutMethod}
          onChange={(event) => onMethodChange(event.target.value)}
        >
          {(destination?.methods || []).map((method) => (
            <option key={method} value={method}>
              {payoutMethodLabels[method]}
            </option>
          ))}
        </select>
      </div>

      {needsAccount && (
        <>
          <div>
            <label
              htmlFor="recipient-account"
              className="block font-semibold text-primary mb-1"
            >
              {payoutMethod === "bank"
                ? "Account number"
                : isUpi
                  ? "UPI ID"
                  : "Mobile number"}
            </label>

            {isMobileNumber ? (
              <div className="flex items-stretch">
                <span
                  className="flex items-center px-3 rounded-l-lg border border-r-0 border-neutral-300 bg-neutral-100 font-semibold text-primary"
                  aria-hidden="true"
                >
                  {destination?.dialCode}
                </span>
                <input
                  id="recipient-account"
                  type="tel"
                  inputMode="tel"
                  className={`${inputClass} rounded-l-none`}
                  required
                  value={accountIdentifier}
                  onChange={(event) => setAccountIdentifier(event.target.value)}
                  placeholder={destination?.mobileExample}
                  aria-describedby="recipient-account-hint"
                />
              </div>
            ) : (
              <input
                id="recipient-account"
                className={inputClass}
                required
                value={accountIdentifier}
                onChange={(event) =>
                  // VPAs are case-insensitive and always written lowercase.
                  setAccountIdentifier(
                    isUpi ? event.target.value.toLowerCase() : event.target.value
                  )
                }
                placeholder={isUpi ? "name@okicici" : "0123456789"}
                autoCapitalize={isUpi ? "none" : undefined}
                spellCheck={isUpi ? false : undefined}
                aria-describedby={isUpi ? "recipient-account-hint" : undefined}
              />
            )}

            {isUpi && (
              <p id="recipient-account-hint" className="text-sm text-neutral-600 mt-1">
                The UPI ID your recipient uses in their payment app, for example
                name@okicici or 9876543210@ybl.
              </p>
            )}

            {isMobileNumber && (
              <p id="recipient-account-hint" className="text-sm text-neutral-600 mt-1">
                {destination?.dialCode} is added for you. Enter the rest of the
                number — leaving off a leading 0 is fine either way.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="recipient-account-name"
              className="block font-semibold text-primary mb-1"
            >
              Name on the account (optional)
            </label>
            <input
              id="recipient-account-name"
              className={inputClass}
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              placeholder="If different from above"
            />
          </div>
        </>
      )}

      {destination && (
        <p className="text-sm text-neutral-600">
          Transfers to {destination.country} are limited to{" "}
          {destination.defaultLimit.toLocaleString()} USD each.
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save recipient"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
