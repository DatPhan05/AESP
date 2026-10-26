import React from "react";
import Spinner from "./Spinner";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  className = "",
  ...props
}) {
  const variantClass = `aesp-btn-${variant}`;
  const sizeClass = `aesp-btn-${size}`;
  const fullWidthClass = fullWidth ? "aesp-btn-full" : "";
  const disabledClass = disabled || loading ? "aesp-btn-disabled" : "";

  const cls = [
    "aesp-btn",
    variantClass,
    sizeClass,
    fullWidthClass,
    disabledClass,
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size === "sm" ? "sm" : "md"} variant={variant === "primary" || variant === "danger" ? "white" : "current"} />
      ) : leftIcon ? (
        <span className="aesp-btn-icon-left" style={{ display: "inline-flex", alignItems: "center" }}>
          {leftIcon}
        </span>
      ) : null}

      <span>{children}</span>

      {!loading && rightIcon && (
        <span className="aesp-btn-icon-right" style={{ display: "inline-flex", alignItems: "center" }}>
          {rightIcon}
        </span>
      )}
    </button>
  );
}
