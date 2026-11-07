## Context

- `products.unit_price` se guarda **sin IVA**. No existe ningún dato de alícuota.
- `services.base_price` es precio final (con IVA incluido).
- `Budget#compute_totals` calcula `total_list = Σ qty × unit_price` y `total_card = total_list × (1 + recargo%)`.
- `BudgetItem` guarda `description`, `quantity`, `unit_price` y `total`, sin referencia al producto ni a la alícuota.
- `budgets.vehicle_id` existe en la tabla pero el frontend nunca lo envía: solo guarda `vehicle_description` como texto.
- `ProductsController` ya tiene selección masiva (`product_ids` o filtros) vía `filtered_products_for_bulk`, usada por el ajuste de precios.
- `ProductImportService` lee columnas fijas por posición (1 a 8).
- `BudgetForm.jsx` tiene 484 líneas (excede el límite de 300 del frontend).

## Goals / Non-Goals

**Goals:**
- Cotizar con IVA discriminado (21% y 10,5%) sin modificar los precios guardados.
- Que los totales sean calculados y persistidos por el backend (fuente de verdad).
- Que los presupuestos existentes conserven sus totales.
- Hacer la carga del presupuesto más rápida y usable en mobile.

**Non-Goals:**
- Facturación electrónica, IVA en servicios o atenciones, otras alícuotas, alícuota por categoría.

## Decisions

### 1. Alícuota guardada en el producto como decimal
- `products.iva_rate decimal(4,2) NOT NULL DEFAULT 21.0`, validación `inclusion: [21, 10.5]`.
- El default resuelve el backfill: todos los productos existentes quedan en 21%.
- **Alternativa descartada:** enum (`iva_21`, `iva_10_5`). El decimal simplifica el cálculo y permite sumar alícuotas en el futuro sin migrar datos.

### 2. Foto de la alícuota en cada ítem del presupuesto
- `budget_items.iva_rate decimal(4,2) NULL`. `NULL` = sin IVA (precio final).
- Validación: `inclusion: [21, 10.5], allow_nil: true`.
- Los ítems existentes quedan en `NULL` → **sus totales no cambian**.
- El frontend define el valor inicial (producto → su alícuota; servicio → `null`; texto libre → 21) y el usuario puede cambiarlo por línea.
- **Alternativa descartada:** `product_id` en el ítem y leer la alícuota en vivo. Si cambia el producto, cambiaría un presupuesto ya enviado.

### 3. Totales en el backend
- Nuevas columnas en `budgets`: `subtotal_net decimal(12,2) default 0` y `total_iva decimal(12,2) default 0`.
- `BudgetItem#total` sigue siendo neto (`qty × unit_price`).
- `Budget#compute_totals`:
  - `subtotal_net` = Σ `total` de ítems con alícuota.
  - `total_iva` = Σ por alícuota de `round(base × rate / 100, 2)`.
  - `exempt` = Σ `total` de ítems sin alícuota.
  - `total_list` = `subtotal_net + total_iva + exempt` (efectivo/débito).
  - `total_card` = `round(total_list × (1 + recargo / 100), 2)`.
- `Budget#iva_breakdown` (no persistido, se arma desde los ítems): `[{ rate: "21.0", base: "…", amount: "…" }, …]` y `exempt_total`. Se expone en el serializer.
- El frontend replica el cálculo en `utils/budgetMath.js` **solo como vista previa**; al guardar se muestran los valores del backend.
- **Redondeo:** el IVA se redondea por alícuota (no por línea), igual en back y front.

### 4. Edición masiva de alícuota
- `POST /api/v1/products/bulk_iva_update`
  - Params: `iva_rate` (21 | 10.5) y `product_ids[]` **o** los mismos filtros que `bulk_price_update` (`supplier_id`, `search`, `brand`).
  - Reutiliza `filtered_products_for_bulk`, al que se suman los filtros `category_id` y `active` para que "seleccionar todos los que coinciden" respete los mismos filtros que la tabla (también aplica a `bulk_price_*`).
  - Exige `product_ids`, algún filtro o `all=true`: un request sin criterios no puede cambiar todo el catálogo.
  - Usa `update_all(iva_rate:, updated_at:)`: no dispara regeneración de embeddings.
  - Respuesta: `{ success: true, data: { updated: N }, message: "Alícuota actualizada en N productos" }`.
  - Error: `iva_rate` inválido o sin productos → `422` con `{ success: false, errors: [...], message }`.
- Frontend: botón "Cambiar IVA" en la barra de selección de `ProductsTable`, junto a "Actualizar precios". Abre un modal chico con dos opciones (21% / 10,5%) y la cantidad afectada.

### 5. Importador
- Nueva columna opcional 9 `iva`. Acepta `21`, `21%`, `10,5`, `10.5`, `10,5%`.
- Vacía → producto nuevo queda en 21; producto existente **conserva** su alícuota (coherente con "sin pisar datos").
- Valor inválido → error de fila, como el precio.
- Se actualiza la plantilla descargable (`import_template`).

### 6. Serializers
- `ProductSerializer`: `iva_rate` y `unit_price_with_iva` (string, redondeado a 2).
- `BudgetItemSerializer`: `iva_rate`.
- `BudgetSerializer` (default y `with_items`): `subtotal_net`, `total_iva`; en `with_items` además `iva_breakdown` y `exempt_total`.

### 7. Duplicar presupuesto
- `POST /api/v1/budgets/:id/duplicate`
  - Crea un presupuesto nuevo: mismo cliente, vehículo, notas, recargo e ítems (con su alícuota guardada). `status: "draft"` y `date: hoy`.
  - Respuesta `201`: `{ success: true, data: <budget with_items>, message: "Presupuesto duplicado" }`.
  - El frontend navega a `/presupuestos/:nuevo_id/editar`.

### 8. Vehículo vinculado
- Al elegir un vehículo del cliente se envían `vehicle_id` y `vehicle_description` (texto formateado para el PDF).
- Si el cliente no tiene vehículos o no hay cliente → texto libre y `vehicle_id: null`.
- Al cambiar de cliente se limpian ambos.
- Backend: validar que `vehicle.customer_id == customer_id` cuando ambos están presentes.

### 9. Cambio rápido de estado
- Reusa `PATCH /api/v1/budgets/:id` con `{ budgets: { status } }`. No requiere endpoint nuevo.
- En el listado, el badge de estado pasa a ser un menú desplegable. Filtro por estado con chips (Todos / Borrador / Enviado / Aprobado / Rechazado) usando el `status` que el index ya soporta.

### 10. WhatsApp
- Solo frontend: link `https://wa.me/<tel>?text=<resumen>`.
- Teléfono: solo dígitos; si no empieza con `54`, se antepone `549`.
- Resumen: nombre del lubricentro, n° y fecha, vehículo, total efectivo/débito y total tarjeta.
- Si el cliente no tiene teléfono, el botón se muestra deshabilitado con un tooltip.

### 11. Estructura del frontend
`BudgetForm.jsx` se divide para quedar bajo 300 líneas:
- `components/features/budgets/BudgetGeneralSection.jsx` (fecha, estado, cliente, vehículo, notas)
- `components/features/budgets/BudgetItemsEditor.jsx` (tabla en `md+`, tarjetas en mobile)
- `components/features/budgets/BudgetItemRow.jsx`: una sola fila responsive (tarjeta en mobile, fila de grilla desde `md`). Se descartó tener `BudgetItemCard` aparte porque duplicaría los inputs registrados en React Hook Form.
- `components/features/budgets/BudgetActions.jsx` (Imprimir · WhatsApp · Duplicar, también en modo compacto para el listado)
- `utils/budget.js` (estados, valores del formulario y armado del payload, incluido `_destroy` de líneas quitadas)
- `components/features/budgets/IvaRateSelect.jsx` (21% · 10,5% · Sin IVA)
- `components/features/budgets/BudgetTotalsBar.jsx` (barra fija abajo con desglose plegable y botón Guardar)
- `utils/budgetMath.js` (cálculo de vista previa)
- `utils/whatsapp.js` (armado del link)
- `utils/iva.js` y `utils/money.js` (alícuotas, precio con IVA, redondeo y formato)

`ItemSearchInput`:
- `onSelect` devuelve `{ description, unit_price, iva_rate, stock }`.
- Navegación con teclado ↑ ↓ Enter Esc, con `aria-activedescendant`.
- Muestra "$neto + IVA = $final" y el stock ("Sin stock" en color de error).

### 12. Impresión (`BudgetPrint.jsx`)
- Columnas: Cant. · Descripción · P. unit. s/IVA · IVA · Importe c/IVA (bruto; el neto ya se ve en el precio unitario). El formulario usa el mismo criterio por línea y su desglose suma "Subtotal con IVA".
- Pie: Subtotal neto, IVA 21%, IVA 10,5%, Sin IVA, **Total efectivo/débito**, **Total tarjeta**.
- Las líneas con importe 0 no se muestran → los presupuestos viejos se imprimen igual que antes.

## Risks / Trade-offs

- [Diferencias de redondeo entre front y back] → mismo algoritmo (redondeo por alícuota) en ambos y tests con los mismos casos; el valor guardado siempre es el del backend.
- [Un ítem de texto libre que en realidad es mano de obra queda al 21% por defecto] → selector visible en cada línea; el default es el que pidió el usuario.
- [Cambiar el significado de `total_list` a "con IVA"] → para presupuestos viejos el valor no cambia (ítems sin alícuota); el listado sigue mostrando el mismo campo.
- [Todos los productos quedan al 21% hasta que se marquen los de 10,5%] → edición masiva y columna en el importador; se avisa en la entrega.
- [Formato de teléfono del cliente inconsistente para WhatsApp] → normalización simple y botón deshabilitado si no hay teléfono; el usuario puede revisar el mensaje antes de enviar.
- [Re-render de toda la tabla con `watch`] → usar `useWatch` acotado por fila en los subcomponentes.

## Migration Plan

1. Migración `AddIvaRateToProducts`: `add_column :products, :iva_rate, :decimal, precision: 4, scale: 2, null: false, default: 21.0`. Reversible (`change`).
2. Migración `AddIvaToBudgets`:
   - `add_column :budget_items, :iva_rate, :decimal, precision: 4, scale: 2` (nullable, sin backfill).
   - `add_column :budgets, :subtotal_net, :decimal, precision: 12, scale: 2, default: 0`
   - `add_column :budgets, :total_iva, :decimal, precision: 12, scale: 2, default: 0`
   - Reversible (`change`).
3. Sin backfill de presupuestos: `subtotal_net` y `total_iva` en 0 son correctos para ítems sin alícuota.
4. Deploy: backend primero (campos aditivos, compatible con el frontend actual), luego frontend.
5. **Rollback:** revertir frontend; luego `db:rollback` de las dos migraciones. No se pierde información previa.

## Open Questions

- Ninguna bloqueante. A confirmar en QA: si el texto de WhatsApp tiene el formato que usa el negocio.
