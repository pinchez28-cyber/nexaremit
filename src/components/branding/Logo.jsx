import React from "react";

export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="58%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="40" height="40" rx="13" fill="url(#logoGradient)" />
        <path d="M14 27.5C17.3 31.1 22.9 31.6 26.8 28.7L32.5 24.5" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M32.4 24.5L27.8 23.4" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M32.4 24.5L31.3 29.1" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M31.5 18.5C28.2 14.9 22.6 14.4 18.7 17.3L13 21.5" stroke="white" strokeOpacity="0.72" strokeWidth="3" strokeLinecap="round" />
        <path d="M13.1 21.5L17.7 22.6" stroke="white" strokeOpacity="0.72" strokeWidth="3" strokeLinecap="round" />
        <path d="M13.1 21.5L14.2 16.9" stroke="white" strokeOpacity="0.72" strokeWidth="3" strokeLinecap="round" />
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
