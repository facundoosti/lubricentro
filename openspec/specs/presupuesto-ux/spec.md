# presupuesto-ux Specification

## Purpose
Experiencia de uso del presupuesto: carga ágil de ítems, vista mobile, barra de totales fija, acciones (duplicar, WhatsApp, imprimir) y gestión de estados en el listado.
## Requirements
### Requirement: Vehículo vinculado al presupuesto
Cuando el cliente tiene vehículos, el formulario SHALL permitir elegir uno y enviar `vehicle_id` junto con `vehicle_description`. Sin cliente o sin vehículos SHALL permitir texto libre con `vehicle_id` nulo. El backend MUST rechazar un `vehicle_id` que no pertenezca al `customer_id` indicado.

#### Scenario: Elegir un vehículo del cliente
- **GIVEN** un cliente con un vehículo "Ford Ka 2015 (AB123CD)"
- **WHEN** el usuario elige ese vehículo y guarda
- **THEN** el presupuesto queda con ese `vehicle_id` y `vehicle_description` = "Ford Ka 2015 (AB123CD)"

#### Scenario: Cambiar de cliente
- **GIVEN** un presupuesto con cliente y vehículo elegidos
- **WHEN** el usuario cambia el cliente
- **THEN** se limpian el vehículo y su descripción

#### Scenario: Vehículo de otro cliente
- **WHEN** se envía un presupuesto con un `vehicle_id` de otro cliente
- **THEN** la API responde 422 con `success: false`

### Requirement: Carga ágil de ítems
El editor de ítems SHALL agregar una línea nueva y enfocarla al presionar Enter en la última línea, y SHALL permitir borrar cualquier línea; si se borra la única, MUST quedar una línea vacía.

#### Scenario: Enter en la última línea
- **GIVEN** una línea con descripción y precio cargados
- **WHEN** el usuario presiona Enter en el precio de la última línea
- **THEN** aparece una línea nueva con el foco en su descripción y el formulario no se envía

#### Scenario: Borrar la única línea
- **GIVEN** una sola línea con datos
- **WHEN** el usuario la borra
- **THEN** queda una línea vacía

### Requirement: Ítems como tarjetas en mobile
En pantallas menores a `md` los ítems SHALL mostrarse como tarjetas apiladas (descripción, cantidad, precio, alícuota, importe y borrar), sin scroll horizontal.

#### Scenario: Vista en un celular
- **GIVEN** un viewport de 375 px de ancho
- **WHEN** el usuario abre el formulario con tres ítems
- **THEN** ve tres tarjetas y la página no tiene scroll horizontal

### Requirement: Barra de totales fija
El formulario SHALL mostrar una barra fija abajo con "Efectivo / Débito", "Tarjeta de crédito" y el botón Guardar, y un desglose plegable (subtotal neto, IVA por alícuota, sin IVA, recargo). Los textos MUST NOT usar las etiquetas viejas ("PRECIO D/LISTA / EFT/DEB TOTAL").

#### Scenario: Presupuesto largo
- **GIVEN** un presupuesto con 20 ítems
- **WHEN** el usuario hace scroll por la lista
- **THEN** la barra de totales y el botón Guardar siguen visibles

#### Scenario: Ver el desglose
- **WHEN** el usuario abre el desglose de la barra
- **THEN** ve el subtotal neto, el IVA por cada alícuota usada, el importe sin IVA y el recargo de tarjeta

### Requirement: Duplicar presupuesto
El sistema SHALL permitir duplicar un presupuesto con `POST /api/v1/budgets/:id/duplicate`. La copia MUST tener los mismos cliente, vehículo, notas, recargo e ítems (con sus alícuotas), estado "Borrador" y fecha de hoy.

#### Scenario: Duplicar desde el listado
- **GIVEN** un presupuesto aprobado del mes pasado con 3 ítems
- **WHEN** el usuario toca "Duplicar"
- **THEN** se crea un presupuesto nuevo en borrador con fecha de hoy y los mismos 3 ítems, y se abre su edición

#### Scenario: Duplicar uno inexistente
- **WHEN** se llama a `duplicate` con un id que no existe
- **THEN** la API responde 404 con `success: false`

### Requirement: Enviar por WhatsApp
El formulario y el listado SHALL ofrecer "Enviar por WhatsApp", que abre `wa.me` con el teléfono del cliente y un resumen (lubricentro, número y fecha, vehículo, total efectivo/débito y total tarjeta). Si el cliente no tiene teléfono el botón MUST verse deshabilitado con una explicación.

#### Scenario: Cliente con teléfono
- **GIVEN** un presupuesto guardado de un cliente con teléfono "11 5555-1234"
- **WHEN** el usuario toca "Enviar por WhatsApp"
- **THEN** se abre `https://wa.me/5491155551234?text=…` con el resumen y los totales

#### Scenario: Cliente sin teléfono
- **GIVEN** un presupuesto sin cliente o con cliente sin teléfono
- **WHEN** el usuario ve las acciones
- **THEN** el botón de WhatsApp está deshabilitado y explica que falta el teléfono

### Requirement: Filtro y cambio rápido de estado en el listado
El listado de presupuestos SHALL permitir filtrar por estado y cambiar el estado de un presupuesto desde su fila, sin abrir el formulario.

#### Scenario: Filtrar por estado
- **GIVEN** presupuestos en borrador y aprobados
- **WHEN** el usuario elige el filtro "Aprobado"
- **THEN** la lista muestra solo los aprobados

#### Scenario: Cambiar estado desde la fila
- **GIVEN** un presupuesto en borrador
- **WHEN** el usuario elige "Enviado" en el menú de estado de la fila
- **THEN** el presupuesto queda en "Enviado", la fila se actualiza y se muestra un aviso de éxito

### Requirement: Buscador de ítems con stock y teclado
El buscador de ítems SHALL mostrar el stock de los productos y el precio "neto + IVA = final", y SHALL permitir moverse con ↑ y ↓, elegir con Enter y cerrar con Esc.

#### Scenario: Navegar con el teclado
- **GIVEN** el buscador muestra 3 resultados
- **WHEN** el usuario presiona ↓ dos veces y Enter
- **THEN** se elige el segundo resultado y se completa la línea

#### Scenario: Producto sin stock
- **GIVEN** un producto con `stock` = 0
- **WHEN** aparece en los resultados
- **THEN** se ve la etiqueta "Sin stock" y se puede elegir igual

### Requirement: Textos en español
Los textos del frontend y los mensajes de la API de presupuestos MUST estar en español, sin la palabra "budget".

#### Scenario: Crear presupuesto
- **WHEN** se crea un presupuesto con éxito
- **THEN** el mensaje de la API es "Presupuesto creado exitosamente" y el subtítulo del formulario no contiene "budget"

