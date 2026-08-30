import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell, LockKeyhole, LogIn, LogOut, ShieldCheck } from "lucide-react";
import Logo from "@/components/branding/Logo";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Start Here", to: createPageUrl("Setup") },
  { label: "Send Money", to: createPageUrl("SendMoney") },
  { label: "Cards", to: createPageUrl("PaymentMethods") },
  { label: "Dashboard", to: createPageUrl("Dashboard") },
  { label: "History", to: createPageUrl("History") },
  { label: "Recipients", to: createPageUrl("Recipients") },
  { label: "Partners", to: createPageUrl("Integrations") },
  { label: "Safety", to: createPageUrl("SecurityCompliance") }
];

export default function AppShell({ children }) {
  const { isAuthConfigured, isAuthenticated, signOut, user } = useAuth();

  // The signed-in and signed-out states used to differ only by the direction of
  // an arrow icon, which is not a difference anyone can see. Showing the
  // account it belongs to makes "am I signed in?" answerable at a glance.
  const accountLabel = user?.email || user?.phone || "Account";
  const accountInitial = accountLabel.slice(0, 1).toUpperCase();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="max-w-7xl mx-auto app-header-inner">
          <Link to="/" aria-label="Go to NexaRemit home">
            <Logo className="app-logo" />
          </Link>

          <nav className="app-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => `app-nav-link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <div className="header-trust">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Transfer</span>
            </div>

            <button type="button" className="icon-button" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>

            {isAuthConfigured &&
              (isAuthenticated ? (
                <div className="header-account">
                  <Link
                    to="/Account"
                    className="header-account-chip"
                    title={`Signed in as ${accountLabel}`}
                  >
                    <span className="header-account-avatar" aria-hidden="true">
                      {accountInitial}
                    </span>
                    <span className="header-account-email">{accountLabel}</span>
                  </Link>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={signOut}
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link to="/SignIn" className="header-signin">
                  <LogIn className="w-4 h-4" />
                  <span>Sign in</span>
                </Link>
              ))}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="app-footer">
        <div className="max-w-7xl mx-auto app-footer-inner">
          <div className="footer-lockup">
            <LockKeyhole className="w-5 h-5" />
            <span>Designed for regulated money movement and secure cross-border transfers.</span>
          </div>
          <nav className="footer-links" aria-label="Legal">
            <Link to="/Terms">Terms of Service</Link>
            <Link to="/Privacy">Privacy Policy</Link>
            <span>NexaRemit</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
