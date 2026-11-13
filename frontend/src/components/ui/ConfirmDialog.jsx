import { useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '@ui/Button';
import { DialogLevelContext, DialogPortalContainer } from '@ui/dialogContext';
import { useReturnFocus } from '@hooks/useReturnFocus';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogViewport,
} from '@/components/ui/primitives/alert-dialog';

const VARIANT_STYLES = {
  danger: { icon: 'text-error', button: 'error' },
  warning: { icon: 'text-warning-500', button: 'warning' },
  default: { icon: 'text-on-surface-variant', button: 'primary' },
};

/**
 * Confirmación (eliminar, acciones irreversibles) sobre AlertDialog de Base UI. Comparte la pila con
 * los Dialog (en ambos sentidos: provee el nivel y el contenedor de portales como Dialog): Escape cierra
 * solo la de arriba; el foco vuelve al botón que la abrió.
 * El click en el fondo cierra sin ejecutar la acción (AlertDialog no lo hace solo: se agrega en el fondo).
 * Con `isLoading` no se cierra (ni fondo, ni ✕, ni Escape).
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Está seguro de que desea realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;
  const level = useContext(DialogLevelContext);
  const popupRef = useRef(null);
  // Como Dialog: lo que se abra desde la confirmación (otro diálogo, una lista) se apila encima.
  const [popupNode, setPopupNode] = useState(null);
  const setPopup = useCallback((node) => {
    popupRef.current = node;
    setPopupNode(node);
  }, []);

  const finalFocus = useReturnFocus(isOpen);

  const handleOpenChange = (open, details) => {
    if (open) return;
    // Durante la operación (isLoading) ni Escape ni la ✕ cierran.
    if (isLoading || (details.reason === 'escape-key' && details.event?.defaultPrevented)) {
      details.cancel();
      return;
    }
    onClose?.();
  };

  // Click en el fondo: solo si el puntero bajó y subió en el fondo (seleccionar texto del mensaje y
  // soltar afuera no cierra).
  const pressedBackdropRef = useRef(false);
  const handleViewportPointerDown = (e) => {
    pressedBackdropRef.current = e.target === e.currentTarget;
  };
  const handleViewportClick = (e) => {
    const pressedBackdrop = pressedBackdropRef.current;
    pressedBackdropRef.current = false;
    if (!pressedBackdrop || e.target !== e.currentTarget || isLoading) return;
    onClose?.();
  };

  return (
    <AlertDialog open={Boolean(isOpen)} onOpenChange={handleOpenChange}>
      <AlertDialogPortal>
        <AlertDialogOverlay data-testid="confirm-dialog-backdrop" forceRender />
        <AlertDialogViewport onPointerDown={handleViewportPointerDown} onClick={handleViewportClick}>
          <AlertDialogPopup ref={setPopup} tabIndex={-1} aria-modal="true" initialFocus={popupRef} finalFocus={finalFocus} className="max-w-md rounded-3xl">
            <DialogLevelContext.Provider value={level + 1}>
              <DialogPortalContainer.Provider value={popupNode}>
                <AlertDialogClose
                  aria-label="Cerrar"
                  className="absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-secondary transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                >
                  <X className="w-5 h-5" />
                </AlertDialogClose>
                <div className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high">
                    <AlertTriangle className={`h-6 w-6 ${styles.icon}`} />
                  </div>
                  <AlertDialogTitle className="mb-2">{title}</AlertDialogTitle>
                  <AlertDialogDescription className="mb-6 break-words text-on-surface-variant">{message}</AlertDialogDescription>
                  <div className="flex justify-center space-x-3">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                      {cancelText}
                    </Button>
                    <Button variant={styles.button} onClick={() => onConfirm?.()} loading={isLoading} disabled={isLoading}>
                      {confirmText}
                    </Button>
                  </div>
                </div>
              </DialogPortalContainer.Provider>
            </DialogLevelContext.Provider>
          </AlertDialogPopup>
        </AlertDialogViewport>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

export default ConfirmDialog;
