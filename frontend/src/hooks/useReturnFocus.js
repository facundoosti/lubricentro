import { useState } from 'react';

/**
 * Elemento al que vuelve el foco al cerrar un diálogo controlado (`isOpen`), para el `finalFocus` de
 * Base UI. Se captura en el render en que `isOpen` pasa a true, antes de que un hijo con autoFocus tome
 * el foco: sin Trigger, Base UI lo tomaría ya movido y devolvería el foco al body. Por eso se lee en el
 * render (patrón "ajustar estado cuando cambia una prop") y no en un efecto.
 *
 * @param {boolean} isOpen
 * @returns {() => HTMLElement|true} finalFocus - el elemento capturado si sigue en el DOM; si no, `true`
 */
export const useReturnFocus = (isOpen) => {
  const [wasOpen, setWasOpen] = useState(false);
  const [returnFocusTo, setReturnFocusTo] = useState(null);
  if (Boolean(isOpen) !== wasOpen) {
    setWasOpen(Boolean(isOpen));
    if (isOpen) setReturnFocusTo(document.activeElement);
  }
  return () => (returnFocusTo instanceof HTMLElement && returnFocusTo.isConnected ? returnFocusTo : true);
};
