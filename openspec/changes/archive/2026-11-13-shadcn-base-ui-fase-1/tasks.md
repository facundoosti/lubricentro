Solo **frontend**. Sin backend ni migraciones.

## 0. Línea base visual (antes de tocar código)

- [x] 0.1 Con `tools/qa-runner` capturar en 1440×900, tema claro y oscuro: formulario de cliente, de vehículo con alta de cliente apilada, de producto con el Combobox de categoría abierto, de turno con el Select de estado abierto, un `ConfirmModal` de eliminar, `CustomerCreatedDialog`, `BulkIvaModal`, `BulkPriceModal`, `ProductImportModal`, `ImageLightbox`, y el listado de productos con el filtro de marcas desplegado y 2 chips. Guardar en `openspec/changes/shadcn-base-ui-fase-1/baseline/`.
- [x] 0.2 Anotar el tamaño de `npm run build` (JS total gzip) en `baseline/bundle.txt`.

## 1. Frontend — Base shadcn / Base UI

- [x] 1.1 Correr `npx shadcn@latest init` (Vite, Base UI, `tsx: false`, `baseColor: zinc`, alias `ui → @/components/ui/primitives`, `utils → @/lib/utils`). Crear `jsconfig.json` con `@/*`. Revertir lo que el CLI inyecte en `index.css` y cualquier `.tsx`. Confirmar el nombre del paquete de Base UI en `design.md` (Open Questions).
- [x] 1.2 `src/lib/utils.js` con `cn()` (`clsx` + `tailwind-merge`) y test de Vitest (spec "Helper cn").
- [x] 1.3 Bloque `@theme inline` de alias en `index.css` según la tabla de D2, sin tocar los tokens existentes. Test de Vitest que lee `index.css` y verifica que los `--color-*` previos no cambiaron y que existen los alias.
- [x] 1.4 Polyfills mínimos para Base UI en `src/test/setup.js` (ResizeObserver, `getAnimations`, etc.) y correr la suite completa: tiene que seguir en verde.
- [x] 1.5 Regla ESLint `no-restricted-imports` que prohíba importar `@/components/ui/primitives/*` desde `features/` y `pages/` (spec "Features sin primitivas directas").

## 2. Frontend — Dialog y ConfirmDialog

- [x] 2.1 Agregar las primitivas `dialog` y `alert-dialog` con el CLI en `ui/primitives/`, ajustando las clases a los tokens del design system (D2).
- [x] 2.2 `@ui/Dialog` (D3): modo formulario (header/footer fijos, `formId`, `submitLabel`, `isLoading`, `submitDisabled`), modo libre, tamaños, `closeOnBackdrop`, `closeOnEscape`, `showCloseButton`, apilado más angosto con fondo más oscuro. Tests: portar los escenarios de `FormDialog.test.jsx`, `Modal.test.jsx` y `useDialogLayer.test.jsx` (pila, Escape del de arriba, Escape con `defaultPrevented`, trampa de foco, retorno de foco, scroll lock, fondo no interactuable, click en el fondo según el modo).
- [x] 2.3 Contexto `DialogPortalContainer` exportado desde `@ui/Dialog` (D7). Adaptar `CustomerSearchInput` y `ProductSearchInput` para portear su lista ahí cuando están en un diálogo y quitar el z-index manual. Tests: click en opción y Escape (cierra solo la lista) dentro de un `Dialog` y de un `Dialog` apilado.
- [x] 2.4 `@ui/ConfirmDialog` sobre AlertDialog con la API de `ConfirmModal`. Tests: confirmar, cancelar, `isLoading`, click en el fondo cierra sin ejecutar, retorno de foco al disparador.
- [x] 2.5 Migrar los 7 consumidores de `FormDialog` (Customer, Product, Appointment, Supplier, Vehicle, Service, CopyFromBudgetDialog) a `Dialog`. Ajustar sus tests.
- [x] 2.6 Migrar `CustomerCreatedDialog` y `BulkIvaModal` (`Modal`) a `Dialog` en modo libre. Ajustar sus tests.
- [x] 2.7 Migrar `BulkPriceModal` y `ProductImportModal` (`useDialogLayer` directo) a `Dialog`, con `closeOnBackdrop=false` y Escape deshabilitado durante la importación. Tests de "Importación en curso" y "Cambio masivo de precios no cierra con click afuera".
- [x] 2.8 Migrar `ImageLightbox` a `Dialog` (`size="full"`), manteniendo navegación con flechas y cierre con click en el fondo. Ajustar `ImageLightbox.test.jsx`.
- [x] 2.9 Migrar los 8 usos de `ConfirmModal` en `pages/` a `ConfirmDialog`.
- [x] 2.10 Borrar `Modal.jsx`, `FormDialog.jsx`, `ConfirmModal.jsx`, `useDialogLayer.js` y sus tests. Quitar `data-app-content` de `App.jsx` si queda sin uso. Verificar con `codegraph callers` / grep que no queden referencias.

## 3. Frontend — Combobox y Select

- [x] 3.1 Agregar las primitivas `combobox` y `select` con el CLI en `ui/primitives/`, ajustando las clases a los tokens.
- [x] 3.2 `@ui/Combobox` (D5): simple y `multiple` con chips, `onSearch` (sin filtro local), `loading`, `clearable` ("Limpiar"), "Sin resultados", `error`, `disabled`, `aria-labelledby`. Tests de todos los escenarios de `listas-seleccion` del Combobox, más los portados de `SingleSelectSearch.test.jsx`, `MultiSelectSearch.test.jsx` y `SearchableSelect.test.jsx` (Escape dentro de diálogo, opciones largas, scroll).
- [x] 3.3 `@ui/Select` (D6). Tests: teclado, etiqueta accesible, Escape dentro de un `Dialog` cierra solo la lista.
- [x] 3.4 Migrar `ProductForm` (categoría) a `Combobox` simple y `ProductsTable` (marcas, proveedores, categorías) a `Combobox multiple`. Ajustar sus tests.
- [x] 3.5 Migrar `AppointmentForm` (hora y estado) a `Select`. Ajustar sus tests.
- [x] 3.6 Borrar `SingleSelectSearch.jsx`, `MultiSelectSearch.jsx`, `SearchableSelect.jsx` y sus tests. Borrar `useFloatingPosition` si queda sin uso.

## 4. Documentación

- [x] 4.1 Actualizar `frontend/CLAUDE.md` (stack: shadcn/Base UI, `primitives/` vs wrappers, componentes disponibles) y `.claude/rules/frontend-ui.md` (usar `Dialog`/`ConfirmDialog`/`Combobox`/`Select`; no importar primitivas desde features).
- [x] 4.2 Agregar en `docs/DESIGN_SYSTEM.md` la tabla de alias de tokens shadcn → MD3.

## 5. QA visual

- [x] 5.1 Escribir `qa.md` con casos TC-XX: paridad visual contra `baseline/` (cada pantalla de 0.1, en claro y oscuro) y casos de comportamiento que no cubre Vitest (apilado visual, fondo más oscuro, lista por encima del diálogo).
- [x] 5.2 Ejecutar con `/qa-visual` (`tools/qa-runner`, desktop 1440×900, ambos temas).
- [x] 5.3 Corregir los hallazgos y volver a correr solo los casos afectados.

## 6. Cierre

- [x] 6.1 Comparar `npm run build` contra `baseline/bundle.txt` y anotar la diferencia.
- [x] 6.2 Correr `npm run lint` y `npx vitest run` completos en `frontend/`, todo en verde.
