# items-atencion Specification

## Purpose
TBD - created by archiving change homologar-items-presupuesto-atencion. Update Purpose after archive.
## Requirements
### Requirement: Lista única de ítems en la atención
La atención SHALL guardar sus ítems en una sola lista (`service_record_items`) con los mismos campos que los ítems de presupuesto: descripción libre (obligatoria, ≤ 500), cantidad decimal > 0, precio unitario neto ≥ 0, % de IVA opcional, posición y total de línea; más `product_id` y `service_id` opcionales que indican el origen en el catálogo. La API SHALL recibir los ítems como `items_attributes` y devolverlos como `items`.

#### Scenario: Crear una atención con ítem de catálogo y de texto libre
- **WHEN** se hace `POST /api/v1/service_records` con un ítem `{ description: "Aceite 5W30", quantity: 4, unit_price: 10000, iva_rate: 21, product_id: <id> }` y otro `{ description: "Lavado de motor", quantity: 1, unit_price: 5000 }`
- **THEN** la atención queda con 2 ítems en ese orden, el primero vinculado al producto y el segundo sin producto ni servicio

#### Scenario: Editar a mano un ítem de catálogo
- **GIVEN** una línea elegida del catálogo (producto "Aceite 5W30")
- **WHEN** el usuario cambia el texto de la descripción
- **THEN** la línea conserva su `product_id`; si vacía la descripción, el vínculo se limpia

#### Scenario: Ítem de otra atención
- **WHEN** se actualiza una atención con `items_attributes` que incluye el `id` de un ítem de otra atención
- **THEN** la API responde 404 con `success: false`

#### Scenario: Ítem sin descripción
- **WHEN** se envía un ítem con descripción vacía
- **THEN** ese ítem se descarta y no se guarda

#### Scenario: Mismo producto en dos líneas
- **WHEN** se envían dos ítems con el mismo `product_id`
- **THEN** la atención se guarda con ambas líneas

#### Scenario: Borrar un ítem guardado
- **GIVEN** una atención con 2 ítems
- **WHEN** se actualiza con `{ id: <id>, _destroy: true }` para uno
- **THEN** la atención queda con 1 ítem y su total se recalcula

### Requirement: Total de la atención con IVA calculado por el backend
Al guardar una atención con ítems nuevos, modificados o borrados, el backend SHALL calcular `total_amount` (redondeado a 2 decimales) como neto de los ítems con alícuota + IVA redondeado por alícuota + importes de ítems sin IVA (mismo cálculo que el total efectivo/débito del presupuesto). El cliente MUST NOT poder fijar `total_amount`. La respuesta `with_details` SHALL incluir `subtotal_net`, `total_iva`, `iva_breakdown` y `exempt_total`.

#### Scenario: Atención mixta
- **GIVEN** un ítem de 2 × $10.000 al 21% y un ítem de 1 × $5.000 sin IVA
- **WHEN** se guarda la atención
- **THEN** `total_amount` = 29200 y `iva_breakdown` contiene `{ rate: "21.0", base: "20000.0", amount: "4200.0" }`

#### Scenario: Guardar solo la cabecera conserva el total
- **GIVEN** una atención con `total_amount` = 80150 cuyos ítems suman $80.000 (dato histórico)
- **WHEN** se actualizan solo las notas
- **THEN** `total_amount` sigue en 80150

#### Scenario: Total enviado por el cliente
- **WHEN** se envía `total_amount: 1` junto con ítems que suman $29.200
- **THEN** la atención queda con `total_amount` = 29200

### Requirement: Migración de los ítems existentes
Las migraciones SHALL copiar cada fila de `service_record_services` y `service_record_products` a `service_record_items` (descripción = nombre del servicio/producto, mismo `quantity` y `unit_price`, sin IVA, con su `service_id`/`product_id`), servicios primero, y luego eliminar las tablas viejas. El `total_amount` de las atenciones existentes MUST NOT cambiar.

#### Scenario: Atención vieja con servicio y producto
- **GIVEN** una atención con 1 servicio "Cambio de aceite" (1 × $8.000) y 1 producto "Filtro" (2 × $3.000) y `total_amount` = 14000
- **WHEN** se ejecutan las migraciones
- **THEN** la atención tiene 2 ítems ("Cambio de aceite" en posición 0, "Filtro" en posición 1), ambos sin IVA, y `total_amount` sigue en 14000

#### Scenario: Volver a guardar una atención migrada
- **GIVEN** la atención migrada del escenario anterior
- **WHEN** se guarda sin cambios
- **THEN** `total_amount` sigue en 14000

### Requirement: Métricas del dashboard desde la lista única
El dashboard SHALL calcular top producto, top servicio, ingresos por productos/servicios y el detalle de atenciones recientes a partir de `service_record_items` usando `product_id` / `service_id`. Los ítems sin catálogo MUST NOT contar para el top de producto ni de servicio.

#### Scenario: Top producto
- **GIVEN** 3 ítems con el producto "Filtro" (cantidades 1, 2 y 1) y 1 ítem con el producto "Aceite" (cantidad 2)
- **WHEN** se piden las estadísticas del dashboard
- **THEN** `top_product` es `{ name: "Filtro", count: 4 }`

### Requirement: Sección "Productos y Servicios" en el formulario de atención
El formulario de atención SHALL usar el mismo componente de ítems que el presupuesto, titulado "Productos y Servicios", con buscador de productos y servicios, % de IVA por línea y una barra fija de totales con desglose (subtotal neto, IVA por alícuota, sin IVA), "Total" sin total con tarjeta, y los botones Cancelar / Registrar. La cabecera del formulario MUST NOT cambiar.

#### Scenario: Cargar un producto en la atención
- **GIVEN** un producto con precio $10.000 y alícuota 21%
- **WHEN** el usuario lo elige en el buscador de una línea con cantidad 1
- **THEN** la línea queda con precio $10.000, IVA 21 e importe $12.100, y la barra muestra Total $12.100

#### Scenario: Editar una atención migrada
- **GIVEN** una atención migrada con 2 ítems sin IVA
- **WHEN** el usuario la abre para editar
- **THEN** ve las 2 líneas en "Productos y Servicios" con el % de IVA vacío y la barra muestra la vista previa calculada desde los ítems; el total guardado se conserva mientras no se modifiquen los ítems

#### Scenario: Servicio usado no se puede borrar
- **GIVEN** un servicio referenciado por un ítem de atención
- **WHEN** se hace `DELETE /api/v1/services/:id`
- **THEN** la API responde con error y el servicio no se borra

