import React from "react";
import { Link } from "react-router-dom";
import LegalPage, { LegalSection } from "@/components/legal/LegalPage";

/**
 * Privacy Policy.
 *
 * Written from what the code actually does, not from a template. Every claim
 * here is checkable against the schema in supabase/schema.sql and the routes
 * under api/ — if one of those changes, this page has to change with it.
 *
 * Two claims worth protecting in particular, because they are the ones a
 * customer would most reasonably worry about:
 *
 *   - We do not store identity documents. kyc_records holds a provider name,
 *     an inquiry id, a status and metadata. The passport photo and the selfie
 *     stay with Persona.
 *   - We do not store card numbers. Stripe collects those directly in its own
 *     iframe; transfer_records holds a payment intent id.
 */
export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate="29 August 2026"
      summary="We collect what we need to verify who you are and to move money lawfully, and we keep records for as long as US money transmission rules require. We do not sell your data, and we do not store your ID documents or your card number."
    >
      <LegalSection heading="Who we are">
        <p>
          NexaRemit is operated from Springfield, Massachusetts, United States.
          You can reach us at{" "}
          <a className="underline" href="mailto:support@nexaremit.com">
            support@nexaremit.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <p>
          <strong>Account details.</strong> Your email address, and your phone
          number if you sign in with one. These come from you when you create an
          account.
        </p>
        <p>
          <strong>Identity verification results.</strong> When you verify your
          identity, our provider Persona collects your government ID, a selfie,
          and the details on the document. Persona performs the check and tells
          us the outcome. We store the name of the provider, the id of your
          verification, and whether it passed. We do not receive or store the
          images.
        </p>
        <p>
          <strong>Recipients you save.</strong> The recipient&apos;s name,
          country, payout method, and the account, wallet, or phone number the
          money is going to.
        </p>
        <p>
          <strong>Transfer records.</strong> Amounts, currencies, the exchange
          rate you were quoted, the recipient, and the status of the transfer.
        </p>
        <p>
          <strong>Payment records.</strong> Card payments are collected by
          Stripe directly. Your card number never reaches our servers. We store
          Stripe&apos;s reference for the payment.
        </p>
        <p>
          <strong>Compliance records.</strong> A log of the checks run before
          each transfer — identity, screening, risk, and the limits applied —
          and their outcomes.
        </p>
        <p>
          <strong>Waitlist entries.</strong> If you ask to be told when a
          funding method launches, we keep your email and what you were trying
          to send.
        </p>
        <p>
          <strong>Technical logs.</strong> Our host, Vercel, records standard
          web server information including IP addresses.
        </p>
        <p>
          We do not use advertising trackers or analytics cookies. The only
          cookies we set are the ones that keep you signed in.
        </p>
      </LegalSection>

      <LegalSection heading="Why we collect it">
        <p>
          <strong>To provide the service.</strong> We cannot send money to
          someone without knowing who they are and where the money is going.
        </p>
        <p>
          <strong>Because the law requires it.</strong> US anti-money-laundering
          rules require a money services business to verify its customers,
          screen them against sanctions lists, monitor for suspicious activity,
          and keep records of what it did. That is not something we can opt out
          of at your request.
        </p>
        <p>
          <strong>To keep the service safe.</strong> Limits and checks exist to
          make fraud and structuring harder.
        </p>
      </LegalSection>

      <LegalSection heading="Who we share it with">
        <p>
          <strong>Service providers</strong>, each doing one job for us:
          Supabase (accounts and database), Persona (identity verification),
          Stripe (payments), and Vercel (hosting). They act on our instructions
          and may not use your data for their own purposes.
        </p>
        <p>
          <strong>Payout partners.</strong> When we are able to deliver money in
          your recipient&apos;s country, we will have to pass the recipient
          details to the partner delivering it. No such partner is connected
          today.
        </p>
        <p>
          <strong>Authorities.</strong> We will disclose information where the
          law requires it — including reports to FinCEN, responses to lawful
          requests, and information a regulator is entitled to inspect.
        </p>
        <p>
          <strong>We do not sell your personal information</strong>, and we do
          not share it for advertising.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          US Treasury rules (31 CFR 1010.410) require records of money
          transmission to be kept for <strong>five years</strong>. Transfer
          records, payout records, identity verification results, and the
          compliance audit trail are kept for that period, and we cannot delete
          them earlier at your request.
        </p>
        <p>
          Everything else — your saved recipients, your waitlist entry, your
          sign-in — is deleted when you close your account.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <p>
          <strong>Stop the emails.</strong> You can leave the funding list from
          your{" "}
          <Link className="underline" to="/Account">
            account page
          </Link>{" "}
          without giving up your account.
        </p>
        <p>
          <strong>Close your account.</strong> Also from the account page. This
          deletes your saved recipients, your waitlist entry, and your sign-in.
          The page shows you what it cannot delete, and why, before you confirm.
        </p>
        <p>
          <strong>See or correct what we hold.</strong> Email us and we will
          tell you what is on file for you.
        </p>
        <p>
          Depending on where you live, you may have additional rights over your
          personal information. Ask us and we will honour them as far as the
          record-keeping rules above allow.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          Traffic is encrypted in transit. Access to customer data is restricted
          by row-level security, so one signed-in customer cannot read another
          customer&apos;s records. Sensitive credentials are held server-side
          and are never sent to your browser.
        </p>
        <p>
          No system is perfectly secure. If we discover a breach affecting your
          information, we will tell you and the relevant authorities as the law
          requires.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          NexaRemit is not for anyone under 18. We do not knowingly collect
          information from children.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          If we change how we handle your information, we will update this page
          and change the effective date at the top. If the change is
          significant, we will tell you directly.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
