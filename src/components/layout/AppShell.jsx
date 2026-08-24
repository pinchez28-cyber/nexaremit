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
                <button
                  type="button"
                  className="icon-button"
                  onClick={signOut}
                  aria-label={`Sign out ${user?.email || user?.phone || ""}`}
                  title={user?.email || user?.phone || "Sign out"}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <Link to="/SignIn" className="icon-button" aria-label="Sign in">
                  <LogIn className="w-5 h-5" />
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
          <span>NexaRemit</span>
        </div>
      </footer>
    </div>
  );
}
