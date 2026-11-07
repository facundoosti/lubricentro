import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SIZE_CLASSES = {
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
};

// Un diálogo apilado sobre otro (nivel ≥ 1) es más angosto, para que se note que está encima.
const STACKED_SIZE_CLASS = 'max-w-xl';
const BASE_Z_INDEX = 50;

// Diálogos abiertos, el último es el de arriba (permite apilar uno sobre otro).
const openStack = [];
// overflow del body antes de abrir el primer diálogo de la pila; se restaura al cerrar el último
let previousBodyOverflow = '';

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
  const panelRef = useRef(null);
  // Profundidad en la pila al abrir: 0 = diálogo base, ≥ 1 = apilado encima de otro
  const [level, setLevel] = useState(0);
  // Elemento con foco antes de abrir. Se captura durante el render en que isOpen pasa a true:
  // React aplica el autoFocus de un hijo en el commit, antes que cualquier efecto del diálogo.
  const [wasOpen, setWasOpen] = useState(false);
  const [returnFocusTo, setReturnFocusTo] = useState(null);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setReturnFocusTo(document.activeElement);
  }

  // Layout effect: el nivel se conoce antes de pintar, así el apilado no parpadea
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    setLevel(openStack.length);
    if (openStack.length === 0) previousBodyOverflow = document.body.style.overflow;
    openStack.push(dialogId);
    document.body.style.overflow = 'hidden';
    return () => {
      openStack.splice(openStack.indexOf(dialogId), 1);
      if (openStack.length === 0) document.body.style.overflow = previousBodyOverflow;
      // Al cerrar vuelve al nivel base: la próxima apertura no renderiza con el nivel viejo
      setLevel(0);
    };
  }, [isOpen, dialogId]);

  // Foco: al abrir va al diálogo (salvo que un campo ya lo haya tomado, ej. autoFocus);
  // al cerrar vuelve al elemento que lo tenía antes de abrir.
  useEffect(() => {
    if (!isOpen) return undefined;
    if (panelRef.current && !panelRef.current.contains(document.activeElement)) {
      panelRef.current.focus();
    }
    return () => {
      if (returnFocusTo instanceof HTMLElement && returnFocusTo.isConnected) returnFocusTo.focus();
    };
  }, [isOpen, returnFocusTo]);

  useEffect(() => {
    if (!isOpen) return undefined;
    // Solo el diálogo de arriba responde al Escape, y no si un hijo ya lo atendió (ej. cerrar un dropdown)
    const handleEscape = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (openStack.at(-1) === dialogId) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, dialogId]);

  if (!isOpen) return null;

  const isStacked = level > 0;
  const widthClass = isStacked ? STACKED_SIZE_CLASS : (SIZE_CLASSES[size] ?? SIZE_CLASSES.lg);
  const backdropClass = isStacked ? 'bg-black/70' : 'bg-black/60 backdrop-blur-sm';

  // Portal al body: un diálogo apilado no depende del contenedor (ni del stacking context) del padre.
  // El fondo no cierra: solo ✕, Cancelar o Escape (evita perder lo cargado por un click afuera).
  return createPortal(
    <div
      data-testid="form-dialog-backdrop"
      className={`fixed inset-0 ${backdropClass} flex items-center justify-center p-4`}
      style={{ zIndex: BASE_Z_INDEX + level * 10 }}
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
