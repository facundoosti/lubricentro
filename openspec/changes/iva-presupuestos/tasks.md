## 1. Backend — IVA en productos

- [x] 1.1 Migración `AddIvaRateToProducts` (`iva_rate decimal(4,2) not null default 21.0`, reversible) y validación `inclusion: [21, 10.5]` en `Product` + model spec
- [x] 1.2 Permitir `iva_rate` en `product_params` y exponer `iva_rate` y `unit_price_with_iva` en `ProductSerializer` + request spec de create/update/show (incluye 422 por alícuota inválida)
- [x] 1.3 Endpoint `POST /api/v1/products/bulk_iva_update` (por `product_ids` o filtros, `update_all`, 422 si alícuota inválida o sin productos) + request spec
- [x] 1.4 Columna opcional 9 `iva` en `ProductImportService` (parseo `21`, `21%`, `10,5`, `10.5`; vacío conserva en existentes y 21 en nuevos; inválido = error de fila) y actualizar `import_template` + service spec

## 2. Backend — IVA en presupuestos

- [x] 2.1 Migración `AddIvaToBudgets` (`budget_items.iva_rate` nullable; `budgets.subtotal_net` y `budgets.total_iva` default 0; reversible) y validación `inclusion: [21, 10.5], allow_nil: true` en `BudgetItem` + model spec
- [x] 2.2 Reescribir `Budget#compute_totals` (subtotal neto, IVA redondeado por alícuota, sin IVA, total efectivo/débito, total tarjeta) y agregar `iva_breakdown` y `exempt_total` + model spec con el caso mixto, el de recargo y el de presupuesto viejo
- [x] 2.3 Permitir `iva_rate` en `items_attributes`; exponer `iva_rate` en `BudgetItemSerializer` y `subtotal_net`, `total_iva`, `iva_breakdown`, `exempt_total` en `BudgetSerializer` + request spec
- [x] 2.4 Validar que `vehicle_id` pertenezca a `customer_id` en `Budget` + model y request spec (422)
- [x] 2.5 Endpoint `POST /api/v1/budgets/:id/duplicate` (borrador, fecha de hoy, ítems con alícuota; 404 si no existe) + request spec
- [x] 2.6 Pasar a español los mensajes de `BudgetsController` ("Presupuesto creado exitosamente", etc.) y ajustar specs existentes

## 3. Frontend — IVA en productos

- [x] 3.1 `productsService`: hook `useBulkIvaUpdate` (invalida productos) + test de Vitest
- [x] 3.2 `ProductForm`: selector de alícuota (21% / 10,5%) + test
- [x] 3.3 `ProductsTable`: columnas de alícuota y precio con IVA (mobile-first) + test
- [x] 3.4 Botón "Cambiar IVA" en la barra de selección y modal `BulkIvaModal` (21% / 10,5%, cantidad afectada, aviso de éxito) + test

## 4. Frontend — Presupuesto con IVA

- [x] 4.1 `utils/budgetMath.js` con el mismo cálculo que el backend (redondeo por alícuota) + test con los casos de la spec
- [x] 4.2 `IvaRateSelect` (21% · 10,5% · Sin IVA) + test
- [x] 4.3 `ItemSearchInput`: `onSelect` devuelve `iva_rate` y `stock`; muestra "neto + IVA = final" y "Sin stock"; navegación ↑ ↓ Enter Esc con `aria-activedescendant` + test
- [x] 4.4 Extraer `BudgetItemsEditor` con `BudgetItemRow` (md+) y `BudgetItemCard` (mobile); alícuota inicial según origen; Enter en la última línea agrega y enfoca; borrar la única deja una vacía + test
- [x] 4.5 `BudgetTotalsBar` fija abajo con Efectivo/Débito, Tarjeta, Guardar y desglose plegable + test
- [x] 4.6 Extraer `BudgetGeneralSection`: selector de vehículo que envía `vehicle_id` + `vehicle_description`, limpieza al cambiar de cliente, texto libre sin vehículos; corregir el texto "budget" + test
- [x] 4.7 Recomponer `BudgetForm.jsx` con los subcomponentes (< 300 líneas) y enviar `iva_rate` por ítem + test de envío del payload
- [x] 4.8 `BudgetPrint`: columnas P. unit. neto e IVA; pie con desglose, ocultando líneas en 0 + test (presupuesto mixto y viejo)

## 5. Frontend — UX del presupuesto

- [x] 5.1 `budgetsService`: hooks `useDuplicateBudget` y `useUpdateBudgetStatus` + test
- [x] 5.2 `utils/whatsapp.js` (normalización `549…` y armado del resumen) + test
- [x] 5.3 Acciones en el formulario: Imprimir, Enviar por WhatsApp (deshabilitado sin teléfono) y Duplicar + test
- [x] 5.4 Listado `Budgets.jsx`: chips de filtro por estado, menú de cambio rápido de estado en la fila y acciones Duplicar / WhatsApp + test

## 6. QA visual

- [x] 6.1 Escribir escenarios en `openspec/changes/iva-presupuestos/qa.md`: tabla y form de productos, edición masiva de IVA, form de presupuesto (desktop y 375 px), barra fija, teclado en el buscador, impresión mixta y vieja, listado con filtros y cambio de estado, duplicar, WhatsApp; tema claro y oscuro
- [x] 6.2 Ejecutar los escenarios con `/qa-visual` (Brave + DevTools)
- [x] 6.3 Corregir los hallazgos y volver a ejecutar los escenarios fallidos

## 7. Cierre

- [x] 7.1 Correr lint y tests completos: `bundle exec rspec`, `bundle exec rubocop` (backend) y `npm test -- --run`, `npm run lint` (frontend)
