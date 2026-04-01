import { useEffect } from 'react';
import { X } from 'lucide-react';

const SlideOver = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  formId,
  submitLabel = 'Guardar Cambios',
  isLoading = false,
  children,
}) => {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface-container border-l border-outline-variant h-full flex flex-col shadow-2xl">
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
            disabled={isLoading}
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
    </div>
  );
};

export default SlideOver;
