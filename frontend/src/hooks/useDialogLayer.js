import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

export const BASE_Z_INDEX = 50;
const LEVEL_Z_STEP = 10;
export const APP_CONTENT_SELECTOR = '[data-app-content]';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// Pila global de diálogos abiertos (de cualquier tipo); el último es el de arriba.
const stack = [];
const listeners = new Set();
// overflow del body antes de abrir el primer diálogo de la pila; se restaura al cerrar el último
let previousBodyOverflow = '';

const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getTopId = () => stack.at(-1)?.id ?? null;

const layerElementOf = (entry) => entry.layerRef.current ?? entry.panelRef.current;

const setInert = (el, value) => {
  if (!el) return;
  if (value) el.setAttribute('inert', '');
  else el.removeAttribute('inert');
};

// Con algún diálogo abierto, la app y las capas que no están arriba quedan inertes.
// Solo se toca [data-app-content] y las capas de la pila: los portales de listas desplegables
// y los toasts viven fuera de ambos y siguen usables.
const syncInert = () => {
  setInert(document.querySelector(APP_CONTENT_SELECTOR), stack.length > 0);
  stack.forEach((entry, i) => setInert(layerElementOf(entry), i < stack.length - 1));
};

// display:none no se hereda en getComputedStyle: hay que mirar también los ancestros.
// checkVisibility lo resuelve en el navegador; jsdom no lo tiene, así que se recorre la cadena.
const isHiddenByAncestors = (el) => {
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    if (window.getComputedStyle(node).display === 'none') return true;
  }
  return window.getComputedStyle(el).visibility === 'hidden';
};

const isVisible = (el) => {
  if (el.closest('[hidden], [inert]')) return false;
  if (typeof el.checkVisibility === 'function') return el.checkVisibility({ visibilityProperty: true });
  return !isHiddenByAncestors(el);
};

const getFocusables = (panel) => [...panel.querySelectorAll(FOCUSABLE_SELECTOR)].filter(isVisible);

// Foco "perdido" en lo de atrás (body, la app o un diálogo inferior). Un foco fuera del panel
// pero en otro lado (ej. el input de una lista desplegable en un portal) no se toca.
const isInBackground = (el) => {
  if (!el || el === document.body || el === document.documentElement) return true;
  if (el.closest(APP_CONTENT_SELECTOR)) return true;
  return stack.slice(0, -1).some((entry) => layerElementOf(entry)?.contains(el));
};

/**
 * Capa de diálogo compartida: pila global, z-index, Escape del de arriba, foco (captura,
 * trampa con Tab y retorno), contenido de fondo inerte y scroll lock del body.
 *
 * @param {Object} options
 * @param {boolean} options.isOpen
 * @param {() => void} options.onClose - Se llama con Escape (si el diálogo está arriba)
 * @param {boolean} [options.closeOnEscape=true]
 * @param {{ current: HTMLElement|null }} [options.initialFocusRef] - Elemento a enfocar al abrir
 * @returns {{ panelRef, layerRef, level: number, zIndex: number, isTop: boolean }}
 *   `panelRef` va en el elemento con role="dialog" (con tabIndex={-1}); `layerRef` en el contenedor
 *   exterior (fondo), si no existe se usa el panel.
 */
export const useDialogLayer = ({ isOpen, onClose, closeOnEscape = true, initialFocusRef } = {}) => {
  const id = useId();
  const panelRef = useRef(null);
  const layerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const closeOnEscapeRef = useRef(closeOnEscape);
  // Profundidad en la pila al abrir: 0 = diálogo base, ≥ 1 = apilado encima de otro
  const [level, setLevel] = useState(0);
  // Booleano: cada instancia solo re-renderiza cuando cambia si ella está arriba
  const getIsTopId = () => getTopId() === id;
  const isTopOfStack = useSyncExternalStore(subscribe, getIsTopId, getIsTopId);

  // Elemento con foco antes de abrir. Se captura durante el render en que isOpen pasa a true:
  // React aplica el autoFocus de un hijo en el commit, antes que cualquier efecto del diálogo.
  const [wasOpen, setWasOpen] = useState(false);
  const [returnFocusTo, setReturnFocusTo] = useState(null);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setReturnFocusTo(document.activeElement);
  }

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
    closeOnEscapeRef.current = closeOnEscape;
  });

  // Layout effect: el nivel se conoce antes de pintar, así el apilado no parpadea
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const entry = { id, panelRef, layerRef };
    setLevel(stack.length);
    if (stack.length === 0) previousBodyOverflow = document.body.style.overflow;
    stack.push(entry);
    document.body.style.overflow = 'hidden';
    syncInert();
    notify();
    return () => {
      setInert(layerElementOf(entry), false);
      stack.splice(stack.indexOf(entry), 1);
      if (stack.length === 0) document.body.style.overflow = previousBodyOverflow;
      syncInert();
      notify();
      // Al cerrar vuelve al nivel base: la próxima apertura no renderiza con el nivel viejo
      setLevel(0);
    };
  }, [isOpen, id]);

  // Foco: al abrir va a initialFocusRef o al panel (salvo que un campo ya lo haya tomado,
  // ej. autoFocus); al cerrar vuelve al elemento que lo tenía antes de abrir.
  useEffect(() => {
    if (!isOpen) return undefined;
    const panel = panelRef.current;
    if (initialFocusRef?.current) initialFocusRef.current.focus();
    else if (panel && !panel.contains(document.activeElement)) panel.focus();
    return () => {
      if (returnFocusTo instanceof HTMLElement && returnFocusTo.isConnected) returnFocusTo.focus();
    };
  }, [isOpen, returnFocusTo, initialFocusRef]);

  // Teclado del diálogo de arriba: Escape cierra (si un hijo no lo atendió) y Tab no sale del panel
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (e) => {
      if (e.defaultPrevented || !closeOnEscapeRef.current) return;
      onCloseRef.current?.();
    };
    const handleTab = (e) => {
      const panel = panelRef.current;
      if (!panel) return;
      const active = document.activeElement;
      const inside = panel.contains(active);
      if (!inside && !isInBackground(active)) return;
      const focusables = getFocusables(panel);
      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!inside) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const handleKeyDown = (e) => {
      if (getTopId() !== id) return;
      if (e.key === 'Escape') handleEscape(e);
      else if (e.key === 'Tab') handleTab(e);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, id]);

  return {
    panelRef,
    layerRef,
    level,
    zIndex: BASE_Z_INDEX + level * LEVEL_Z_STEP,
    isTop: isOpen && isTopOfStack,
  };
};

export default useDialogLayer;
