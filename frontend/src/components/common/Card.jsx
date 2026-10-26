import React from "react";

export function Card({
  children,
  hoverable = false,
  className = "",
  onClick,
  ...props
}) {
  const cls = [
    "aesp-card",
    hoverable ? "aesp-card-hoverable" : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={cls} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  title,
  subtitle,
  action,
  className = "",
  ...props
}) {
  return (
    <div className={["aesp-card-header", className].filter(Boolean).join(" ")} {...props}>
      {children ? (
        children
      ) : (
        <>
          <div>
            {title && <h3 className="aesp-card-title">{title}</h3>}
            {subtitle && <p className="aesp-card-subtitle">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </>
      )}
    </div>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={["aesp-card-body", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={["aesp-card-footer", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
