import React from "react";

export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0F2F4A" />
            <stop offset="52%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="logoBridgeGold" x1="13" y1="17" x2="36" y2="31" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="42" height="42" rx="14" fill="url(#logoGradient)" />
        <path d="M11.5 29.5C15.4 21.5 20 17.5 24 17.5C28 17.5 32.6 21.5 36.5 29.5" stroke="white" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M14.5 30.5H33.5" stroke="white" strokeOpacity="0.82" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 30V34" stroke="white" strokeOpacity="0.68" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M24 29V34" stroke="white" strokeOpacity="0.68" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M30 30V34" stroke="white" strokeOpacity="0.68" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M13.5 23.5H31.6" stroke="url(#logoBridgeGold)" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M31.7 23.5L27.6 20.6" stroke="url(#logoBridgeGold)" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M31.7 23.5L27.6 26.4" stroke="url(#logoBridgeGold)" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="12" cy="23.5" r="2.2" fill="#FDE68A" />
      </svg>
      <div>
        <span className="font-bold text-lg leading-none">
          <span style={{ color: "#0f2f4a" }}>Nexa</span><span style={{ color: "#0f766e" }}>Remit</span>
        </span>
        <p className="logo-tagline">Send money home, clearly.</p>
      </div>
    </div>
  );
}
