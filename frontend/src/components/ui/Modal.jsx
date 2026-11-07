import React, { useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useDialogLayer } from "@hooks/useDialogLayer";

/**
 * Diálogo genérico (confirmaciones, informativos). Comparte la pila de diálogos con el resto
 * (useDialogLayer): Escape cierra solo el de arriba, foco atrapado y devuelto, fondo inerte.
 *
 * @param {boolean} [closeOnBackdrop=true] - false en diálogos con datos cargados.
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  showCloseButton = true,
  isFullscreen = false,
  title,
  ariaLabel,
  closeOnBackdrop = true,
}) => {
  const titleId = useId();
  const { panelRef, layerRef, zIndex } = useDialogLayer({ isOpen, onClose });

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full max-w-2xl rounded-3xl bg-surface-container";

  return createPortal(
    <div
      ref={layerRef}
      className="fixed inset-0 flex items-center justify-center overflow-y-auto modal"
      style={{ zIndex }}
    >
      {!isFullscreen && (
        <div
          data-testid="modal-backdrop"
          className="fixed inset-0 h-full w-full bg-black/50 backdrop-blur-[32px]"
          onClick={closeOnBackdrop ? onClose : undefined}
        ></div>
      )}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className={`${contentClasses} outline-none ${className}`}
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
    </div>,
    document.body,
  );
};

export default Modal;
