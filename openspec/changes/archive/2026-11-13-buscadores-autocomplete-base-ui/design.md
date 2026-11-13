## Context

- Las fases 1 y 2 de shadcn/Base UI ya unificaron Dialog, Combobox, Select, fechas y controles. Quedan dos buscadores hechos a mano:
  - **`CustomerSearchInput`** (cliente, 304 líneas). Tiene portal propio al panel del Dialog (`useDialogPortalContainer`), posicionamiento con `useFloatingPosition`, teclado manual, "+ Crear cliente" y carga del cliente inicial por ID (`useCustomer`). Lo usan `AppointmentForm`, `VehicleForm` y `BudgetGeneralSection`. Su lista vive en `CustomerSearchResults.jsx`.
  - **`ProductSearchInput`** (producto, 137 líneas). Es texto libre más selección, con lista `absolute` sin portal y sin teclado. Solo lo usa `BulkPriceModal`.
- Base UI 1.9 trae `Autocomplete` (comparte Input/List/Popup/Portal con `Combobox`). El repo ya tiene `@ui/Combobox` sobre `primitives/combobox.jsx` y `@ui/dialogContext` (portal y nivel de diálogo).

## Goals / Non-Goals

**Goals**
- Un único `@ui/Autocomplete` con búsqueda remota, teclado, limpiar, acción final opcional y portal dentro del Dialog.
- Los dos buscadores sobre ese wrapper, **sin cambiar su API pública** ni el diseño visual (medidas, colores e íconos).
- Teclado en el buscador de productos.
- Borrar el código que quede sin uso (`CustomerSearchResults`, `useFloatingPosition`).

**Non-Goals**
- El buscador de ítems de presupuestos/atenciones (otro componente, spec `presupuesto-ux`).
- Cambios de backend o de los endpoints de búsqueda.
- Rediseñar el alta rápida de cliente.

## Decisions

**D1 — Autocomplete de Base UI y no `@ui/Combobox`.**
- El campo de los dos buscadores es texto editable que muestra el elegido como texto, no un trigger con valor.
- El de productos además acepta texto libre que no es una opción.
- `Autocomplete` modela exactamente eso: el input es el valor y los ítems lo completan.
- Alternativa descartada: extender `@ui/Combobox`. Habría mezclado dos modelos (valor elegido vs. texto) en un wrapper que ya pasa las 180 líneas.

**D2 — Wrapper controlado por texto, ítems opacos.**
- API:
  - `@ui/Autocomplete({ value, onValueChange, items, getItemKey, itemToString, renderItem, onItemSelect, onSearch, loading, emptyText, idleText, action, clearable, onClear, error, inputClassName, leading, ... })`
  - `action = { label, icon, onSelect }`: queda como ítem final navegable.
- La búsqueda remota (debounce 300 ms, `onSearch`) vive en el wrapper, igual que en `@ui/Combobox`. Así los consumidores no repiten el `setTimeout`.
- Con `onSearch` no hay filtro local: se pasa `filter={null}`.

**D3 — Estado del cliente elegido en `CustomerSearchInput`.**
- Se conserva la lógica de dominio: `useCustomer` por ID, `initialCustomer`, "Cliente no encontrado" y que editar el texto deseleccione si ya no contiene el nombre.
- Se borra lo que ahora resuelve Base UI: click afuera, `highlightedIndex`, `handleKeyDown`, portal y posicionamiento.
- Objetivo: menos de 180 líneas.

**D4 — Portal y apilado.**
- La primitiva porta la lista con `ComboboxPortal container={useDialogPortalContainer()}`, igual que `primitives/combobox.jsx`.
- Así queda dentro del panel del Dialog, sigue interactiva con modal y su Escape cierra solo la lista.
- El z-index sigue la convención de la fase 1.

**D5 — Diseño visual.**
- Input: se mantienen las clases actuales (cliente `h-11 pl-10`, borde `tertiary` con elegido; producto `py-2 pl-9`), que pasan por `inputClassName`.
- Lista: `bg-surface-container`, borde `outline-variant`, `max-h-60` / `max-h-56` y la opción destacada `bg-primary/10`, igual que hoy.
- Línea base: capturas antes del cambio (QA).

## Risks / Trade-offs

- [Base UI emite `onValueChange` al elegir un ítem (texto = `itemToString`)] → el wrapper distingue elección de tipeo (`reason`) para no disparar una búsqueda con el texto del elegido.
- [El test de `autoComplete="off"` busca `<input ...>` en el JSX] → el `Input` de la primitiva recibe `autoComplete="off"` fijo. Si el test deja de detectarlo, se ajusta el test sin perder la regla.
- [jsdom: Base UI posiciona y abre en forma asíncrona] → los tests usan `findBy`/`waitFor` y los polyfills de `src/test/setup.js`.
- [Cambia el foco y el anuncio para lectores de pantalla (roles `combobox`/`listbox`/`option`)] → es una mejora; los tests que buscaban `button` pasan a `option`.

## Migration Plan

- Solo frontend, sin datos. Deploy normal. Rollback = revert del commit.

## Open Questions

- Ninguna bloqueante.
