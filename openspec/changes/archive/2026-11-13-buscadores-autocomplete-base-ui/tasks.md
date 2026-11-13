## 1. Frontend — base

- [x] 1.1 Línea base visual: capturas de los buscadores antes del cambio (formulario de turno con la lista abierta, vehículo con "+ Crear cliente", actualización masiva con productos), oscuro y claro, en `openspec/changes/buscadores-autocomplete-base-ui/baseline/`
- [x] 1.2 Primitiva `src/components/ui/primitives/autocomplete.jsx` sobre `@base-ui/react/autocomplete`, con tokens del design system y portal con `useDialogPortalContainer()`
- [x] 1.3 Wrapper `@ui/Autocomplete` (D2): búsqueda remota con debounce, carga/vacío/idle, limpiar, `action` final navegable y `autoComplete="off"`. Con tests de Vitest: teclado ↑↓ Enter, Escape dentro de un Dialog cierra solo la lista, la acción final con teclado, limpiar y que elegir no dispare una búsqueda

## 2. Frontend — buscadores

- [x] 2.1 `CustomerSearchInput` sobre `@ui/Autocomplete`, con la misma API y el mismo diseño (D3, D5). Actualizar `CustomerSearchInput.test.jsx` (elegir con teclado, sin resultados, limpiar, "+ Crear cliente" con teclado, cliente inicial por ID y "Cliente no encontrado")
- [x] 2.2 `ProductSearchInput` sobre `@ui/Autocomplete`, manteniendo el texto libre y `onSelect`. Actualizar `ProductSearchInput.test.jsx` (teclado ↓ Enter, texto libre, limpiar)
- [x] 2.3 Borrar `CustomerSearchResults.jsx` y `useFloatingPosition` (con su test) si `codegraph callers` confirma que quedan sin uso
- [x] 2.4 Ajustar los tests de los consumidores (`BudgetForm.test.jsx`, y los de `VehicleForm`/`AppointmentForm` si buscan la lista por `button`) y `searchInputsAutocomplete.test.js` si deja de detectar el input
- [x] 2.5 Documentar `@ui/Autocomplete` en `frontend/CLAUDE.md` (sección de diálogos y listas) y quitar el pendiente de `docs/PENDIENTES.md`

## 3. QA visual

- [x] 3.1 Escribir los casos TC-XX en `qa.md` (con su executor), comparando contra la línea base de 1.1
- [x] 3.2 Ejecutarlos con `/qa-visual` (`tools/qa-runner`, oscuro y claro) y corregir los hallazgos

## 4. Cierre

- [x] 4.1 `npm run lint`, `npx vitest run` y `npm run build` en frontend, todo en verde
