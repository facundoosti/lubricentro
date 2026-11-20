## Context

Hoy la ganancia se calcula sobre el neto y se suma al IVA (`ItemizedTotals::Line#line_margin = round(neto × g% / 100, 2)`). El frontend replica el cálculo en centavos enteros en `utils/budgetMath.js` (`computeItemsTotals`, `lineGrossTotal`, `unitFinalPrice`) para que la vista previa coincida con el backend. El dashboard suma ingresos con `ITEM_REVENUE_SQL = neto + round(neto × g% / 100, 2)`. El backend es la fuente de verdad: persiste `total_list` (presupuesto) y `total_amount` (atención) al guardar.

## Goals / Non-Goals

**Goals:**
- Ganancia compuesta: `ganancia_línea = round((neto + iva_línea) × g% / 100, 2)` con `iva_línea = round(neto × IVA% / 100, 2)` (0 sin alícuota).
- Backend, vista previa, impresión, WhatsApp y dashboard con el mismo número, al centavo.
- Columna "% Ganancia" después de "IVA"; default de producto 50%.

**Non-Goals:**
- Recalcular registros ya guardados.
- Cambiar el redondeo del IVA de los totales (sigue por alícuota).

## Decisions

1. **IVA por línea solo para la base de la ganancia.** `Line#line_iva` = `round(line_net × iva_rate / 100, 2)` (0 si `iva_rate` nil). `line_margin = ((line_net + line_iva) × margin / 100).round(2)`. Los totales siguen sumando IVA por alícuota (`iva_breakdown`) + ganancias de línea. Alternativa descartada: ganancia sobre el total con IVA por alícuota → no se puede mostrar por línea y rompe el importe de cada fila.
   - Consecuencia: con varias líneas de la misma alícuota, `Σ importes de línea` puede diferir del total en ±1 centavo por el redondeo del IVA (ya pasaba hoy). Se acepta.
2. **Frontend en centavos enteros**, igual que hoy: `lineIvaCents = percentOfCents(net, rateBp)`, `lineMarginCents = percentOfCents(net + lineIvaCents, marginBp)`. `finalCents(netCents) = net + iva + percentOfCents(net + iva, marginBp)`; se reutiliza para `lineGrossTotal` (neto de la línea) y `unitFinalPrice` (unitario). El redondeo half-up de `divRound` iguala a `BigDecimal#round(2)`.
3. **Dashboard en SQL**: `ITEM_IVA_SQL = ROUND(ITEM_NET_SQL * COALESCE(iva_rate, 0) / 100, 2)`; `ITEM_REVENUE_SQL = ITEM_NET + ROUND((ITEM_NET + ITEM_IVA) * margin_percentage / 100, 2)`. El IVA no se cuenta como ingreso. `ROUND` de Postgres sobre numeric es half-away-from-zero, igual que Ruby para positivos.
4. **Orden de columnas**: se cambia el orden en `HEADERS` de `ItemsEditor` y los `md:order-*` de `ItemRow` (IVA order-4, Ganancia order-5); el ancho de la grilla se reordena para que cada columna conserve su ancho (`8rem_6.5rem_5.5rem`). En mobile el orden del DOM también se ajusta (IVA antes que ganancia).
5. **Default 50%**: `DEFAULT_PRODUCT_MARGIN = 50` en `budgetMath.js`. Solo lo usa `ItemSearchInput` al mapear productos.

## Risks / Trade-offs

- [Totales persistidos viejos] Presupuestos/atenciones con ganancia > 0 guardados antes del deploy muestran `total_list`/`total_amount` con la fórmula sumada hasta re-guardarse, mientras `margin_total` (calculado al vuelo) ya sale compuesto → posible inconsistencia visible en el detalle. Mitigación: se anota como pendiente un rake de recálculo si el usuario lo pide; la feature de ganancia es reciente, el volumen es bajo.
- [Dashboard histórico] Los ingresos de períodos pasados cambian (suben) al deploy, porque se calculan al vuelo. Se acepta: reflejan la regla nueva.
- [Diferencia de 1 centavo] entre suma de líneas y total, ver decisión 1.
