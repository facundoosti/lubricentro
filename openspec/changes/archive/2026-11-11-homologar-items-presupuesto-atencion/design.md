## Context

- **Presupuesto**: `budgets` + `budget_items` (description ≤ 500, quantity decimal, unit_price neto, iva_rate decimal(4,2) nullable ∈ {21, 10.5}, position, total). `Budget#compute_totals` calcula subtotal_net, total_iva (redondeado por alícuota), total_list y total_card. Front: `BudgetItemsEditor` + `BudgetItemRow` + `ItemSearchInput` (busca productos y servicios) + `IvaRateSelect` + `BudgetTotalsBar`; utils `iva.js` y `budgetMath.js`.
- **Atención**: `service_records` + `service_record_products` (product_id obligatorio, quantity integer, unit_price, único por producto) + `service_record_services` (idem con service_id). `total_amount` lo recalcula el controller (`recalculate_total`) como Σ cantidad × unitario, sin IVA. Front: `ServiceRecordFormPage.jsx` (830 líneas) con dos tablas separadas y selects del catálogo.
- Otros consumidores de las tablas viejas: `ServiceRecordSerializer` (`with_details`), `DashboardStatsService` (top producto/servicio, ingresos por servicios/productos, atenciones recientes), `ServicesController#destroy` (no deja borrar un servicio usado), asociaciones en `Product` y `Service`.

## Goals / Non-Goals

**Goals:**
- Un solo componente de ítems "Productos y Servicios" usado por presupuesto y atención.
- % de IVA libre (0–99,99) por línea en ambos.
- Mismo modelo de ítem en ambos lados, para copiar presupuesto → atención 1:1.
- Copiar desde presupuesto en "Nueva atención", vincular y aprobar el presupuesto.

**Non-Goals:**
- Cabeceras, recargo de tarjeta en atención, stock, impresión de atención, alícuotas del catálogo de productos.

## Decisions

### D1. Tabla `service_record_items` espejo de `budget_items`
Columnas: `service_record_id` (FK, null: false, índice), `position` integer default 0, `quantity` decimal(10,2) default 1, `description` string(500) null: false, `unit_price` decimal(12,2) default 0, `iva_rate` decimal(4,2) null, `total` decimal(12,2) default 0, `product_id` (FK opcional, `on_delete: :nullify`), `service_id` (FK opcional, `on_delete: :nullify`), timestamps. Índices: `[service_record_id, position]`, `product_id`, `service_id`.
- *Por qué*: mismo shape que `budget_items` → la copia es un mapeo directo y el componente front es el mismo. `product_id`/`service_id` opcionales mantienen las métricas del dashboard sin exigir catálogo.
- *Alternativa descartada*: mantener las dos tablas y unificar solo la UI → no admite texto libre, la copia perdería ítems.
- Sin unicidad por producto: se puede repetir un producto en dos líneas (como en presupuesto).

### D2. Lógica de ítems compartida en un concern
`ItemizedTotals` (concern en `app/models/concerns/`) con `line_net`, `compute_total` para el ítem; y `iva_breakdown` / `exempt_total` / cálculo de neto + IVA para el padre. `Budget` y `ServiceRecord` lo incluyen; `ServiceRecord` setea `total_amount = round(neto + IVA + exento, 2)` en `before_save` **solo si cambiaron los ítems** (nuevos, editados o `_destroy`), para no pisar totales históricos que no coinciden con sus ítems. Se elimina `recalculate_total` del controller.
- Validación de `iva_rate` en ambos ítems: `numericality: { greater_than_or_equal_to: 0, less_than: 100 }, allow_nil: true`, y `before_validation` normaliza `0` → `nil` (0 = sin IVA, sin fila "IVA 0%" en el desglose).

### D3. Migración de datos (3 migraciones, reversibles)
1. `CreateServiceRecordItems` (create_table, reversible por defecto) + `add_reference :service_records, :budget, foreign_key: { on_delete: :nullify }, null: true`.
2. `MigrateServiceRecordItemsData`: `up` inserta con SQL (`INSERT … SELECT`) desde `service_record_services` (description = services.name, iva_rate NULL, service_id) y luego `service_record_products` (description = products.name, iva_rate NULL, product_id), `total = quantity × unit_price`, position secuencial por atención (servicios primero, como se veía en pantalla). `iva_rate` NULL conserva los `total_amount` históricos. `down` hace el camino inverso agrupando por (service_record_id, product_id/service_id) sumando cantidades (ítems sin catálogo se pierden en el rollback; se documenta).
3. `DropServiceRecordProductsAndServices`: `drop_table` con bloque completo de columnas para que sea reversible.
- No se recalcula `total_amount` de atenciones existentes en la migración.
- Modelos `ServiceRecordProduct` / `ServiceRecordService` y sus factories/specs se eliminan.

### D4. Contrato de la API de atenciones
- Params: `service_record[items_attributes][] = { id, position, description, quantity, unit_price, iva_rate, product_id, service_id, _destroy }` y `service_record[budget_id]`. `accepts_nested_attributes_for :items, allow_destroy: true, reject_if: ->(a) { a[:description].blank? }`.
- `total_amount` deja de aceptarse desde el cliente (lo calcula el modelo).
- Respuesta `with_details`: `items: [{ id, position, description, quantity, unit_price, iva_rate, total, product_id, service_id }]`, `budget_id`, `subtotal_net`, `total_iva`, `iva_breakdown`, `exempt_total`. Se quitan `service_record_services` / `service_record_products`.
- Se agrega `ServiceRecordItemSerializer`.

### D5. Aprobar el presupuesto de origen
En `ServiceRecordsController#create`, dentro de la misma transacción: si `budget_id` presente, `budget.update!(status: "approved")`. Si el presupuesto no existe → 422. Validación en `ServiceRecord`: si hay `budget` con cliente, debe coincidir con `customer_id` (evita vincular un presupuesto de otro cliente). Solo en `create`; editar una atención no vuelve a tocar el estado.

### D6. Front: componente compartido
- Mover a `components/features/items/`: `ItemsEditor` (ex `BudgetItemsEditor`, título "Productos y Servicios", prop `name` del field array = `items_attributes`), `ItemRow` (ex `BudgetItemRow`), `ItemSearchInput`, `IvaRateInput` (reemplaza `IvaRateSelect`: input number 0–99,99 step 0.01, sufijo "%", placeholder "Sin IVA"). `onSelect` también setea `product_id` / `service_id`.
- `ItemsTotalsBar` generaliza `BudgetTotalsBar` con prop `showCard` (presupuesto: sí; atención: no, solo "Total").
- `utils/iva.js`: `toIvaRate` trata `0` como `null`; `formatIvaRate` formatea cualquier % (`"15,75%"`). `budgetMath.computeBudgetTotals` se renombra/exporta también como `computeItemsTotals` sin cambiar fórmula.
- Se eliminan `ITEM_IVA_OPTIONS` y `IvaRateSelect` si no quedan usos.
- Desvío consciente: en la atención, Cancelar / Registrar dejan el pie del formulario y pasan a la barra fija de totales (`ItemsTotalsBar`), igual que en el presupuesto. El `-mx-6 sm:mx-0` de la barra solo aplica bajo `sm` (compensa el `p-6` del `Layout`, que envuelve ambas páginas); en desktop es `mx-0`, sin scroll horizontal.

### D7. Copiar desde presupuesto
- Botón "Copiar desde presupuesto" en la cabecera de la sección de ítems, solo en modo creación.
- Abre un diálogo (sobre `useDialogLayer`/`FormDialog` existentes) con buscador y lista de presupuestos (`GET /api/v1/budgets?customer_id=&search=&per_page=`), excluyendo rechazados en el front. Al elegir: `GET /api/v1/budgets/:id`, reemplaza los ítems (confirmación si ya hay ítems cargados), setea cliente/vehículo si el presupuesto los tiene y guarda `budget_id` en el form. Muestra un chip "Desde presupuesto #N" con opción de quitar el vínculo.
- No hace falta endpoint nuevo.

## Risks / Trade-offs

- [Migración destruye tablas viejas] → migración de datos antes del drop, spec de migración con datos reales de ejemplo; `down` documentado. Backup de Railway antes del deploy (anotar en el commit).
- [Atenciones viejas quedan sin IVA y nuevas con IVA → el "total" cambia de significado] → aceptado; las viejas conservan su total histórico.
- [Contrato de API cambia en un solo deploy] → front y back se despliegan juntos desde `main`; no hay otros clientes de esa API (el agente N8N no escribe atenciones — verificar en `agent/`).
- [ServiceRecordFormPage es grande] → solo se reemplazan las secciones de ítems y el resumen; la cabecera no se toca.
- [`decimal(4,2)` limita el % a 99,99] → suficiente para IVA/recargo; validación lo refleja.

## Migration Plan

1. Deploy con las 3 migraciones (`db:migrate` corre en Railway al deployar).
2. Verificar con `railway ssh` + `rails runner` read-only: `ServiceRecordItem.count` == suma de filas viejas y que `total_amount` no cambió.
3. Rollback: `db:rollback STEP=3` restaura tablas y datos agregados por catálogo.

## Open Questions

- Ninguna bloqueante.
