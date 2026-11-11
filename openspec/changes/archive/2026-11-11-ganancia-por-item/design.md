## Context

El change `homologar-items-presupuesto-atencion` (deployado 2026-11-11) dejó un componente compartido de ítems con % IVA libre y un concern `ItemizedTotals` (`line.rb` para el ítem, `itemized_totals.rb` para el padre) usado por `Budget`/`BudgetItem` y `ServiceRecord`/`ServiceRecordItem`. Hoy: `line_net = round(q × unit, 2)`, IVA por alícuota sobre la base neta, `exempt_total` para ítems sin alícuota, `items_grand_total = neto + IVA + exento`.

## Goals / Non-Goals

**Goals:** select de IVA fijo, % de ganancia guardado por línea, fórmula sumada, ganancia oculta en impresión.
**Non-Goals:** ganancia por defecto configurable por producto o categoría (es fija: 30% al elegir un producto), cambios a WhatsApp, normalizar ítems con % libre.

## Decisions

### D1. Columna `margin_percentage`
`decimal(6,2)`, `default: 0` (default de la base y del backend), `null: false` en `budget_items` y `service_record_items` (una migración con dos `add_column`, reversible). Validación: `numericality: { greater_than_or_equal_to: 0, less_than: 1000 }`. Default 0 ⇒ ningún total existente cambia.

### D2. Fórmula sumada en el concern
- Línea: `line_net = round(q × unit, 2)` (sin cambios), `line_margin = round(line_net × margin / 100, 2)`, `line_iva` no se calcula por línea (sigue por alícuota).
- Padre: `margin_total = Σ line_margin` (todos los ítems activos, con o sin IVA). `iva_breakdown` sin cambios (base = Σ line_net por alícuota). `items_grand_total = items_net_total + items_iva_total + exempt_total + margin_total`.
- `Budget#compute_totals`: `total_list = subtotal_net + total_iva + exempt_total + margin_total`; `total_card` igual que hoy sobre `total_list`. No se agrega columna en `budgets`; `margin_total` es método y se serializa.
- `BudgetItem#total` / `ServiceRecordItem#total` siguen guardando el neto (sin cambios de significado).
- *Alternativa descartada*: compuesta (IVA sobre neto + ganancia). El usuario eligió sumada aunque el IVA no sea el 21% del precio sin IVA; por eso la impresión no muestra neto ni base.

### D3. Alícuota fija con compatibilidad
`iva_rate`: `inclusion: { in: Product::IVA_RATES }, allow_nil: true, if: :will_save_change_to_iva_rate?`. Se quitan la normalización 0 → nil y `iva_rate_not_rounded_from_negative` del cambio anterior (0 deja de ser válido; vacío = sin IVA). Ítems viejos con 15% se pueden volver a guardar sin tocar la alícuota.
Front: vuelve `IvaRateSelect` (21 · 10,5 · Sin IVA) en `components/features/items/`. Si el valor actual no está entre las opciones, agrega una opción `"15% (anterior)"` para no perderlo. Se elimina `IvaRateInput`.

### D3b. Copiar ítems con % anterior
`Line` expone `attr_accessor :legacy_iva_rate_ok`; la inclusión se salta si es true. `BudgetsController#duplicate` lo setea en cada copia; `ServiceRecordsController#create` con `budget_id` lo setea en los ítems cuyo `iva_rate` coincide con alguno de los ítems del presupuesto de origen. `margin_percentage` nil/"" → 0 en `before_validation`.

### D4. Frontend
- Al elegir un **producto** del buscador la línea toma `margin_percentage` = 30 (constante `DEFAULT_PRODUCT_MARGIN`); servicio y texto libre quedan en 0.
- Redondeos en centavos enteros (sin flotantes intermedios) para igualar a BigDecimal del backend.
- `ItemRow`: nueva columna "% Ganancia" (input number 0–999,99, step 0.01, default 0) entre "Precio unit. s/IVA" y "IVA"; la columna de importe pasa a "Importe final". Grid: `4.5rem_minmax(0,1fr)_8rem_5.5rem_6.5rem_7rem_2.25rem`.
- `budgetMath`: `lineGrossTotal = net × (1 + iva/100 + margin/100)`; `computeItemsTotals` agrega `marginTotal` replicando D2 (mismos redondeos).
- `ItemsTotalsBar` desglose: Subtotal neto · Ganancia · IVA por alícuota · Sin IVA · Recargo.
- Payloads de presupuesto y atención envían `margin_percentage`; `budgetToFormItems` lo copia.

### D5. Impresión
- `BudgetPrintItems`: columnas Cant. · Descripción · P. UNIT. (final = unit × (1 + iva + margin)) · IMPORTE (final). Sin columna IVA.
- `BudgetPrintTotals`: líneas "IVA 21%", "IVA 10,5%" (sin "s/ base") solo si hay IVA, luego Efectivo/Débito y Tarjeta. Se quitan Subtotal neto, Subtotal con IVA y Sin IVA.

### D6. API
- Params: `items_attributes[][margin_percentage]` en budgets y service_records.
- Respuestas: ítems con `margin_percentage`; presupuesto (vista con ítems) y atención `with_details` con `margin_total`.

### D7. Dashboard
Ingresos por productos/servicios: `Σ quantity × unit_price × (1 + margin_percentage / 100)`.

## Risks / Trade-offs

- [IVA sumado no cierra visualmente con el precio sin IVA] → la impresión no muestra neto ni base (decisión del usuario).
- [Ítems con % libre del deploy anterior] → se conservan; el select muestra la opción "(anterior)".
- [Redondeo front ≠ back] → mismos redondeos (línea a 2 decimales, IVA por alícuota) y specs con el mismo escenario en ambos lados.

## Migration Plan

Una migración `AddMarginPercentageToItems` (reversible). Sin backfill. Rollback: `db:rollback` quita las columnas sin pérdida relevante (las ganancias cargadas se pierden).

## Open Questions

Ninguna.
