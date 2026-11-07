## Context

- `FormDialog.jsx` ya resuelve pila (`openStack` de módulo), nivel/z-index (`50 + nivel*10`), Escape del de arriba con `defaultPrevented`, captura de foco en el render de apertura y retorno al cerrar, scroll lock restaurando el `overflow` previo, portal a `body`.
- `Modal.jsx`: Escape en `document` sin pila (cierra todos), scroll lock que pisa con `unset`, sin foco, `z-99999`, sin portal, backdrop siempre cierra. Consumidores: `ConfirmModal` (Customers, Vehicles, Products, Services, Suppliers, Appointments, ServiceRecords, Budgets), `BulkIvaModal`, `CustomerCreatedDialog`.
- `BulkPriceModal` y `ProductImportModal`: `fixed inset-0 z-50` propio, backdrop con `onClick={handleClose}`; Import escucha Escape en `window` y lo ignora mientras sube.
- `ImageLightbox`: portal, Escape/←/→, trampa de foco propia sobre botones, scroll lock propio, foco inicial en ✕ y retorno.

## Goals / Non-Goals

**Goals:** un único mecanismo para pila, Escape, foco y scroll; Tab no sale del diálogo de arriba; lo de abajo es inerte; regla clara de click en el fondo.

**Non-Goals:** rediseño visual; unificar markup (cada diálogo conserva su layout).

## Decisions

1. **Hook `useDialogLayer` en vez de componente base.** `frontend/src/hooks/useDialogLayer.js`:
   `useDialogLayer({ isOpen, onClose, closeOnEscape = true, initialFocusRef })` → `{ panelRef, layerRef, level, zIndex, isTop }`.
   Un hook deja que cada diálogo mantenga su markup (Lightbox fullscreen, BulkPrice con header/footer propios) sin forzar slots. *Alternativa:* componente `<DialogLayer>` con render props → más acoplado a markup; descartado.

2. **Pila de módulo única** (se mueve de `FormDialog` al hook). Cada entrada guarda `{ id, layerEl }`. Escape: listener en `document`; actúa solo si `!e.defaultPrevented`, `closeOnEscape` y es el tope.

3. **Trampa de foco**: keydown Tab en el panel del tope; foco cicla entre focusables visibles (`a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])`). Si no hay focusables, el foco queda en el panel (`tabIndex=-1`).

4. **`inert` en lo de abajo**: con al menos un diálogo abierto, el contenedor de la app recibe `inert`. No se usa `#root` porque el `<Toaster>` de Sileo vive ahí (`App.jsx`) y los toasts deben seguir clickeables: se envuelve el árbol de rutas en un elemento marcado `data-app-content` (en `App.jsx`, fuera del `<Toaster>`) y el hook aplica `inert` a ese elemento; cada capa no tope de la pila recibe `inert` en su `layerEl`. Al cerrar se recalcula. Portales de dropdowns (`CustomerSearchResults`, `SearchableSelect`) se montan en `body` fuera de las capas: se renderizan **dentro** del diálogo lógico pero en el DOM quedan fuera → no deben quedar inertes. Se resuelve aplicando `inert` solo a `[data-app-content]` y a las capas inferiores, nunca a "todos los hijos de body".

5. **Click en el fondo** queda en cada componente: `FormDialog` nunca cierra; `Modal` expone `closeOnBackdrop` (default `true`); `BulkIvaModal` pasa `false`; `BulkPriceModal` y `ProductImportModal` quitan el `onClick` del backdrop; `ImageLightbox` mantiene su cierre actual.

6. **`Modal.jsx`**: misma API (`isOpen, onClose, children, className, showCloseButton, isFullscreen, title, ariaLabel`) + `closeOnBackdrop`. Pasa a portal a `body` y z-index de la pila (se elimina `z-99999`).

7. **`ProductImportModal`**: `closeOnEscape: !isUploading`; ✕/Cancelar ya deshabilitados mientras sube (verificar).

8. **`ImageLightbox`**: usa el hook con `initialFocusRef` = botón ✕; conserva ←/→ con su propio listener; elimina su trampa y scroll lock.

9. **Ajustes surgidos en review/implementación**
   - `isTop` sale de `useSyncExternalStore(subscribe, () => getTopId() === id)`: cada instancia re-renderiza solo cuando cambia su propio estado (el ←/→ de `ImageLightbox` depende de `isTop`).
   - Visibilidad de enfocables para la trampa: `checkVisibility({ visibilityProperty: true })` y, en jsdom, recorrido de ancestros (`display:none`, `visibility:hidden`). Un foco en un portal fuera de la app (dropdowns) no se toca.
   - `[data-app-content]` lleva `isolate`: los z-index internos de la app (header z-50, toggle del sidebar z-[51]) quedan por debajo de cualquier diálogo.
   - Por eso `BulkPriceModal` y `ProductImportModal` pasan a portal a `body` (si no, quedarían dentro del contenedor inerte/aislado).
   - Contrato de Escape para desplegables: `SearchableSelect`, `MultiSelectSearch` y `ProductSearchInput` (además de `SingleSelectSearch` y `CustomerSearchInput`) hacen `preventDefault()` al cerrar su lista con Escape.

## Risks / Trade-offs

- [Toasts de Sileo dentro de `#root`] → `inert` se aplica a `[data-app-content]`, no a `#root`; validar en QA que un toast es clickeable con un diálogo abierto.
- [Tests con jsdom: `inert` no bloquea eventos en jsdom] → testear el atributo, no el efecto.
- [Cambio de z-index de `Modal` (99999 → 50+nivel*10) deja algún elemento fijo de la app por encima] → QA: ConfirmModal sobre header/sidebar y sobre FormDialog.
- [Muchos consumidores (8 páginas)] → `ConfirmModal` no cambia API; correr suite completa.

## Migration Plan

Solo frontend. Rollback = revertir commit.
