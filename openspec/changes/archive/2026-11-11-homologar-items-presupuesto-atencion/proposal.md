## Why

Presupuestos y atenciones cargan los mismos ítems (productos y servicios) con dos formularios y dos modelos de datos distintos: el presupuesto usa una sola lista con descripción libre e IVA por línea; la atención usa dos tablas separadas atadas al catálogo y sin IVA. Eso duplica trabajo: un presupuesto aprobado hay que volver a cargarlo a mano como atención. Además, la alícuota fija (21 / 10,5 / Sin IVA) no deja cobrar un % distinto sobre el precio unitario.

## What Changes

- **Componente unificado "Productos y Servicios"**: el editor de ítems del presupuesto pasa a ser un componente compartido y se usa en presupuesto y atención. Reemplaza el título "Artículos" y las secciones separadas "Servicios" / "Productos" de la atención. La cabecera de ambos formularios no cambia.
- **% de IVA libre por línea**: el select fijo pasa a un campo numérico (0 a 99,99). Se prellena con el IVA del producto (servicios: vacío). Vacío o 0 = sin IVA. Importe de línea = cantidad × unitario × (1 + %/100). El backend acepta cualquier % en ese rango en los ítems (presupuesto y atención); la alícuota del **producto** en el catálogo sigue siendo 21 / 10,5.
- **BREAKING (modelo de datos)**: nueva tabla única `service_record_items` con los mismos campos que `budget_items` (descripción libre, cantidad decimal, unitario, % IVA, posición, total) más `product_id` / `service_id` opcionales. Se migran los datos de `service_record_products` y `service_record_services` (sin IVA, para conservar los totales históricos) y se eliminan esas tablas. La API de atenciones pasa a recibir y devolver `items_attributes` / `items`.
- **Total de la atención con IVA**: `total_amount` se calcula en el backend igual que el total efectivo/débito del presupuesto (neto + IVA por alícuota + ítems sin IVA). La atención muestra una barra de totales con desglose (sin total tarjeta).
- **Copiar desde presupuesto**: en "Nueva atención", botón "Copiar desde presupuesto" que abre un selector de presupuestos (filtrado por el cliente si ya está elegido). Trae ítems + cliente/vehículo; todo queda editable antes de guardar.
- **Vínculo y estado**: la atención guarda el presupuesto de origen (`service_records.budget_id`, opcional). Al crear la atención, ese presupuesto pasa a "Aprobado".
- Dashboard (top producto/servicio, ingresos, atenciones recientes) pasa a leer de `service_record_items`.

## Capabilities

### New Capabilities
- `items-atencion`: ítems de la atención en una lista única "Productos y Servicios" con % de IVA por línea, total con IVA calculado por el backend y migración de los datos existentes.
- `copiar-presupuesto-a-atencion`: precargar una atención nueva desde un presupuesto, vínculo atención ↔ presupuesto y paso del presupuesto a "Aprobado".

### Modified Capabilities
- `presupuesto-iva`: la alícuota del ítem deja de ser 21 / 10,5 / vacía y pasa a ser un % libre entre 0 y 99,99 (0 o vacío = sin IVA); el formulario la edita con un campo numérico.
- `presupuesto-ux`: la sección de ítems se titula "Productos y Servicios" y es el componente compartido con la atención.

## Impact

- **Apps**: backend y frontend.
- **Migraciones** (corren en el deploy): crear `service_record_items`, copiar datos desde `service_record_products` / `service_record_services`, eliminar esas dos tablas, agregar `service_records.budget_id`. La migración de datos debe ser reversible o al menos no perder información.
- **Backend**: modelos `ServiceRecord`, `ServiceRecordItem` (nuevo), `BudgetItem` (validación de `iva_rate`), `Product` / `Service` (asociaciones), `ServiceRecordProduct` / `ServiceRecordService` (se eliminan), `ServiceRecordsController` (params, cálculo de total, aprobar presupuesto), `ServiceRecordSerializer`, `ServicesController` (chequeo de uso antes de borrar), `DashboardStatsService`, factories y specs.
- **Frontend**: `BudgetItemsEditor` / `BudgetItemRow` / `IvaRateSelect` / `ItemSearchInput` → componente compartido; `ServiceRecordFormPage` (secciones de ítems, totales, botón copiar), `serviceRecordsService`, utils `iva` / `budgetMath`, `BudgetPrint` (formato de % libre).
- **API**: cambio de contrato en `POST/PUT /api/v1/service_records` y en la respuesta `with_details` (antes `service_record_services` / `service_record_products`, ahora `items`).

## Fuera de alcance

- Cambios en la cabecera de presupuesto o atención (salvo el botón "Copiar desde presupuesto").
- Recargo de tarjeta en la atención.
- Descontar stock al guardar una atención.
- Cambiar las alícuotas permitidas del catálogo de productos (siguen 21 / 10,5).
- Crear la atención desde la pantalla del presupuesto (solo desde "Nueva atención").
- Impresión de la atención.
