Solo **frontend**. Sin backend ni migraciones.

## 0. Línea base visual (antes de tocar código)

- [x] 0.1 Con `tools/qa-runner` (1440×900, claro y oscuro) capturar en `openspec/changes/shadcn-base-ui-fase-2/baseline/`: formulario de turno (fecha, hora y estado; el Select de estado abierto), formulario de producto (selects), formulario de vehículo (select), formulario de atención (select + 2 fechas), sección general del presupuesto (fecha + 2 selects), `BulkPriceModal` (select), filtros de Recordatorios (estado + desde/hasta), listado de productos con 1 fila seleccionada (cabecera indeterminada) y filtro de estado, página de atención (`ServiceRecordFormPage`, 2 fechas), Configuración › horarios (switches + horas), encabezado (switch de tema) e historial del perfil de cliente (tabs). Guardar el script como `baseline/baseline.qa.mjs`.
- [x] 0.2 Anotar el tamaño de `npm run build` (JS total gzip) en `baseline/bundle.txt`.

## 1. Frontend — Primitivas y helpers

- [x] 1.1 Para `popover`, `calendar`, `switch`, `checkbox` y `tabs`: `npx shadcn@latest add <name> --dry-run`, revisar qué escribe, recién después el `add` real a `ui/primitives/`. Revertir todo lo que toque fuera de `ui/primitives/` y `package.json`/lock (ej. `index.css`, `Button.jsx`). Ajustar clases shadcn a tokens MD3 (D1). Anotar la versión de `react-day-picker` en `design.md` › Open Questions.
- [x] 1.2 `src/lib/maskedInput.js`: funciones puras de máscara y parseo (`formatDateDigits`, `parseDisplayDate` → ISO o `null`, `isoToDisplay`, `formatTimeDigits`, `parseDisplayTime`). Tests de Vitest: tipeo, pegado con y sin barras, letras, fechas inexistentes (31/02, 29/02 no bisiesto), horas fuera de rango, vacío.

## 2. Frontend — Wrappers `@ui`

- [x] 2.1 `@ui/DateInput` (D2): máscara, `onChange` ISO/'' , `aria-invalid` al salir si es inválida, botón "Abrir calendario", Popover + Calendar en español desde lunes, porteado en `useDialogPortalContainer()`, foco de vuelta al input, compatible con `Controller` (`ref`, `onBlur`). Tests: escenarios de `campos-fecha-hora` (tipear, pegar, letras, valor inicial, inválida, borrar, elegir día, mes inicial, Escape dentro de un `Dialog` cierra solo el calendario).
- [x] 2.2 `@ui/TimeInput` (D3). Tests: tipear "0830", fuera de rango, valor inicial.
- [x] 2.3 `@ui/Switch` (D4) con variantes `default` y `theme` (+ `thumbContent`). Tests: rol `switch`, `aria-checked`, click, Espacio, `disabled`.
- [x] 2.4 `@ui/Checkbox` (D5) con `indeterminate`. Tests: marcar/desmarcar, `aria-checked="mixed"`, `disabled`.
- [x] 2.5 `@ui/Tabs` (D6). Tests: flechas + Enter cambian de pestaña, `tabpanel` vinculado a la pestaña activa, solo se monta el panel activo.

## 3. Frontend — Migrar `<select>` a `@ui/Select`

- [x] 3.1 `IvaRateSelect`, `ProductIvaField` y `BudgetStatusSelect` usan `@ui/Select` adentro, manteniendo su API (con `Controller` donde había `register`). Ajustar sus tests.
- [x] 3.2 `ProductForm` (2 selects) y `VehicleForm` (1). Tests: valor inicial al editar, `reset`, payload enviado.
- [x] 3.3 `AppointmentForm`, `ServiceRecordForm` y `BudgetGeneralSection` (2). Tests: valor inicial, validación requerida si la había, payload.
- [x] 3.4 `BulkPriceModal`, filtro de estado de `ProductsTable` y filtro de estado de `Reminders` (valor centinela `'all'` → sin parámetro, D7). Tests: elegir valor y volver a "Todos" (el pedido sale sin el parámetro).

## 4. Frontend — Migrar fechas y horas

- [x] 4.1 `AppointmentForm` → `DateInput` con `Controller` (requerida "Fecha es requerida"); borrar `openPicker`/`showPicker`. Ajustar tests.
- [x] 4.2 `ServiceRecordForm` (2), `BudgetGeneralSection` (1) y `ServiceRecordFormPage` (2) → `DateInput`. Tests: valor inicial al editar y payload en ISO.
- [x] 4.3 `Reminders` desde/hasta → `DateInput`. Test: "Filtrar recordatorios por rango" (`start_date`/`end_date` en ISO).
- [x] 4.4 `Settings` horario (2 `type="time"`) → `TimeInput`. Test: tipear "0830" guarda "08:30".

## 5. Frontend — Switch, Checkbox y Tabs

- [x] 5.1 `Header` (tema, variante `theme` con sol/luna) y `Settings` (día abierto) → `@ui/Switch`. Tests: "Cambiar el tema" y "Cerrar un día con teclado".
- [x] 5.2 `ProductsTable` → `@ui/Checkbox` (cabecera con `indeterminate`, sin `ref`). Tests: los 3 escenarios de "Checkbox con estado indeterminado".
- [x] 5.3 `CustomerHistoryCard` → `@ui/Tabs`. Tests: cambio con teclado y panel vinculado.

## 6. Lint y documentación

- [x] 6.1 Regla `no-restricted-syntax` (D8) en `eslint.config.js` para `features/`, `pages/` y `layout/`. Verificar a mano que falla con un `<select>` de prueba (y quitarlo). Confirmar con grep que no quedan `role="switch"`/`role="tablist"` propios.
- [x] 6.2 Actualizar `frontend/CLAUDE.md` › Dialogs and selection lists (y `.claude/rules/frontend-ui.md` si corresponde) con `DateInput`, `TimeInput`, `Switch`, `Checkbox`, `Tabs` y la regla de lint.

## 7. QA visual

- [x] 7.1 Escribir `openspec/changes/shadcn-base-ui-fase-2/qa.md` con casos `TC-XX` de paridad contra la línea base (mismas pantallas de 0.1, claro y oscuro) más: calendario abierto dentro del formulario de turno, lista del Select abierta en modo oscuro, fecha inválida marcada en rojo.
- [x] 7.2 Ejecutar con `/qa-visual` (`tools/qa-runner`, 1440×900, claro y oscuro), corregir hallazgos y re-correr solo los casos afectados. Comparar `npm run build` con `baseline/bundle.txt` y anotar la diferencia.

## 8. Cierre

- [x] 8.1 Correr `npm run lint` y `npx vitest run` completos en `frontend/`: todo en verde.
