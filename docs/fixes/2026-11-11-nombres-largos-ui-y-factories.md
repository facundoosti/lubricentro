# Fix: nombres de producto largos en la UI y factories con valores únicos

## Lectura rápida
Desde que el nombre de producto admite 500 caracteres (MAXOIL: 997 nombres de más de 100), varias pantallas mostraban filas enormes o podían desbordar. Ahora el nombre se recorta a 2 líneas y el texto completo queda en un tooltip. Además, 3 factories de test podían repetir valores únicos y hacer fallar specs al azar.

## Error
- Síntoma 1: nombres de hasta 500 caracteres sin recorte en la tabla de productos, en las opciones de `SearchableSelect`, en la vista previa de precios por lote y en la impresión del presupuesto (que puede dejar de entrar en una hoja). En el mensaje de `ConfirmModal`, un texto sin espacios desborda.
- Causa 1: `ProductsTable.jsx:412`, `SearchableSelect.jsx:164`, `BulkPriceModal.jsx:287`, `BudgetPrintItems.jsx:31` y `ConfirmModal.jsx:59` no tienen ni `line-clamp` ni `break-words`.
- Síntoma 2: posibles fallas al azar en CI por violar índices únicos.
- Causa 2: `spec/factories/services.rb:20` usa `Faker::Commerce.unique` sin `clear` (lanza `RetryLimitExceeded` si se agota). `vehicles.rb:28` (patente) y el trait `with_contact` de `suppliers.rb:33` (CUIT) usan valores aleatorios en columnas con índice único.
- Origen: seguimientos de `2026-11-11-nombre-producto-500.md` y `2026-11-11-deploy-espera-ci.md`.

## Plan
- [x] Test que reproduce
  - Backend: `spec/models/factories_uniqueness_spec.rb` fuerza el peor caso (Faker y `rand` devuelven siempre lo mismo). Los 3 fallaron antes del fix.
  - Frontend: tests de tooltip con el nombre completo en ProductsTable, SearchableSelect y BulkPriceModal. Los 3 fallaron antes del fix.
  - El recorte visual (`line-clamp`) y la impresión no se pueden medir en jsdom: se cubren con QA visual.
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (react-reviewer, sin bloqueantes; se aplicaron `overflowWrap: 'break-word'` y el reset del mock)
- [x] QA visual: `docs/qa/2026-11-11-nombres-largos.md`, 6/6 must OK (vitest + script). TC-07 (impresión real) queda manual

## Solución
- `ProductsTable`: el nombre se muestra con `line-clamp-2 break-words` y `title`, dentro de un contenedor `min-w-0`.
- `SearchableSelect`: cada opción tiene `title` y su texto lleva `line-clamp-2 break-words`.
- `BulkPriceModal`: la celda del nombre tiene `max-w-md` y un span con recorte a 2 líneas y `title`.
- `ConfirmModal`: se agrega `break-words` al mensaje.
- `BudgetPrintItems`: la descripción se muestra en un máximo de 2 líneas (`-webkit-box`, `overflowWrap: break-word`) para que el presupuesto siga entrando en una hoja.
- Factories: `sequence` en `services.name`, `vehicles.license_plate` (`AB000001`) y `suppliers.cuit` (trait `with_contact`).

## Verificación
- `rspec spec/models/factories_uniqueness_spec.rb`: 3 fallas antes del fix, 0 después. Suite completa: 976 ejemplos, 0 fallas. RuboCop sin ofensas.
- `vitest run src/components`: 245 tests OK. ESLint sin errores.
- QA visual (Playwright, desktop-dark): 5/5 casos de script OK.

## Seguimiento
- `SearchableSelect`: `title` en todas las opciones. Se podría poner solo cuando el label es largo.
- `ProductForm`: sin `maxLength` HTML ni contador (heredado del fix de 500).
