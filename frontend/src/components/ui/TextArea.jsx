import React from "react";

const TextArea = ({
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  rows = 4,
  disabled = false,
  success = false,
  error = false,
  hint,
  label,
  required = false,
}) => {
  let textareaClasses = `w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-secondary focus:outline-hidden focus:ring-3 resize-none ${className}`;

  if (disabled) {
    textareaClasses += ` text-on-surface-variant border-outline-variant opacity-40 bg-surface-container-high cursor-not-allowed opacity-40`;
  } else if (error) {
    textareaClasses += ` border-error focus:border-error focus:ring-error/20`;
  } else if (success) {
    textareaClasses += ` border-tertiary focus:border-tertiary focus:ring-tertiary/20`;
  } else {
    textareaClasses += ` bg-transparent text-on-surface border-outline-variant focus:border-primary focus:ring-primary/20`;
  }

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-on-surface"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        required={required}
        className={textareaClasses}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error"
              : success
              ? "text-tertiary"
              : "text-on-surface-variant"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextArea; 