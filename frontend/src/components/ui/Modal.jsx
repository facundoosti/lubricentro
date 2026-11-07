import React, { useRef, useEffect, useId } from "react";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  showCloseButton = true,
  isFullscreen = false,
  title,
  ariaLabel,
}) => {
  const modalRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full max-w-2xl rounded-3xl bg-surface-container";

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999">
      {!isFullscreen && (
        <div
          className="fixed inset-0 h-full w-full bg-black/50 backdrop-blur-[32px]"
          onClick={onClose}
        ></div>
      )}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        className={`${contentClasses} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-on-surface sm:right-6 sm:top-6 sm:h-11 sm:w-11"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="p-6">
          {title && (
            <div className="mb-6">
              <h2 id={titleId} className="text-xl font-semibold text-on-surface">
                {title}
              </h2>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 