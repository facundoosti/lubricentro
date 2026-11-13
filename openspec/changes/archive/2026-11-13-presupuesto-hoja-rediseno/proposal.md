## Why

La hoja de presupuesto impresa no se parece al talonario nuevo del lubricentro. Además, el dueño anota a mano cosas que el sistema no tiene: las cuotas con recargo, el CUIT y el tipo de factura del cliente, y el email e Instagram del local. El diseño se aprobó con un mockup el 2026-11-13. Las mejoras están anotadas en `docs/PENDIENTES.md`, en la sección "Hoja de presupuesto".

## What Changes

**Visual (hoja impresa)**
- El color de marca pasa a naranja `#F04E23`, definido en una sola constante. ⚠️ Falta que el dueño lo confirme.
- Encabezado con fondo gris degradado en vez de negro.
- Bordes redondeados en el encabezado, la franja PRESUPUESTO y la tabla.
- Tabla con fondo gris claro y renglones blancos, y renglón Vehículo con fondo gris.
- Marca de agua tenue con el logo detrás de la tabla.
- Ícono de ubicación junto a la dirección.
- Código del producto (SKU) junto al nombre del artículo.
- **Se quita la columna P. UNIT.** Queda solo el importe final.
- Totales en un recuadro alineado a la derecha, con las etiquetas "PRECIO D/LISTA – EFT/DEB" y "TARJETA D/CRED" resaltadas en amarillo.
- Leyenda "NO VÁLIDO COMO COMPROBANTE DE FACTURACIÓN".
- El pie muestra el email y el Instagram, sin repetir la dirección ni el teléfono.

**Funcional (con migraciones)**
- `customers`: se agregan `cuit` y `invoice_type` (A, B, C o consumidor final). Se cargan en el formulario de cliente y se imprimen arriba a la izquierda.
- `settings`: se agregan `email` e `instagram`. Se cargan en Configuración y se muestran en el pie.
- Tabla nueva `installment_plans` (nombre, cuotas, % de recargo, activo y posición), con un ABM en Configuración. La hoja muestra los planes activos con el valor de cada cuota.
- `budget_items`: se agrega `product_code`. Guarda una copia del SKU cuando el ítem sale del catálogo, porque el presupuesto no guarda `product_id`.

## Capabilities

### New Capabilities
- `datos-fiscales-cliente`: CUIT y tipo de factura del cliente.
- `planes-cuotas`: planes de cuotas con recargo configurables y su cálculo.

### Modified Capabilities
- `presupuesto-impresion`: nuevo diseño, sin precio unitario, con código de producto, cuotas, datos fiscales, leyenda y pie con contacto.

## Impact

- **Backend y frontend.**
- **4 migraciones** de solo agregar: `customers`, `settings`, `budget_items` y la tabla nueva `installment_plans`. Ninguna es destructiva.
- API: campos nuevos en los serializers y params de clientes, configuración e ítems de presupuesto. Endpoint nuevo `/api/v1/installment_plans`, que es un CRUD.
- Frontend: `BudgetPrint`, `BudgetPrintItems`, `BudgetPrintTotals`, el formulario de cliente, Configuración, `ItemsEditor` (para guardar el SKU al elegir un producto) y una sección nueva de planes de cuotas.

## Fuera de alcance

- Generar el PDF como texto en vez de imagen (html2canvas). Queda en Pendientes.
- Facturación electrónica o validación del CUIT contra AFIP. Solo se valida el formato.
- Aplicar las cuotas a las atenciones (`service_records`).
- Mostrar el SKU en los presupuestos viejos. Solo se guarda en los ítems nuevos o editados.
