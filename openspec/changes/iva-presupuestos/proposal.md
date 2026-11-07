## Why

Los precios de todos los productos están cargados **sin IVA**, pero el lubricentro es **responsable inscripto** y tiene que cotizar con el IVA discriminado. Hoy el presupuesto no contempla IVA: hay que calcularlo a mano y cargarlo como precio, lo que es lento y propenso a errores. Además, algunos productos van al 21% y otros al 10,5%. De paso, el formulario de presupuesto tiene fricciones de uso (vehículo como texto libre, tabla que no entra en mobile, totales con nombres confusos) que conviene resolver en el mismo cambio porque tocan las mismas pantallas.

## What Changes

**IVA en productos**
- Nuevo atributo `iva_rate` en productos (21 o 10,5; por defecto 21). El precio sigue guardándose **sin IVA**.
- Edición masiva de alícuota sobre los productos seleccionados en la tabla (o todos los que coinciden con los filtros).
- El importador de productos acepta una columna opcional **IVA**.
- La tabla de productos y el buscador de ítems muestran el precio neto y el precio con IVA.

**IVA en presupuestos**
- Cada ítem guarda una **foto de su alícuota** (`iva_rate`: 21, 10,5 o vacío = sin IVA) al momento de cargarse.
  - Producto → toma la alícuota del producto.
  - Servicio → sin IVA (su precio ya es final).
  - Texto libre → 21% por defecto, editable.
- El backend calcula: subtotal neto, IVA por alícuota, importe sin IVA (servicios y similares), **total efectivo/débito** y **total tarjeta** (el recargo se aplica sobre el total con IVA).
- El PDF muestra el precio unitario neto y el desglose de IVA.
- Los presupuestos existentes **no cambian sus totales**: sus ítems quedan como "sin IVA".

**Mejoras de UX del presupuesto**
- El vehículo se elige de los vehículos del cliente y queda vinculado (`vehicle_id`), manteniendo `vehicle_description` para el PDF.
- Carga de ítems más ágil: Enter en la última fila agrega otra; se puede borrar la única fila.
- En mobile los ítems se ven como tarjetas.
- Totales con nombres claros ("Efectivo / Débito", "Tarjeta de crédito") en una barra fija abajo con el botón Guardar.
- Acciones rápidas: imprimir, enviar por WhatsApp y **duplicar presupuesto**.
- Listado: filtro por estado y cambio de estado con un clic.
- Buscador de ítems: muestra el stock y se puede manejar con el teclado (↑ ↓ Enter Esc).
- Se corrigen textos en inglés ("budget") visibles para el usuario.

## Capabilities

### New Capabilities
- `iva-productos`: alícuota de IVA por producto, edición masiva, importación y visualización de precio con IVA.
- `presupuesto-iva`: alícuota por ítem, cálculo de totales con IVA discriminado, recargo de tarjeta e impresión con desglose.
- `presupuesto-ux`: vínculo con vehículo, carga ágil de ítems, vista mobile, barra de totales, duplicar, WhatsApp, filtros y cambio rápido de estado.

### Modified Capabilities
<!-- No hay specs existentes de productos ni presupuestos en openspec/specs/. -->

## Impact

- **Apps:** backend y frontend.
- **Migraciones (sí):**
  - `products.iva_rate` (decimal, not null, default 21).
  - `budget_items.iva_rate` (decimal, nullable).
  - `budgets.subtotal_net` y `budgets.total_iva` (decimal, default 0).
- **Backend:** modelos `Product`, `Budget`, `BudgetItem`; `ProductsController` (nuevo `bulk_iva_update`, strong params), `BudgetsController` (nuevo `duplicate`, strong params de ítems), `ProductImportService` y plantilla de importación, serializers `ProductSerializer`, `BudgetSerializer`, `BudgetItemSerializer`; rutas.
- **Frontend:** `pages/BudgetForm.jsx` (se divide en subcomponentes), `pages/Budgets.jsx`, `pages/BudgetPrint.jsx`, `components/features/budgets/ItemSearchInput.jsx`, `components/features/products/ProductsTable.jsx`, `ProductForm.jsx`, `pages/Products.jsx`, `services/budgetsService.js`, `services/productsService.js`.
- **API:** campos nuevos en respuestas de productos y presupuestos (aditivos, no rompen clientes existentes). `total_list` pasa a significar "total efectivo/débito con IVA"; para presupuestos viejos el valor no cambia.

## Fuera de alcance

- Mejoras de Crear Cliente, Crear Vehículo y Perfil del Cliente (irán en otro change).
- Facturación electrónica / AFIP.
- IVA en servicios o en atenciones (`service_records`).
- Alícuotas distintas de 21% y 10,5%.
- Adjuntar el PDF en WhatsApp (solo se envía un mensaje con el resumen).
- Asignar alícuota por categoría.
