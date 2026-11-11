# Fix: nombre de producto hasta 500 caracteres

## Lectura rápida
El nombre de producto estaba limitado a 100 caracteres y cortaba los nombres de las listas MAXOIL (WEGA). Se amplía a 500 en la columna, el modelo y el formulario, y también `budget_items.description` (300 → 500), donde se copia el nombre al presupuestar.

## Error
- Síntoma: al normalizar las listas MAXOIL, 998 de 4491 nombres quedaban truncados con "…".
- Causa: `products.name` es `varchar(100)` (`backend/db/schema.rb`), validación `length: { maximum: 100 }` (`backend/app/models/product.rb:46`) y `maxLength: 100` en `frontend/src/components/features/products/ProductForm.jsx:112`.
- Origen: pedido del usuario (quiere el nombre completo en el campo).

## Excepción al alcance de /quick-fix
Lleva una migración. El usuario aprobó hacerlo como quick-fix: la migración solo amplía el límite de la columna (sin pérdida de datos, sin cambio de API).

Límite elegido: 500 (en las listas MAXOIL p99 = 292 caracteres; solo 2 nombres lo superan).

## Plan
- [x] Test que reproduce (model spec `is_at_most(500)` + guardado de 500 chars en la base; 2 tests de ProductForm) — fallaban antes del fix
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (rails-reviewer + react-reviewer, sin bloqueantes)
- [x] QA visual: N/A — solo cambia el límite de validación del formulario (cubierto por Vitest); los ajustes de layout quedan como seguimiento

## Solución
- Migración `20261111120000_increase_products_name_limit.rb`: `products.name` pasa a `varchar(500)` (`up`/`down` explícitos; el `down` falla si ya hay nombres > 100).
- `Product` valida `length: { maximum: 500 }`.
- `BudgetItem` valida `description` hasta 500 y la misma migración amplía `budget_items.description` a `varchar(500)` (hallazgo del review: el nombre del producto se copia ahí; con 300 fallaban 41 productos MAXOIL).
- `ProductForm.jsx`: `maxLength` 500 con su mensaje.

## Verificación
- Base de test (pgvector, :5435): `db:migrate` → `db:rollback` → `db:migrate` OK; columna con límite 500.
- `rspec spec/models/product_spec.rb spec/services/product_import_service_spec.rb spec/requests/api/v1/products_spec.rb` → 95 ejemplos, 0 fallas.
- `vitest run src/components/features/products` → 33 tests OK.
- Suite completa: RSpec 972 ejemplos, 0 fallas · Vitest 457 tests OK.
- RuboCop y ESLint sin ofensas.
- Nota: el `bin/rails db:migrate` local de desarrollo apunta a un Postgres.app sin pgvector y falla en `InstallNeighborVector` (preexistente, ajeno al fix).

## Seguimiento
- Layout con nombres largos (react-reviewer): `ProductsTable.jsx:412` sin `line-clamp`/`break-words`; `BudgetPrintItems.jsx:31` puede romper la impresión en una hoja; `SearchableSelect.jsx:164` opciones sin truncar; `BulkPriceModal.jsx:287`; `ConfirmModal.jsx:59` sin `break-words`.
- `ProductForm`: sin `maxLength` HTML ni contador (pegar 600 caracteres solo falla al enviar).
- Test intermitente preexistente: `spec/requests/api/v1/budgets_spec.rb:64` (búsqueda "Ford" puede matchear un nombre de Faker).
- Al correr la suite se modifica `spec/fixtures/files/test.xlsx` (lo escribe un spec); revisar.
