import React from "react";

export default function Badge({
  children,
  variant = "primary", // "primary" | "success" | "warning" | "danger" | "info" | "neutral"
  size = "md", // "sm" | "md"
  dot = false,
  className = "",
  ...props
}) {
  const variantClass = `aesp-badge-${variant}`;
  const sizeClass = `aesp-badge-${size}`;

  const cls = [
    "aesp-badge",
    variantClass,
    sizeClass,
    className
  ].filter(Boolean).join(" ");

  return (
    <span className={cls} {...props}>
      {dot && <span className="aesp-badge-dot-indicator" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}
