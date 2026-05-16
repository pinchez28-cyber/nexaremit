import React from "react";

export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a365d" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="20" fill="url(#logoGradient)" />
        <path d="M12 20C12 24.4183 15.5817 28 20 28C24.4183 28 28 24.4183 28 20C28 15.5817 24.4183 12 20 12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
        <path d="M28 12C26.8913 11.3323 25.6424 11 24.3333 11C21.0447 11 18.4444 14.134 18.4444 18V22C18.4444 25.866 21.0447 29 24.3333 29C25.6424 29 26.8913 28.6677 28 28" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 28C13.1087 28.6677 14.3576 29 15.6667 29C18.9553 29 21.5556 25.866 21.5556 22V18C21.5556 14.134 18.9553 11 15.6667 11C14.3576 11 13.1087 11.3323 12 12" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div>
        <span className="font-bold text-lg leading-none">
          <span style={{ color: "#1a365d" }}>Nexa</span><span style={{ color: "#2563eb" }}>Remit</span>
        </span>
        <p className="logo-tagline">Global transfers, simplified.</p>
      </div>
    </div>
  );
}
