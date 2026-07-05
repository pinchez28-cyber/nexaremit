import React from "react";

export function Badge({ className = "", variant = "default", ...props }) {
  const variantClass = variant === "outline" ? "border border-current bg-white" : "";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variantClass} ${className}`} {...props} />;
}
