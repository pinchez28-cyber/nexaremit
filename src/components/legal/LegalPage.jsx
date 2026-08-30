import React from "react";
import { Link } from "react-router-dom";

/**
 * Shared shell for the Terms and Privacy pages.
 *
 * Plain prose, one column, no cards. These are documents people need to be
 * able to read and quote back at us, not dashboard widgets.
 */
export default function LegalPage({ title, effectiveDate, summary, children }) {
  return (
    <div className="min-h-screen bg-white p-6">
      <article className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Effective {effectiveDate}
        </p>

        {summary && (
          <p className="text-lg text-neutral-700 border-l-4 border-neutral-200 pl-4 mb-8">
            {summary}
          </p>
        )}

        <div className="legal-prose space-y-6 text-neutral-700 leading-relaxed">
          {children}
        </div>

        <hr className="my-10 border-neutral-200" />

        <p className="text-sm text-neutral-500">
          Questions about this page:{" "}
          <a className="underline" href="mailto:support@nexaremit.com">
            support@nexaremit.com
          </a>
          . See also our{" "}
          <Link className="underline" to="/Terms">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link className="underline" to="/Privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </article>
    </div>
  );
}

/** Section heading, so the two documents stay visually consistent. */
export function LegalSection({ heading, children }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-primary mt-8 mb-3">{heading}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
