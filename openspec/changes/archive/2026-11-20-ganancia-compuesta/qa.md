# QA visual — ganancia-compuesta

## Riesgo: medio — componente compartido ("Productos y Servicios" en presupuesto y atención) con cambio de layout de grilla y de cálculo; sin tokens ni colores nuevos

Script: `qa.mjs` · capturas en `tmp/qa/ganancia-compuesta/`

- [x] **TC-01** · must · script · desktop-dark · `/budgets/new`: encabezados en orden Cant., Producto/servicio, Precio, IVA, % Ganancia, Importe final; grilla de 7 columnas en encabezado y fila (Tailwind generó `ITEMS_GRID_COLS`); IVA, % Ganancia e Importe final alineados con su celda — *spec: ganancia-items › Columna "% Ganancia" en el formulario › Orden de columnas* · ✅ 173d123+wt · 7 cols header/fila; IVA 992–1096, Ganancia 1104–1192 alineados
- [x] **TC-02** · must · script · desktop-dark · 1 × $1.000, IVA 21%, ganancia 50% → línea $1.815, desglose IVA 21% $210 y Ganancia $605, total $1.815, tip nuevo visible — *spec: ganancia-items › Fórmula compuesta › Vista previa en el formulario* · ✅ 173d123+wt · línea $1.815, IVA $210, Ganancia $605, total $1.815, tip visible
- [x] **TC-03** · must · script · desktop-dark · Regresión: `/service-records/new` con el mismo orden y alineación — *regresión: ServiceRecordFormPage* · ✅ 173d123+wt · mismo orden y alineación en atención
- [x] **TC-04** · should · script · desktop-light · `/budgets/new` orden y alineación en tema claro — *origen: diff* · ✅ 173d123+wt · tema claro alineado
- [x] **TC-05** · must · vitest · Elegir un producto → ganancia 50%; servicio → 0% — *spec: ganancia-items › Columna "% Ganancia" › Elegir un producto / servicio* · ✅ `ItemSearchInput.test.jsx` (suite completa 752/752)
- [x] **TC-06** · must · vitest · Cálculos de la barra, impresión y WhatsApp con la fórmula compuesta (1573/363/1730,30) — *spec: ganancia-items › Ganancia oculta al cliente* · ✅ `budgetMath`, `ItemsTotalsBar`, `BudgetPrint`, `whatsapp` tests

## Hallazgos

Ninguno. 4/4 casos de script + 2/2 de Vitest en verde.
