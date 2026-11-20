# Fix: búsqueda de productos por nombre o código

## Lectura rápida
Los buscadores de productos solo encontraban por nombre. Ahora el parámetro `search` también busca por código (SKU). En el formulario de producto, el label "SKU" pasa a decir "Código".

## Error
- Síntoma: si se tipea el código de un producto en un buscador (listado, ítems de presupuesto/atención, actualización masiva), no lo encuentra.
- Causa: `Product.by_name` filtra solo con `name ILIKE` (`backend/app/models/product.rb:59`). Lo usan `ProductsController#index` y `#filtered_products_for_bulk` (`backend/app/controllers/api/v1/products_controller.rb:6` y `:210`), y todos los buscadores del frontend pasan por ese `search`.
- Origen: descripción del usuario.

## Plan
- [x] Test que reproduce (8 casos nuevos: 5 RSpec + 3 Vitest, fallaban antes del fix)
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (rails-reviewer con foco en seguridad + react-reviewer: 0 bloqueantes)
- [x] QA visual: cubierto por Vitest — solo cambian textos (label, mensaje de error, placeholders); sin layout ni estilos

## Solución
- `Product.search(term)` (`backend/app/models/product.rb`): `products.name ILIKE :q OR products.sku ILIKE :q` con bind nombrado y `sanitize_sql_like` (escapa `%`, `_`, `\`). Columnas calificadas para no chocar con joins.
- `ProductsController#index` y `#filtered_products_for_bulk` usan `search` en vez de `by_name`. Todos los buscadores del frontend (listado, ítems de presupuesto/atención, actualización masiva) pasan por ese `search`, así que lo heredan sin cambios.
- `ProductForm`: label "SKU" → "Código" y su mensaje de error. Placeholders y label que decían solo "nombre": `ProductsTable` ("Buscar por nombre o código..."), `ProductSearchInput` (default) y `BulkPriceFilters` ("Nombre o código contiene").
- Sin migración ni cambio de contrato (mismo param `search`, resultados más amplios).

### Seguimiento
- `BulkPricePreviewTable` sigue con la columna "SKU" (fuera de lo pedido: solo el formulario).
- `Product.by_name` quedó sin uso en `app/` (solo lo usa `product_spec.rb`).
- `ILIKE '%x%'` hace seq scan; si el catálogo llega a cientos de miles de filas, evaluar `pg_trgm` + GIN sobre `name` y `sku`.
- El nombre `search` podría chocar si en el futuro se suma `ransack`/`pg_search`.

## Verificación
- Tests nuevos vistos fallar antes del fix: 5 RSpec + 3 Vitest.
- `bundle exec rspec spec/models/product_spec.rb spec/requests/api/v1/products_spec.rb` → 84 ejemplos, 0 fallas.
- `bundle exec rubocop` (modelo, controller, specs) → 0 ofensas.
- `npx vitest run` (suite completa) → 78 archivos, 755 tests OK.
- `npx eslint src/components/features/products` → OK.
