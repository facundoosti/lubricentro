## Why

En el taller el precio final se arma en cascada: al neto se le suma el IVA y **sobre ese precio con IVA** se aplica la ganancia. Hoy el sistema suma ambos porcentajes sobre el neto (`neto × (1 + IVA% + ganancia%)`), así que los importes quedan por debajo de lo que cobra el taller. Además la ganancia habitual de los productos es 50%, no 30%.

## What Changes

- **BREAKING (cálculo)**: el importe final de cada línea pasa a ser compuesto: `neto × (1 + IVA%) × (1 + ganancia%)`. La ganancia de la línea se calcula sobre neto + IVA de la línea. Ej.: 1 × $1.000, IVA 21%, ganancia 50% → IVA $210, ganancia $605, final $1.815.
- Los totales del backend (`total_list`, `total_card`, `total_amount`, `margin_total`) usan la ganancia compuesta. La vista previa del formulario, la impresión (precio unitario final) y WhatsApp siguen al backend.
- Los ingresos por productos/servicios del dashboard pasan a `neto + ganancia compuesta`.
- En "Productos y Servicios" la columna "% Ganancia" se mueve después de "IVA" (orden: Cant., Producto/servicio, Precio unit. s/IVA, IVA, % Ganancia, Importe final), reflejando el orden del cálculo.
- Al elegir un **producto** del buscador, la ganancia por defecto pasa de 30% a **50%**. Servicios y texto libre siguen en 0%; el default del backend sigue en 0.

Apps: **backend y frontend**. **Sin migraciones**.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `ganancia-items`: la fórmula sumada pasa a compuesta (IVA primero, ganancia sobre neto + IVA); default de producto 50%; orden de columnas; ingresos del dashboard con ganancia compuesta.
- `items-atencion`: el escenario "Atención con ganancia" cambia de total 1510 a 1573 por la fórmula compuesta.
- `copiar-presupuesto-a-atencion`: el escenario de copia con ganancia muestra el total compuesto ($1.573).

## Impact

- Backend: `ItemizedTotals::Line#line_margin` (y un nuevo IVA por línea), `ItemizedTotals#margin_total`/`items_grand_total`, `DashboardStatsService::ITEM_REVENUE_SQL`. Specs de modelos, requests y dashboard.
- Frontend: `utils/budgetMath.js` (`computeItemsTotals`, `lineGrossTotal`, `unitFinalPrice`, `DEFAULT_PRODUCT_MARGIN`), `ItemRow.jsx`, `ItemsEditor.jsx`; tests de budgetMath, ItemsEditor, ItemsTotalsBar, ItemSearchInput, BudgetPrint, BudgetForm, ServiceRecordFormPage, whatsapp.
- Datos existentes: `total_list`/`total_amount` persistidos de presupuestos y atenciones con ganancia > 0 quedan con la fórmula vieja hasta que se vuelvan a guardar.

## Fuera de alcance

- Recalcular en lote los totales persistidos de registros ya guardados (se puede hacer después con un rake si hace falta).
- Cambiar el default de ganancia de servicios o texto libre, o el default del backend.
- Mostrar la ganancia al cliente (sigue oculta en impresión y WhatsApp).
