import { X } from 'lucide-react';
import { DialogClose, DialogTitle } from '@/components/ui/primitives/dialog';

// Layout del modo libre de @ui/Dialog: ✕ opcional y encabezado simple con `title`; con `bare` el
// consumidor arma todo el contenido.
const DialogFreeLayout = ({ title, showCloseButton, bare, children }) => {
  if (bare) return children;
  return (
    <>
      {showCloseButton && (
        <DialogClose
          aria-label="Cerrar"
          className="absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-on-surface"
        >
          <X className="w-5 h-5" />
        </DialogClose>
      )}
      <div className="p-6">
        {title && (
          <div className="mb-6">
            <DialogTitle className="font-semibold tracking-normal">{title}</DialogTitle>
          </div>
        )}
        {children}
      </div>
    </>
  );
};

export default DialogFreeLayout;
