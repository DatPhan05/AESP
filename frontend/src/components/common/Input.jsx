import React, { useState } from "react";

export default function Input({
  label = "",
  value = "",
  onChange = () => {},
  placeholder = "",
  type = "text",
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
  id,
  name,
  autoComplete,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const actualType = isPasswordType ? (showPassword ? "text" : "password") : type;

  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const hasLeft = Boolean(leftIcon);
  const hasRight = Boolean(rightIcon || isPasswordType);

  return (
    <div className="aesp-input-group">
      {label && (
        <label htmlFor={inputId} className="aesp-input-label">
          <span>
            {label}
            {required && <span className="aesp-input-required">*</span>}
          </span>
        </label>
      )}

      <div className="aesp-input-wrapper">
        {hasLeft && <span className="aesp-input-icon-left">{leftIcon}</span>}

        <input
          id={inputId}
          name={name}
          type={actualType}
          value={value}
          onChange={(e) => onChange(e)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={[
            "aesp-input",
            hasLeft ? "has-left-icon" : "",
            hasRight ? "has-right-icon" : "",
            error ? "is-invalid" : "",
            className
          ].filter(Boolean).join(" ")}
          aria-invalid={Boolean(error)}
          {...props}
        />

        {isPasswordType ? (
          <button
            type="button"
            className="aesp-input-btn-right"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            tabIndex={-1}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        ) : rightIcon ? (
          <span className="aesp-input-icon-right">{rightIcon}</span>
        ) : null}
      </div>

      {error ? (
        <div className="aesp-input-error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <div className="aesp-input-helper">{helperText}</div>
      ) : null}
    </div>
  );
}
