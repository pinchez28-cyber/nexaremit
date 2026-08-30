import React from "react";
import { Link } from "react-router-dom";
import LegalPage, { LegalSection } from "@/components/legal/LegalPage";

/**
 * Terms of Service.
 *
 * These describe the service as it actually exists today, which is not a
 * working remittance service: there is no state money transmitter licence, no
 * payout partner, and Stripe is in test mode. Publishing terms that promise
 * international transfers would be a claim the product cannot honour, and the
 * gap between the two is exactly what a regulator or a chargeback would look
 * at.
 *
 * When the licence and a payout partner are in place, the "What NexaRemit can
 * and cannot do today" section has to be rewritten and the transfer terms
 * filled in properly. This file is the place that happens.
 */
export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      effectiveDate="29 August 2026"
      summary="NexaRemit is being built. You can create an account and verify your identity, but we are not yet licensed to transmit money and cannot send transfers. These terms cover what the service does today."
    >
      <LegalSection heading="Agreeing to these terms">
        <p>
          By creating an account you agree to these terms. If you do not agree,
          do not create an account.
        </p>
        <p>
          These terms are between you and NexaRemit, operated from Springfield,
          Massachusetts, United States.
        </p>
      </LegalSection>

      <LegalSection heading="What NexaRemit can and cannot do today">
        <p>
          We are honest about this because the alternative is worse for you than
          it is for us.
        </p>
        <p>
          <strong>NexaRemit is not currently licensed as a money transmitter</strong>{" "}
          and does not currently move money. No payout partner is connected, so
          no transfer can be delivered to a recipient in any country. Card
          processing is in test mode, so no real payment can be taken.
        </p>
        <p>
          What works today: creating an account, verifying your identity, saving
          recipients, seeing what a transfer would cost, and joining the list to
          be told when funding opens.
        </p>
        <p>
          We will not accept money from you for a transfer until we are licensed
          to move it and able to deliver it. If that changes, these terms will
          change with it, and we will tell you.
        </p>
      </LegalSection>

      <LegalSection heading="Who can use NexaRemit">
        <p>
          You must be at least 18 years old and a resident of the United States.
          You must use your own identity — accounts opened in someone
          else&apos;s name, or on someone else&apos;s behalf, are not permitted.
        </p>
      </LegalSection>

      <LegalSection heading="Your account">
        <p>
          Keep your sign-in details to yourself. You are responsible for
          activity on your account. Tell us promptly if you think someone else
          has access to it.
        </p>
        <p>
          Give us accurate information and keep it current. We may suspend or
          close an account where the information is false, where verification
          fails, or where we are required to.
        </p>
      </LegalSection>

      <LegalSection heading="Identity verification">
        <p>
          Before you can send money we have to verify who you are. This is a
          legal requirement, not a preference, and there is no way to use a
          money transmission service without it.
        </p>
        <p>
          Verification is carried out by Persona. If it does not pass, we cannot
          offer you the service. See our{" "}
          <Link className="underline" to="/Privacy">
            Privacy Policy
          </Link>{" "}
          for what is collected and what we keep.
        </p>
      </LegalSection>

      <LegalSection heading="What you may not do">
        <p>You may not use NexaRemit:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            to send money to or from anyone subject to US sanctions, or in a
            sanctioned country
          </li>
          <li>
            to launder money, finance terrorism, evade tax, or disguise the
            source of funds
          </li>
          <li>
            to break up a larger amount into smaller transfers to avoid
            reporting thresholds
          </li>
          <li>on behalf of someone whose identity you are concealing from us</li>
          <li>for anything illegal under US law or the law where the money lands</li>
        </ul>
        <p>
          We refuse or reverse anything that looks like the above, and we report
          it where we are required to. We are not always permitted to tell you
          when we have done so.
        </p>
      </LegalSection>

      <LegalSection heading="Limits">
        <p>
          Daily and monthly sending limits apply to every account, along with a
          limit on how many transfers you can make in a day. Limits exist to
          make fraud and structuring harder, and we may lower them for an
          individual account without notice where we have reason to.
        </p>
      </LegalSection>

      <LegalSection heading="Pricing">
        <p>
          Before you pay anything, we show you the fee, the exchange rate, and
          the amount your recipient receives. The amount you are charged is the
          amount you were quoted. If we cannot honour a quote, we will not take
          the payment.
        </p>
        <p>
          Exchange rates move. A quote is good for the session in which it was
          given.
        </p>
      </LegalSection>

      <LegalSection heading="Closing your account">
        <p>
          You can close your account at any time from your{" "}
          <Link className="underline" to="/Account">
            account page
          </Link>
          . We cannot close an account while a transfer is still owed to a
          recipient, and some records have to be kept for five years after
          closure — the page explains which, and why, before you confirm.
        </p>
        <p>
          We may close or suspend your account if you break these terms, if
          verification fails, or if we are required to.
        </p>
      </LegalSection>

      <LegalSection heading="No warranty">
        <p>
          The service is provided as it is. We do not promise it will be
          uninterrupted or error-free, and we do not guarantee any particular
          exchange rate or delivery time in advance of quoting one.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the extent the law allows, NexaRemit is not liable for indirect or
          consequential losses. Nothing in these terms limits any right you have
          under US consumer protection law, including the remittance transfer
          rules, once those apply to a transfer you have paid for.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the laws of the Commonwealth of
          Massachusetts and the United States.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          We will update this page when the service changes and change the
          effective date at the top. Continuing to use NexaRemit after a change
          means you accept the updated terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
