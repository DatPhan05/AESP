import React from "react";

export default function Alert({
  type = "info", // "info" | "success" | "warning" | "error"
  title = "",
  children,
  onClose,
  className = "",
  icon = null
}) {
  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌"
  };

  const typeClass = `aesp-alert-${type}`;
  const displayIcon = icon || icons[type] || icons.info;

  return (
    <div
      className={["aesp-alert", typeClass, className].filter(Boolean).join(" ")}
      role="alert"
    >
      <div className="aesp-alert-icon">{displayIcon}</div>
      <div className="aesp-alert-content">
        {title && <div className="aesp-alert-title">{title}</div>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="aesp-alert-close"
          onClick={onClose}
          aria-label="Đóng thông báo"
        >
          &times;
        </button>
      )}
    </div>
  );
}
