## 1. Backend — cálculo compuesto

- [x] 1.1 Specs primero: actualizar specs de modelo (`budget`, `service_record`, `ItemizedTotals`) y request con los escenarios nuevos (1×1000 21% g30 → margin 363, total_list 1573, total_card 1730.3; g50 → 605/1815; sin IVA 2×500 g20 → 1200/200; atención g30 → 1573)
- [x] 1.2 `ItemizedTotals::Line`: agregar `line_iva` (round(neto × IVA% / 100, 2), 0 sin alícuota) y calcular `line_margin` sobre `line_net + line_iva`; actualizar comentarios de `ItemizedTotals` y `Line`
- [x] 1.3 `DashboardStatsService`: `ITEM_REVENUE_SQL` con ganancia compuesta (neto + round((neto + iva_línea) × g% / 100, 2)); spec del dashboard con el caso 1×1000 21% g50 → 1605 y el existente 1,5×33,33 sin IVA g10 → 55
- [x] 1.4 `bundle exec rspec` de los specs tocados + `bundle exec rubocop` de los archivos tocados

## 2. Frontend — cálculo compuesto

- [x] 2.1 Tests primero en `utils/__tests__/budgetMath.test.js`: `computeItemsTotals` (marginTotal 363/605, totalList 1573/1815, totalCard 1730.3), `lineGrossTotal` 1815, `unitFinalPrice` compuesto, línea sin IVA sin cambios
- [x] 2.2 `utils/budgetMath.js`: ganancia de línea sobre neto + IVA de la línea en centavos; `finalCents` compuesto; actualizar comentarios
- [x] 2.3 `DEFAULT_PRODUCT_MARGIN` 30 → 50 y actualizar tests de `ItemSearchInput`/formularios que esperan 30
- [x] 2.4 Ajustar expectativas de montos en tests de `ItemsTotalsBar`, `ItemsEditor`, `BudgetPrint`, `BudgetForm`, `ServiceRecordFormPage`, `whatsapp`, `budget`, `serviceRecord` que dependan de la fórmula sumada

## 3. Frontend — orden de columnas

- [x] 3.1 Test en `ItemsEditor.test.jsx`: el encabezado "% Ganancia" va después de "IVA" y antes de "Importe final"; en la fila el input de ganancia sigue al selector de IVA
- [x] 3.2 `ItemsEditor.jsx`: reordenar `HEADERS` y el template de columnas de la grilla; actualizar el tip ("primero el IVA y después la ganancia")
- [x] 3.3 `ItemRow.jsx`: IVA antes que ganancia (DOM y `md:order-*`), mismo template de grilla; actualizar el comentario de la fórmula
- [x] 3.4 `npx vitest run` de los tests tocados + `npx eslint` de los archivos tocados
