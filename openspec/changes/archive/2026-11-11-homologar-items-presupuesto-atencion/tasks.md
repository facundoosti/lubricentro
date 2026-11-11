## 1. Backend — Modelo de datos y migraciones

- [x] 1.1 Migración `CreateServiceRecordItems` (columnas e índices según design D1) + `add_reference :service_records, :budget` (nullable, FK `on_delete: :nullify`)
- [x] 1.2 Migración de datos `MigrateServiceRecordItemsData` (INSERT … SELECT desde servicios y productos, servicios primero, `iva_rate` NULL, `total = quantity × unit_price`) con `down` que reagrupa por catálogo; spec de migración que crea filas viejas, corre `up` y verifica ítems, posiciones y `total_amount` intacto
- [x] 1.3 Migración `DropServiceRecordProductsAndServices` reversible (bloque completo de columnas e índices); correr `db:migrate` y `db:rollback STEP=3` + `db:migrate` en dev para probar reversibilidad

## 2. Backend — Modelos

- [x] 2.1 Concern `ItemizedTotals` (línea: `line_net`, `compute_total`, normalización `iva_rate` 0 → nil, validación 0 ≤ % < 100; padre: `iva_breakdown`, `exempt_total`, subtotal neto, total IVA) + specs del concern
- [x] 2.2 `BudgetItem` y `Budget` usan el concern; actualizar `budget_item_spec` / `budget_spec` (% libre 15 válido, 0 → nil, 100 y -1 inválidos; escenario mixto sigue dando 43620 / 47982)
- [x] 2.3 Modelo `ServiceRecordItem` (belongs_to service_record, product y service opcionales) + factory + model spec
- [x] 2.4 `ServiceRecord`: `has_many :items`, `accepts_nested_attributes_for :items` (reject sin descripción), `belongs_to :budget, optional`, `before_save` que calcula `total_amount`, validación cliente del presupuesto = cliente de la atención; quitar asociaciones y métodos viejos; model spec (escenario mixto = 29200, migrada = 14000)
- [x] 2.5 `Product`, `Service`: cambiar asociaciones a `service_record_items` (`dependent: :nullify`); `ServicesController#destroy` chequea `service_record_items`; eliminar `ServiceRecordProduct` / `ServiceRecordService` con sus factories y specs; actualizar specs afectados

## 3. Backend — API y dashboard

- [x] 3.1 `ServiceRecordsController`: params `items_attributes` + `budget_id`, quitar `total_amount` de permitidos y `recalculate_total`; en `create` aprobar el presupuesto en la misma transacción (422 si no existe o es de otro cliente); request specs (crear con ítems, `_destroy`, total ignorado, aprobar presupuesto, presupuesto de otro cliente, update no toca el presupuesto)
- [x] 3.2 `ServiceRecordItemSerializer` + `ServiceRecordSerializer#with_details` (`items`, `budget_id`, `subtotal_net`, `total_iva`, `iva_breakdown`, `exempt_total`; sin campos viejos) + serializer spec
- [x] 3.3 `DashboardStatsService` lee de `service_record_items` (top producto/servicio por `product_id`/`service_id`, ingresos, atenciones recientes) + actualizar `dashboard_stats_service_spec` (escenario top producto "Filtro" = 4)
- [x] 3.4 Buscar con codegraph otros usos de las tablas viejas (inbox/IA, seeds, `db/seeds.rb`, rake tasks) y adaptarlos con su spec

## 4. Frontend — Componente compartido "Productos y Servicios"

- [x] 4.1 `utils/iva.js`: `toIvaRate` trata 0 como null, `formatIvaRate` formatea cualquier % con coma; eliminar `ITEM_IVA_OPTIONS` si queda sin uso; `budgetMath`: exportar `computeItemsTotals` (misma fórmula) + tests de Vitest
- [x] 4.2 `IvaRateInput` (input numérico 0–99,99, step 0.01, sufijo "%", placeholder "Sin IVA", aria-label) reemplaza a `IvaRateSelect` + test
- [x] 4.3 Mover `BudgetItemsEditor` / `BudgetItemRow` / `ItemSearchInput` a `components/features/items/` como `ItemsEditor` / `ItemRow` / `ItemSearchInput`: título "Productos y Servicios", encabezados "Producto / servicio" y "% IVA", `onSelect` setea también `product_id` / `service_id`, prop opcional `headerAction`; migrar y actualizar tests existentes
- [x] 4.4 `ItemsTotalsBar` (generaliza `BudgetTotalsBar` con `showCard`; sin tarjeta muestra "Total") + tests
- [x] 4.5 `BudgetForm` usa los componentes compartidos; `BudgetPrint` / `BudgetPrintItems` / `BudgetPrintTotals` muestran % libres ("15%", "15,75%"); actualizar tests de presupuesto

## 5. Frontend — Atención

- [x] 5.1 `serviceRecordsService`: payload con `items_attributes` (incluye `_destroy` de los quitados) y `budget_id`; mapear `items` de la respuesta al form
- [x] 5.2 `ServiceRecordFormPage`: reemplazar secciones Servicios / Productos y el resumen por `ItemsEditor` + `ItemsTotalsBar` (`showCard={false}`), sin tocar la cabecera; edición de atención migrada muestra las líneas con % vacío; tests de Vitest
- [x] 5.3 Diálogo `CopyFromBudgetDialog` (sobre `useDialogLayer`/`FormDialog`): buscador, lista filtrada por cliente si está elegido, sin rechazados; al elegir trae el presupuesto, confirma si hay líneas con datos, reemplaza ítems, setea cliente/vehículo y `budget_id`; tests
- [x] 5.4 Botón "Copiar desde presupuesto" solo en modo creación + chip "Desde presupuesto #N" con quitar vínculo; tests (no aparece al editar; quitar vínculo envía sin `budget_id`)

## 6. QA visual

- [x] 6.1 Escribir los casos TC-XX en `openspec/changes/homologar-items-presupuesto-atencion/qa.md` (presupuesto con % libre, atención nueva con producto/servicio/texto libre, copiar desde presupuesto, editar atención migrada, temas claro/oscuro, desktop 1440×900)
- [x] 6.2 Ejecutar con `/qa-visual` (tools/qa-runner) y corregir los hallazgos

## 7. Cierre

- [x] 7.1 Correr lint y tests completos: `bundle exec rspec` + `bundle exec rubocop` en backend, `npx vitest run` + `npm run lint` en frontend
