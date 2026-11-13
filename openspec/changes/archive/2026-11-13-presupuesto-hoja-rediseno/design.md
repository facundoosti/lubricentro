## Context

`BudgetPrint.jsx` arma la hoja con estilos inline, porque html2canvas los captura bien, y ya supera las 300 líneas. Los totales `total_list` y `total_card` los calcula `Budget` en el backend. Los ítems de presupuesto guardan una copia de la descripción y los precios, pero no el `product_id`.

## Goals / Non-Goals

**Goals:** que la hoja impresa coincida con el mockup aprobado; guardar los datos nuevos (CUIT, tipo de factura, email, Instagram, cuotas y SKU); tener el color de marca en un solo lugar.

**Non-Goals:** reemplazar html2canvas y validar el CUIT contra AFIP.

## Decisions

1. **Color de marca en una constante.** Se crea `frontend/src/components/features/budgets/printTheme.js` con `BRAND = '#F04E23'` y los grises. Así cambiarlo es tocar una sola línea cuando el dueño confirme.
2. **Se parte `BudgetPrint.jsx`.** `PrintSheet` pasa a `components/features/budgets/BudgetPrintSheet.jsx`, y el encabezado y el pie van a subcomponentes chicos. La página queda solo con la carga y el PDF. Esto también resuelve el pendiente técnico de las 300 líneas.
3. **El SKU se guarda como copia en `budget_items.product_code`** (string de 50, nullable), no como `product_id`. Esto mantiene la regla actual: el presupuesto es una copia y no depende del catálogo. `ItemsEditor` completa `product_code` con `product.sku` al elegir un producto. Si se edita la descripción a mano, el código queda como está. Si se limpia el ítem, se borra.
4. **Planes de cuotas en una tabla propia** (`installment_plans`: `name`, `installments` int > 1, `surcharge_percentage` decimal(5,2) ≥ 0, `active` bool default true, `position` int). Se descartó un jsonb en `settings` porque necesita validaciones y orden.
5. **Cálculo de las cuotas.** Para cada plan activo: `total_plan = total_list × (1 + recargo/100)` y `cuota = total_plan / cuotas`, ambos redondeados a 2 decimales. El recargo de la tarjeta en 1 pago (`card_surcharge_percentage`) no cambia. El cálculo vive en el backend: `Budget#installment_options` se expone en el serializer del presupuesto como `installment_options: [{name, installments, installment_amount, total}]`. Así la hoja no repite lógica de dinero.
6. **Datos fiscales del cliente.** `cuit` es un string de 13, con formato `NN-NNNNNNNN-N` o 11 dígitos que se normalizan al guardar, y es opcional. `invoice_type` es un string con los valores `A`, `B`, `C` o `CF`, y también es opcional. En la hoja se muestran solo si tienen valor.
7. **Settings**: `email` (validación de formato, opcional) e `instagram` (se guarda sin `@`; la hoja agrega el `@`).
8. **Leyenda fija** "NO VÁLIDO COMO COMPROBANTE DE FACTURACIÓN", abajo de los totales y siempre visible.
9. **El pie** muestra el email y el Instagram si existen. Si no hay ninguno, el pie no se muestra.

## Risks / Trade-offs

- El color sin confirmar → se aísla en la constante (decisión 1).
- Los presupuestos viejos no tienen SKU → se imprimen sin código, sin romper nada.
- Con muchos planes activos, la hoja puede pasar de una A4 → la hoja muestra como máximo 3 planes, en orden de posición.

## Migration Plan

Son 4 migraciones de solo agregar, reversibles y sin backfill. Corren en el deploy de Railway.
