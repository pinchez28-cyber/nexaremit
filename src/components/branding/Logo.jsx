import React from "react";

export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg className="brand-mark" width="86" height="48" viewBox="0 0 86 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="logoBridgeTeal" x1="10" y1="5" x2="70" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="logoBridgeGold" x1="21" y1="35" x2="76" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <path d="M9 25.5C18.2 8.3 42.4 3.2 63.5 12.7C43.8 10.3 27.4 15.3 18.3 25.5H9Z" fill="url(#logoBridgeTeal)" />
        <path d="M25 25.5C34.8 14.7 49.3 11.9 66.5 16.2C52.4 16.8 40.6 20.2 32.8 25.5H25Z" fill="#0F766E" />
        <path d="M2.5 31.5C14.5 26.2 29.8 24.9 47.2 27.6V38H36.8V31.8C31.4 31.2 26.1 31.2 21.2 31.9V38H10.8V34.3C7.7 35.2 4.9 36.2 2.5 37.4V31.5Z" fill="#0F2F4A" />
        <path d="M16.5 39.5H52" stroke="#0F2F4A" strokeWidth="3" strokeLinecap="round" />
        <path d="M20.5 39C34 25.7 48.8 15.8 71.8 8.8" stroke="url(#logoBridgeGold)" strokeWidth="5" strokeLinecap="round" />
        <path d="M70.4 8.5L60.7 5.1" stroke="url(#logoBridgeGold)" strokeWidth="5" strokeLinecap="round" />
        <path d="M70.4 8.5L67.4 18.3" stroke="url(#logoBridgeGold)" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <div>
        <span className="brand-wordmark font-bold text-lg leading-none">
          <span style={{ color: "#0f2f4a" }}>Nexa</span><span style={{ color: "#2563eb" }}>Remit</span>
        </span>
        <p className="logo-tagline">Send money home, clearly.</p>
      </div>
    </div>
  );
}
