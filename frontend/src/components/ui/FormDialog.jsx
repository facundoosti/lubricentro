import { useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialogLayer } from '@hooks/useDialogLayer';

const SIZE_CLASSES = {
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
};

// Un diálogo apilado sobre otro (nivel ≥ 1) es más angosto, para que se note que está encima.
const STACKED_SIZE_CLASS = 'max-w-xl';

const FormDialog = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  formId,
  submitLabel = 'Guardar Cambios',
  isLoading = false,
  size = 'lg',
  submitDisabled = false,
  children,
}) => {
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const subtitleId = `${dialogId}-subtitle`;
  // Pila, z-index, Escape del de arriba, foco, trampa de Tab, inert y scroll lock
  const { panelRef, layerRef, level, zIndex } = useDialogLayer({ isOpen, onClose });

  if (!isOpen) return null;

  const isStacked = level > 0;
  const widthClass = isStacked ? STACKED_SIZE_CLASS : (SIZE_CLASSES[size] ?? SIZE_CLASSES.lg);
  const backdropClass = isStacked ? 'bg-black/70' : 'bg-black/60 backdrop-blur-sm';

  // Portal al body: un diálogo apilado no depende del contenedor (ni del stacking context) del padre.
  // El fondo no cierra: solo ✕, Cancelar o Escape (evita perder lo cargado por un click afuera).
  return createPortal(
    <div
      ref={layerRef}
      data-testid="form-dialog-backdrop"
      className={`fixed inset-0 ${backdropClass} flex items-center justify-center p-4`}
      style={{ zIndex }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        className={`relative w-full ${widthClass} max-h-[90vh] bg-surface-container border border-outline-variant rounded-2xl flex flex-col shadow-2xl outline-none overflow-hidden`}
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high/30">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <h2 id={titleId} className="text-xl font-bold text-on-surface tracking-tight">{title}</h2>
              {subtitle && <p id={subtitleId} className="text-xs text-on-surface-variant">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 text-secondary hover:text-on-surface hover:bg-surface-container-high rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-outline-variant bg-surface-container-high/30 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-surface-container-high border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-variant transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isLoading || submitDisabled}
            className="px-5 py-2 bg-primary-container text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-on-primary" />
                Guardando...
              </>
            ) : submitLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default FormDialog;
