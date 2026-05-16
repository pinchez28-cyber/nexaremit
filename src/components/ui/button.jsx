import React from "react";

const variants = {
  default: "bg-blue-700 text-white hover:bg-blue-800 border-transparent",
  outline: "bg-white text-primary border-neutral-300 hover:bg-neutral-50",
  ghost: "bg-transparent text-primary border-transparent hover:bg-neutral-100"
};

const sizes = {
  default: "h-11 px-5",
  icon: "h-10 w-10 p-0"
};

export function Button({ className = "", variant = "default", size = "default", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg border font-semibold transition-premium disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      {...props}
    />
  );
}
