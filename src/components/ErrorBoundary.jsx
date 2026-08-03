import React from "react";

/**
 * Catches render-time errors in the routed page tree so a single broken page
 * (or a misconfigured environment variable) degrades to a readable message
 * instead of a blank white screen for the entire app.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[NexaRemit] Unhandled render error:", error, info);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const message =
      this.state.error?.message || "An unexpected error occurred.";
    const isConfigError = message.startsWith("[env]");

    return (
      <div style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            padding: 20,
            borderRadius: 12,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#991b1b",
          }}
        >
          <h2 style={{ margin: "0 0 8px 0", fontSize: 18 }}>
            {isConfigError
              ? "This page is not configured yet"
              : "Something went wrong on this page"}
          </h2>

          <p style={{ margin: "0 0 12px 0" }}>
            {isConfigError
              ? "A required environment variable is missing or invalid, so this section can't load. The rest of the site still works."
              : "The rest of the site is still available. Try going back, or reload the page."}
          </p>

          <code
            style={{
              display: "block",
              padding: 12,
              borderRadius: 8,
              background: "#ffffff",
              border: "1px solid #fecaca",
              fontSize: 13,
              wordBreak: "break-word",
            }}
          >
            {message}
          </code>

          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #991b1b",
                background: "#ffffff",
                color: "#991b1b",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "#0f766e",
                color: "#ffffff",
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
