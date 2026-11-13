import { X } from 'lucide-react';
import { DialogClose, DialogDescription, DialogTitle } from '@/components/ui/primitives/dialog';

// Layout del modo formulario de @ui/Dialog: header (icono, título, subtítulo, ✕) y footer
// (Cancelar / Guardar) fijos, cuerpo con scroll.
const SubmitButton = ({ formId, isLoading, submitDisabled, submitLabel }) => (
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
);

const DialogFormLayout = ({ title, subtitle, icon: Icon, formId, submitLabel, isLoading, submitDisabled, onClose, children }) => (
  <>
    <div className="shrink-0 px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high/30">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription className="text-on-surface-variant">{subtitle}</DialogDescription>}
        </div>
      </div>
      <DialogClose
        aria-label="Cerrar"
        className="p-2 text-secondary hover:text-on-surface hover:bg-surface-container-high rounded-full transition-all"
      >
        <X className="w-5 h-5" />
      </DialogClose>
    </div>

    <div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>

    <div className="shrink-0 px-6 py-4 border-t border-outline-variant bg-surface-container-high/30 flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 bg-surface-container-high border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-variant transition-all disabled:opacity-50"
      >
        Cancelar
      </button>
      <SubmitButton formId={formId} isLoading={isLoading} submitDisabled={submitDisabled} submitLabel={submitLabel} />
    </div>
  </>
);

export default DialogFormLayout;
