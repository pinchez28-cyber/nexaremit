import React from "react";

export function Alert({ className = "", ...props }) {
  return <div role="alert" className={`rounded-xl border p-4 flex items-start gap-3 ${className}`} {...props} />;
}

export function AlertDescription({ className = "", ...props }) {
  return <div className={`text-sm leading-6 ${className}`} {...props} />;
}
