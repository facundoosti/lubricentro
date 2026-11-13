const Badge = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  // Define size styles
  const sizeStyles = {
    sm: "text-xs", // Smaller padding and font size
    md: "text-sm", // Default padding and font size
  };

  // Define color styles for variants
  const variants = {
    light: {
      primary:
        "bg-primary/10 text-primary",
      success:
        "bg-tertiary/10 text-tertiary",
      error:
        "bg-error/10 text-error",
      warning:
        "bg-warning-500/10 text-warning-500",
      info: "bg-sky-500/10 text-sky-500",
      light: "bg-surface-container-high text-on-surface",
      dark: "bg-outline text-white",
    },
    solid: {
      primary: "bg-primary-container text-white",
      success: "bg-tertiary text-white",
      error: "bg-error text-white",
      warning: "bg-warning-500 text-on-warning",
      info: "bg-sky-500 text-white",
      light: "bg-outline text-white",
      dark: "bg-surface-container-highest text-on-surface",
    },
  };

  // Get styles based on size and color variant
  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
