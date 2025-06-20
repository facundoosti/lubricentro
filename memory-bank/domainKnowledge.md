# Domain Knowledge - Conocimiento del Negocio

Este documento captura información específica del dominio del negocio, obtenida de artefactos reales como recibos, facturas o conversaciones con el cliente.

## Análisis del Recibo de Servicio (Killamet Lubricantes)

Basado en las imágenes de la tarjeta de servicio que se le entrega al cliente, hemos extraído la siguiente lista de servicios y productos. Esto nos dará una base sólida para crear el catálogo inicial del sistema.

### Campos de la Orden de Venta (`ServiceRecord`)

La tarjeta contiene campos que deberían mapear directamente a nuestro modelo `ServiceRecord`:
- `FECHA` -> `service_date` (ya considerado)
- `KM.` -> `mileage` (¡NUEVO! Deberíamos agregarlo al modelo `ServiceRecord`)
- `SU PROXIMA VISITA` -> `next_service_date` (¡NUEVO! Sugiere una fecha para el próximo servicio, útil para recordatorios)

### Servicios Potenciales

- **Revisiones y Mantenimiento General**:
  - `Luces Delanteras` (Revisión/Cambio)
  - `Luces Traseras` (Revisión/Cambio)
  - `Frenos` (Revisión/Servicio de Frenos)
  - `Neumáticos` (Revisión de Presión/Estado)
  - `Batería` (Chequeo/Reemplazo)
- **Servicios Específicos**:
  - `Rotación de Neumáticos`
  - `Engrase Eje Trasero`
  - `Limpieza de Inyectores` (Implícito en "Aditivos")
  - `Cambio de Filtro de Aceite`
  - `Cambio de Filtro de Aire`
  - `Cambio de Filtro de Combustible`
  - `Cambio de Filtro de Aire Acondicionado`
- **Servicios de Fluidos**:
  - `Cambio de Aceite de Motor`
  - `Cambio de Aceite de Caja`
  - `Cambio de Aceite de Diferencial`
  - `Cambio de Líquido de Freno`
  - `Cambio de Líquido de Embrague`
  - `Cambio de Líquido Hidráulico`
  - `Cambio de Líquido Refrigerante`
  - `Relleno de Líquido Lava Parabrisas`

### Productos Potenciales

- **Aceites y Lubricantes**:
  - `Aceite de Motor`
  - `Aceite de Caja`
  - `Aceite de Diferencial`
- **Aditivos**:
  - `Aditivo para Aceite`
  - `Limpiador de Inyectores`
- **Filtros**:
  - `Filtro de Aceite`
  - `Filtro de Aire`
  - `Filtro de Combustible`
  - `Filtro de Aire Acondicionado`
- **Fluidos**:
  - `Líquido de Freno`
  - `Líquido de Embrague`
  - `Líquido Hidráulico`
  - `Líquido Refrigerante`
  - `Líquido Lava Parabrisas`
- **Componentes y Repuestos**:
  - `Batería`
  - `Crucetas`
  - `Neumáticos`
  - `Lámparas para Luces`

## Implicaciones para el Modelo de Datos

1.  **ServiceRecord**: Deberíamos considerar agregar los campos `mileage: integer` y `next_service_date: date` a la tabla `service_records`.
2.  **Services y Products**: La lista anterior es un excelente punto de partida para poblar nuestras tablas de `services` y `products`.
3.  **ServiceRecord-Items**: La relación entre `ServiceRecord`, `Service` y `Product` es fundamental. Un `ServiceRecord` ("orden de venta") es una colección de `ServiceRecordService` y `ServiceRecordProduct`, que son los items específicos que se vendieron/realizaron.

Este análisis será crucial cuando implementemos los modelos `Product` y `ServiceRecord`. 