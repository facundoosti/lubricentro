import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SIZE_CLASSES = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

// Paneles abiertos, el último es el de arriba (permite apilar uno sobre otro).
const openStack = [];

const SlideOver = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  formId,
  submitLabel = 'Guardar Cambios',
  isLoading = false,
  size = 'md',
  submitDisabled = false,
  children,
}) => {
  const panelId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    openStack.push(panelId);
    document.body.style.overflow = 'hidden';
    return () => {
      openStack.splice(openStack.indexOf(panelId), 1);
      if (openStack.length === 0) document.body.style.overflow = '';
    };
  }, [isOpen, panelId]);

  // Foco: al abrir va al panel (salvo que un campo ya lo haya tomado, ej. autoFocus);
  // al cerrar vuelve al elemento que lo tenía antes de abrir.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement;
    if (panelRef.current && !panelRef.current.contains(document.activeElement)) {
      panelRef.current.focus();
    }
    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    // Solo el panel de arriba responde al Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape' && openStack.at(-1) === panelId) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, panelId]);

  if (!isOpen) return null;

  // Portal al body: un panel apilado no depende del contenedor (ni del stacking context) del padre
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative w-full ${SIZE_CLASSES[size] ?? SIZE_CLASSES.md} bg-surface-container border-l border-outline-variant h-full flex flex-col shadow-2xl outline-none`}
      >
        {/* Header */}
        <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-high/30">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <h4 className="text-xl font-bold text-on-surface tracking-tight">{title}</h4>
              {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary hover:text-on-surface hover:bg-surface-container-high rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant bg-surface-container-high/30 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-surface-container-high text-on-surface font-bold rounded-lg hover:bg-surface-variant transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isLoading || submitDisabled}
            className="flex-1 px-4 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

export default SlideOver;
