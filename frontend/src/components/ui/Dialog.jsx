import { useCallback, useContext, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DialogLevelContext, DialogPortalContainer } from '@ui/dialogContext';
import { useReturnFocus } from '@hooks/useReturnFocus';
import DialogFormLayout from '@ui/DialogFormLayout';
import DialogFreeLayout from '@ui/DialogFreeLayout';
import {
  Dialog as DialogRoot,
  DialogOverlay,
  DialogPopup,
  DialogPortal,
  DialogViewport,
} from '@/components/ui/primitives/dialog';

// Ancho máximo del panel por tamaño. `full` ocupa toda la pantalla (visor de imágenes).
const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-none',
};

// Un diálogo apilado sobre otro es más angosto y con el fondo más oscuro, para que se note que está encima.
const STACKED_SIZE_CLASS = 'max-w-xl';

// Los toasts (Sileo) viven fuera del diálogo y tienen que seguir usables: un click en un toast no es
// un click "en el fondo".
const isToastEvent = (event) => event?.target instanceof Element && Boolean(event.target.closest('[data-sileo-viewport]'));

/**
 * Diálogo único de la app (formularios, informativos, acciones masivas, importación, visor de imágenes),
 * sobre Dialog de Base UI: pila, Escape del de arriba, trampa y retorno de foco, fondo no interactuable
 * y scroll lock los resuelve Base UI.
 *
 * - **Modo formulario** (con `formId`): header (icono, título, subtítulo, ✕) y footer (Cancelar / Guardar) fijos,
 *   cuerpo con scroll. El click en el fondo no cierra.
 * - **Modo libre** (sin `formId`): el consumidor define el contenido. Con `title` muestra un encabezado simple;
 *   con `bare` el panel queda vacío (el consumidor arma header, ✕ y footer y etiqueta con `ariaLabelledBy`).
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [size] - default `lg` en formularios, `md` en libre
 * @param {boolean} [closeOnBackdrop] - default false en formularios, true en libre
 * @param {boolean} [closeOnEscape=true] - false durante una operación que no se puede cortar
 * @param {boolean} [showCloseButton=true] - ✕ del modo libre
 * @param {boolean | {current: HTMLElement|null} | ((openType: string) => HTMLElement|boolean|null|void)} [initialFocus] -
 *   a dónde va el foco al abrir (API de Base UI). Default: el panel, salvo que un campo ya lo tenga (autoFocus)
 */
const Dialog = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  size,
  closeOnBackdrop,
  closeOnEscape = true,
  showCloseButton = true,
  ariaLabel,
  ariaLabelledBy,
  bare = false,
  className,
  backdropClassName,
  initialFocus,
  onKeyDown,
  onClick,
  formId,
  submitLabel = 'Guardar Cambios',
  isLoading = false,
  submitDisabled = false,
  children,
}) => {
  const level = useContext(DialogLevelContext);
  const finalFocus = useReturnFocus(isOpen);
  // Ref para leer el panel al enfocar (el state recién está en el render siguiente); state para el
  // contexto de los portales de los hijos.
  const popupRef = useRef(null);
  const [popupNode, setPopupNode] = useState(null);
  const setPopup = useCallback((node) => {
    popupRef.current = node;
    setPopupNode(node);
  }, []);
  const isForm = Boolean(formId);
  const isStacked = level > 0;
  const dismissOnBackdrop = closeOnBackdrop ?? !isForm;
  const resolvedSize = size ?? (isForm ? 'lg' : 'md');

  const handleOpenChange = (open, details) => {
    if (open) return;
    const { reason, event } = details;
    const ignore =
      (reason === 'escape-key' && (!closeOnEscape || event?.defaultPrevented)) ||
      (reason === 'outside-press' && (!dismissOnBackdrop || isToastEvent(event)));
    if (ignore) {
      details.cancel();
      return;
    }
    onClose?.();
  };

  // Por defecto el foco va al panel (no al primer botón, que sería la ✕), salvo que un campo ya lo haya
  // tomado con autoFocus.
  const defaultInitialFocus = () => {
    const popup = popupRef.current;
    if (popup?.contains(document.activeElement)) return false;
    return popup ?? true;
  };

  // Base UI etiqueta el panel con su Title; solo se pisa si el consumidor lo pide (modo `bare`, sin título).
  const labelProps = {};
  if (ariaLabelledBy) labelProps['aria-labelledby'] = ariaLabelledBy;
  else if (!title && ariaLabel) labelProps['aria-label'] = ariaLabel;

  const widthClass = isStacked && resolvedSize !== 'full' ? STACKED_SIZE_CLASS : SIZE_CLASSES[resolvedSize];

  const panelClass = cn(
    widthClass,
    resolvedSize === 'full' && 'h-full',
    isForm
      ? 'max-h-[90vh] border border-outline-variant rounded-2xl flex flex-col shadow-2xl overflow-hidden'
      : !bare && 'rounded-3xl',
    className,
  );

  // Libre con layout propio (informativos): fondo con más blur; formulario y bare: el de los formularios.
  const baseOverlay = !isForm && !bare ? 'bg-black/50 backdrop-blur-[32px]' : 'bg-black/60 backdrop-blur-sm';
  const overlayClass = cn(isStacked ? 'bg-black/70 backdrop-blur-none' : baseOverlay, backdropClassName);

  return (
    <DialogRoot
      open={Boolean(isOpen)}
      onOpenChange={handleOpenChange}
      disablePointerDismissal={!dismissOnBackdrop}
    >
      <DialogPortal>
        {resolvedSize !== 'full' && (
          <DialogOverlay data-testid="dialog-backdrop" forceRender className={overlayClass} />
        )}
        <DialogViewport data-testid="dialog-viewport" className={cn(resolvedSize === 'full' && 'p-0')}>
          <DialogPopup
            ref={setPopup}
            data-stacked={isStacked || undefined}
            aria-modal="true"
            {...labelProps}
            initialFocus={initialFocus ?? defaultInitialFocus}
            finalFocus={finalFocus}
            onKeyDown={onKeyDown}
            onClick={onClick}
            tabIndex={-1}
            className={panelClass}
          >
            <DialogLevelContext.Provider value={level + 1}>
              <DialogPortalContainer.Provider value={popupNode}>
                {isForm ? (
                  <DialogFormLayout
                    title={title}
                    subtitle={subtitle}
                    icon={icon}
                    formId={formId}
                    submitLabel={submitLabel}
                    isLoading={isLoading}
                    submitDisabled={submitDisabled}
                    onClose={onClose}
                  >
                    {children}
                  </DialogFormLayout>
                ) : (
                  <DialogFreeLayout title={title} showCloseButton={showCloseButton} bare={bare}>
                    {children}
                  </DialogFreeLayout>
                )}
              </DialogPortalContainer.Provider>
            </DialogLevelContext.Provider>
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </DialogRoot>
  );
};

export default Dialog;
