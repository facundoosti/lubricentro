## 1. Backend

- [x] 1.1 Migración `AddMarginPercentageToItems` (`budget_items` y `service_record_items`, `decimal(6,2)`, default 0, null false); correr en docker y probar rollback
- [x] 1.2 `ItemizedTotals::Line`: validación `margin_percentage` (0 ≤ x < 1000), `line_margin`; `iva_rate` vuelve a `inclusion` 21/10,5/nil solo si cambia la alícuota (quitar normalización 0→nil y validación de negativos redondeados); specs (15 nuevo → inválido, ítem viejo con 15 se re-guarda, -5 de ganancia → inválido)
- [x] 1.3 `ItemizedTotals` (padre): `margin_total` e `items_grand_total` con ganancia; `Budget#compute_totals` suma la ganancia; specs (1 × 1000, 21%, 30%, recargo 10% → 1000/210/300/1510/1661; escenario mixto sin ganancia sigue 43620/47982; atención 2 × 500 sin IVA 20% → 1200)
- [x] 1.4 Controllers de budgets y service_records permiten `margin_percentage`; serializers de ítems y padres exponen `margin_percentage` / `margin_total`; request + serializer specs
- [x] 1.5 `DashboardStatsService`: ingresos por productos/servicios incluyen la ganancia; spec

## 2. Frontend

- [x] 2.1 `utils/iva.js` y `budgetMath.js`: opciones fijas de alícuota (con opción "(anterior)" para valores fuera de la lista), `lineGrossTotal` con ganancia sumada, `computeItemsTotals` con `marginTotal`; tests (1.510, 300, 210)
- [x] 2.2 `IvaRateSelect` en `components/features/items/` (21 · 10,5 · Sin IVA + "(anterior)") reemplaza `IvaRateInput`; tests
- [x] 2.3 `ItemRow` / `ItemsEditor`: columna "% Ganancia" (default 0) y "Importe final"; `utils/items.js`, `utils/budget.js`, `utils/serviceRecord.js` mapean `margin_percentage` (form ↔ API y copia desde presupuesto); tests
- [x] 2.4 `ItemsTotalsBar`: línea "Ganancia" en el desglose; tests
- [x] 2.5 `BudgetPrintItems` / `BudgetPrintTotals`: precio unitario e importe finales, sin columna IVA, pie con IVA por alícuota sin base + totales, sin neto/subtotales/sin IVA/ganancia; tests de BudgetPrint (escenario 1.510 / 1.661 sin "Ganancia" ni "$300")
- [x] 2.6 Test de `buildBudgetMessage` que confirma que no menciona la ganancia

## 3. QA visual

- [x] 3.1 Escribir casos TC-XX en `openspec/changes/ganancia-por-item/qa.md` (select de IVA, ganancia en presupuesto y atención, copiar con ganancia, impresión sin ganancia; desktop 1440×900, claro/oscuro)
- [x] 3.2 Ejecutar con `/qa-visual` y corregir hallazgos

## 4. Cierre

- [x] 4.1 Lint y tests completos: `bundle exec rspec` + `bundle exec rubocop` (backend), `npx vitest run` + `npm run lint` (frontend)
