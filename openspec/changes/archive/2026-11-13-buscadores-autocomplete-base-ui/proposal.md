## Why

Los buscadores de clientes (`CustomerSearchInput`, 304 líneas) y de productos (`ProductSearchInput`, 137 líneas) son las últimas listas hechas a mano después de las fases 1 y 2 de shadcn/Base UI. Cada uno tiene su propio click-afuera, su navegación con teclado (el de productos no tiene) y su manejo de Escape. El de clientes además tiene un portal y un posicionamiento propios (`useFloatingPosition`). Es el mismo tipo de código que ya dio bugs en los diálogos y que las fases anteriores reemplazaron.

## What Changes

- Nuevo wrapper **`@ui/Autocomplete`** sobre el Autocomplete de Base UI (primitiva en `ui/primitives/autocomplete.jsx`):
  - búsqueda remota con debounce
  - estados de carga, sin resultados y "Escribí para buscar"
  - botón limpiar
  - acción opcional al final de la lista
  - portal dentro del Dialog
- **`CustomerSearchInput`** pasa a usar `@ui/Autocomplete`. Mantiene la API (`value`, `onChange`, `onSelect`, `initialCustomer`, `onCreateNew`, `error`, `disabled`), "+ Crear cliente" y el diseño (input de 44px, ícono de lupa, borde verde con cliente elegido).
- **`ProductSearchInput`** pasa a usar `@ui/Autocomplete`. Mantiene el texto libre (`onChange`) y la selección (`onSelect`). **Suma** navegación con ↑/↓ y Enter, que hoy no tiene.
- Se borran `CustomerSearchResults.jsx` y `useFloatingPosition` (con su test) si quedan sin uso.
- Sin cambios de backend ni de API.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `listas-seleccion`: se agrega el requerimiento del autocomplete de búsqueda remota (clientes y productos): teclado, limpiar, acción final y comportamiento dentro de diálogos.

## Impact

- Frontend:
  - `src/components/ui/` (Autocomplete nuevo + primitiva)
  - `features/customers/CustomerSearchInput.jsx` y `CustomerSearchResults.jsx`
  - `features/products/ProductSearchInput.jsx`
  - `hooks/useFloatingPosition.js`
- Consumidores (sin cambio de API):
  - `AppointmentForm`, `VehicleForm` y `BudgetGeneralSection` (cliente)
  - `BulkPriceModal` (producto)
- Tests: `CustomerSearchInput.test.jsx`, `ProductSearchInput.test.jsx`, `BudgetForm.test.jsx` y `searchInputsAutocomplete.test.js` (regla de `autoComplete="off"`).
- Documentación: `frontend/CLAUDE.md` (sección de diálogos y listas) y `docs/PENDIENTES.md`.
