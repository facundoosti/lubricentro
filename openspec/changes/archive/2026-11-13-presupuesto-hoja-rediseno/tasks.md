## 1. Backend — migraciones y modelos

- [x] 1.1 Migración: `customers.cuit` (string 13) e `invoice_type` (string 2). En `Customer`: normalizar y validar el CUIT, validar `invoice_type` en A/B/C/CF. Specs del modelo.
- [x] 1.2 Migración: `settings.email` e `instagram`. En `Setting`: validar el formato del email y sacar el `@` del Instagram. Specs.
- [x] 1.3 Migración: `budget_items.product_code` (string 50). Permitirlo en `items_attributes` y devolverlo en el serializer. Specs.
- [x] 1.4 Migración y modelo `InstallmentPlan` (`name`, `installments` > 1, `surcharge_percentage` ≥ 0, `active` default true, `position`), con scope `active.ordered`. Specs.
- [x] 1.5 `Api::V1::InstallmentPlansController`, un CRUD con serializer y rutas. Request specs (y ART si corresponde según `backend/CLAUDE.md`).
- [x] 1.6 `Budget#installment_options` y exponerlo en el serializer del presupuesto. Specs del cálculo.
- [x] 1.7 Agregar `cuit`, `invoice_type`, `email` e `instagram` a los params y serializers de clientes y configuración. Incluir el cliente con los datos fiscales en el serializer del presupuesto. Request specs.

## 2. Frontend — datos

- [x] 2.1 Formulario de cliente: campos CUIT y Tipo de factura (Select A/B/C/Consumidor final). Tests.
- [x] 2.2 Configuración: campos Email e Instagram. Tests.
- [x] 2.3 `installmentPlansService` y una sección "Planes de cuotas" en Configuración (lista, alta, edición, activar o desactivar, borrar). Tests.
- [x] 2.4 `ItemsEditor` y `utils/items.js`: guardar `product_code` (SKU) al elegir un producto en el presupuesto, y mandarlo en el payload. Tests.

## 3. Frontend — hoja impresa

- [x] 3.1 `printTheme.js` con la constante del color de marca y los grises.
- [x] 3.2 Extraer `PrintSheet` a `BudgetPrintSheet.jsx` (más el encabezado y el pie), y dejar `BudgetPrint.jsx` solo con la carga y el PDF.
- [x] 3.3 Nuevo estilo: encabezado degradado, bordes redondeados, renglón Vehículo gris, ícono de ubicación y marca de agua.
- [x] 3.4 `BudgetPrintItems`: quitar P. UNIT., mostrar `product_code`, tabla gris con renglones blancos. Tests.
- [x] 3.5 `BudgetPrintTotals`: recuadro, etiquetas nuevas, hasta 3 cuotas y la leyenda de no comprobante. Tests.
- [x] 3.6 Mostrar el CUIT y el tipo de factura del cliente arriba, y el pie con email e Instagram. Tests.

## 4. Cierre

- [x] 4.1 `docs/PENDIENTES.md`: sacar los ítems resueltos y dejar "confirmar color" y "PDF como texto".
- [x] 4.2 Correr `make lint` y las suites afectadas en verde.
