import { useLayoutEffect, useState } from 'react';

const INITIAL = { style: {}, placement: 'bottom' };

// Posición fija según el ancla: abajo, o arriba si abajo no entra y arriba hay más lugar
const calcPosition = (anchor, maxHeight, offset) => {
  if (!anchor) return INITIAL;
  const rect = anchor.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - offset;
  const spaceAbove = rect.top - offset;
  const openUp = spaceBelow < maxHeight && spaceAbove > spaceBelow;
  return {
    placement: openUp ? 'top' : 'bottom',
    style: {
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + offset }
        : { top: rect.bottom + offset }),
    },
  };
};

const STYLE_KEYS = ['top', 'bottom', 'left', 'width'];

// Misma posición → conserva la referencia previa (evita re-renders al scrollear dentro de la lista)
const samePosition = (a, b) =>
  a.placement === b.placement && STYLE_KEYS.every((key) => a.style[key] === b.style[key]);

/**
 * Posiciona un elemento flotante (ej. lista en un portal a body) pegado a un ancla con
 * `position: fixed`, y lo sigue mientras está abierto (scroll en cualquier contenedor + resize).
 *
 * @param {{ current: HTMLElement|null }} anchorRef - Elemento de referencia
 * @param {Object} options
 * @param {boolean} options.isOpen - Solo calcula y escucha eventos estando abierto
 * @param {number} [options.maxHeight=240] - Alto máximo del flotante (decide si abre hacia arriba)
 * @param {number} [options.offset=4] - Separación con el ancla en px
 * @returns {{ style: Object, placement: 'top'|'bottom' }}
 */
export const useFloatingPosition = (anchorRef, { isOpen, maxHeight = 240, offset = 4 } = {}) => {
  const [position, setPosition] = useState(INITIAL);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const update = () => {
      const next = calcPosition(anchorRef.current, maxHeight, offset);
      setPosition((prev) => (samePosition(prev, next) ? prev : next));
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, anchorRef, maxHeight, offset]);

  return position;
};

export default useFloatingPosition;
