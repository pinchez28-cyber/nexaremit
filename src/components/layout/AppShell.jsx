import React from "react";
import { NavLink } from "react-router-dom";
import { AlertTriangle, Bell, LockKeyhole, ShieldCheck } from "lucide-react";
import Logo from "@/components/branding/Logo";
import { createPageUrl } from "@/utils";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Easy Setup", to: createPageUrl("Setup") },
  { label: "Dashboard", to: createPageUrl("Dashboard") },
  { label: "Send", to: createPageUrl("SendMoney") },
  { label: "Recipients", to: createPageUrl("Recipients") },
  { label: "Compliance", to: createPageUrl("SecurityCompliance") }
];

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <div className="prototype-banner">
        <div className="max-w-7xl mx-auto app-banner-inner">
          <span className="banner-icon"><AlertTriangle className="w-4 h-4" /></span>
          Prototype mode: payment rails, KYC, sanctions screening, and regulatory reporting must be implemented before real transactions.
        </div>
      </div>
      <header className="app-header">
        <div className="max-w-7xl mx-auto app-header-inner">
          <Logo className="app-logo" />
          <nav className="app-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink key={item.label} to={item.to} className={({ isActive }) => `app-nav-link ${isActive ? "is-active" : ""}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <div className="header-trust">
              <ShieldCheck className="w-4 h-4" />
              <span>Sandbox</span>
            </div>
            <button type="button" className="icon-button" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="app-footer">
        <div className="max-w-7xl mx-auto app-footer-inner">
          <div className="footer-lockup">
            <LockKeyhole className="w-5 h-5" />
            <span>Designed for regulated money movement. Connect licensed partners before launch.</span>
          </div>
          <span>NexaRemit prototype</span>
        </div>
      </footer>
    </div>
  );
}
