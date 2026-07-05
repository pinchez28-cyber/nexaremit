import React from "react";

export function Card({ className = "", ...props }) {
  return <div className={`rounded-xl border border-neutral-200 bg-white ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }) {
  return <div className={`p-6 pb-3 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
  return <h3 className={`text-lg font-bold text-primary ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={`p-6 pt-3 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }) {
  return <div className={`p-6 pt-3 flex items-center gap-3 ${className}`} {...props} />;
}
