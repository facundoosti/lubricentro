import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  startIcon,
  endIcon,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-primary-container text-on-primary hover:brightness-110 focus:ring-primary",
    secondary: "bg-surface-container-high border border-outline-variant text-on-surface hover:brightness-110 focus:ring-outline-variant",
    outline: "border border-outline text-on-surface bg-transparent hover:bg-surface-container-high focus:ring-outline",
    ghost: "text-on-surface hover:bg-surface-container-high focus:ring-outline-variant",
    danger: "bg-error text-white hover:brightness-90 focus:ring-error",
    success: "bg-[var(--color-success-500)] text-white hover:brightness-90 focus:ring-[var(--color-success-500)]",
    error: "bg-error text-white hover:brightness-90 focus:ring-error",
    warning: "bg-[var(--color-warning-500)] text-white hover:brightness-90 focus:ring-[var(--color-warning-500)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {!loading && endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
};

export default Button; 