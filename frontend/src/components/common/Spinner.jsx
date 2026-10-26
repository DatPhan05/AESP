import React from "react";

export default function Spinner({
  size = "md",
  variant = "primary",
  className = "",
  label = "Đang tải...",
  showLabel = false
}) {
  const sizeClasses = {
    sm: "aesp-spinner-sm",
    md: "aesp-spinner-md",
    lg: "aesp-spinner-lg",
    xl: "aesp-spinner-xl"
  };

  const variantClasses = {
    primary: "aesp-spinner-primary",
    white: "aesp-spinner-white",
    muted: "aesp-spinner-muted",
    current: "aesp-spinner-current"
  };

  const cls = [
    "aesp-spinner",
    sizeClasses[size] || sizeClasses.md,
    variantClasses[variant] || variantClasses.primary,
    className
  ].filter(Boolean).join(" ");

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }} role="status">
      <svg
        className={cls}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          strokeWidth="3"
          strokeOpacity="0.25"
        />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {showLabel && label && <span style={{ fontSize: 13, color: "inherit" }}>{label}</span>}
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        {label}
      </span>
    </span>
  );
}
