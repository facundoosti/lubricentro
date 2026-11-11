## Why

El % de IVA libre se usaba para cargar el margen del lubricentro mezclado con el impuesto, y así el IVA discriminado quedaba mal. El usuario necesita separar las dos cosas: elegir la alícuota legal (21 / 10,5 / Sin IVA) y, aparte, cargar su % de ganancia por línea para llegar al precio final, sin que el cliente vea la ganancia en lo que se le entrega.

## What Changes

- **% IVA vuelve a ser un select** (21% · 10,5% · Sin IVA) en el componente compartido "Productos y Servicios". El backend vuelve a aceptar solo 21, 10,5 o vacío en `budget_items` y `service_record_items`. Los ítems ya guardados con otro % se conservan (la validación solo corre si cambia la alícuota) y el select los muestra como opción extra.
- **Nueva columna "% Ganancia"** por línea (`margin_percentage`, ≥ 0, < 1000, default 0) en presupuesto y atención, guardada en la base. Se copia de presupuesto a atención. Al elegir un **producto** del buscador arranca en 30%; servicios y texto libre en 0%. El default de la base es 0.
- **Fórmula sumada** (decisión del usuario): importe final de la línea = cantidad × unitario neto × (1 + IVA% + ganancia%). El IVA se calcula sobre el neto (sin ganancia), redondeado por alícuota como hoy. La ganancia de la línea = cantidad × neto × ganancia%.
- **Totales** de presupuesto (`total_list`, `total_card`) y atención (`total_amount`) incluyen la ganancia. Las respuestas exponen `margin_total`.
- **Impresión del presupuesto**: no muestra la ganancia. Cada línea muestra solo precio unitario final e importe final; el pie muestra IVA por alícuota (sin base), total efectivo/débito y total tarjeta. Se quitan subtotal neto, subtotal con IVA y "Sin IVA".
- **WhatsApp**: sin cambios de texto (ya muestra solo totales, que ahora incluyen la ganancia).
- **Formulario**: la ganancia se ve en la columna y en el desglose de la barra de totales ("Ganancia").
- Dashboard: los ingresos por productos/servicios incluyen la ganancia.

## Capabilities

### New Capabilities
- `ganancia-items`: % de ganancia por línea (guardado, fórmula sumada, totales, oculto al cliente).

### Modified Capabilities
- `presupuesto-iva`: la alícuota del ítem vuelve a 21 / 10,5 / vacía con select; la impresión deja de mostrar neto y base del IVA.
- `items-atencion`: el total de la atención incluye la ganancia.
- `copiar-presupuesto-a-atencion`: la copia incluye el % de ganancia.

## Impact

- **Apps**: backend y frontend.
- **Migraciones** (corren en el deploy): `add_column :budget_items, :margin_percentage, :decimal, precision: 6, scale: 2, default: 0, null: false` e idem en `service_record_items`. Reversibles, sin backfill (default 0 conserva todos los totales).
- **Backend**: concern `ItemizedTotals` / `ItemizedTotals::Line`, `BudgetItem`, `ServiceRecordItem`, `Budget`, `ServiceRecord`, controllers (params), serializers, `DashboardStatsService`, specs.
- **Frontend**: `ItemRow`, `ItemsEditor` (columnas), `IvaRateSelect` (vuelve; reemplaza `IvaRateInput`), `ItemsTotalsBar`, `utils/iva.js`, `utils/budgetMath.js`, `utils/items.js`, `utils/serviceRecord.js`, `BudgetPrintItems`, `BudgetPrintTotals`, tests.
- **API**: nuevo campo `margin_percentage` en ítems (params y respuestas) y `margin_total` en presupuesto y atención; `iva_rate` vuelve a rechazar valores fuera de 21 / 10,5.

## Fuera de alcance

- Ganancia por defecto configurable por producto o categoría (es fija: 30% al elegir un producto).
- Cambiar el texto del mensaje de WhatsApp.
- Impresión de la atención.
- Normalizar los ítems guardados con % libre (se conservan).
