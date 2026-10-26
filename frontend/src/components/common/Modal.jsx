import React, { useEffect } from "react";

export default function Modal({
  isOpen = false,
  onClose = () => {},
  title = "",
  children,
  footer = null,
  size = "md",
  closeOnBackdrop = true,
  className = ""
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = `aesp-modal-${size}`;

  return (
    <div
      className="aesp-modal-backdrop"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="aesp-modal-title"
    >
      <div className={["aesp-modal-box", sizeClass, className].filter(Boolean).join(" ")}>
        {(title || onClose) && (
          <div className="aesp-modal-header">
            {title && (
              <h2 id="aesp-modal-title" className="aesp-modal-title">
                {title}
              </h2>
            )}
            <button
              type="button"
              className="aesp-modal-close-btn"
              onClick={onClose}
              aria-label="Đóng"
            >
              &times;
            </button>
          </div>
        )}

        <div className="aesp-modal-body">{children}</div>

        {footer && <div className="aesp-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
