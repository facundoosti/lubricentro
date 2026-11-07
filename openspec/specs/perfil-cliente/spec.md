# perfil-cliente Specification

## Purpose
TBD - created by archiving change mejoras-clientes-vehiculos. Update Purpose after archive.
## Requirements
### Requirement: Encabezado único del perfil
El perfil SHALL mostrar una sola tarjeta de encabezado con avatar, nombre, teléfono, email, dirección y un único botón "Editar". MUST NOT repetir los datos de contacto en otra tarjeta.

#### Scenario: Ver el perfil
- **WHEN** el usuario abre `/customers/:id`
- **THEN** ve una sola tarjeta con los datos de contacto y un solo botón "Editar"

### Requirement: Contacto rápido
El encabezado SHALL ofrecer Llamar, WhatsApp y Email cuando el dato existe. WhatsApp MUST abrir `https://wa.me/<teléfono normalizado>`.

#### Scenario: Cliente con teléfono
- **GIVEN** un cliente con teléfono "11 5555-1234"
- **WHEN** el usuario toca WhatsApp
- **THEN** se abre `https://wa.me/5491155551234` en una pestaña nueva

#### Scenario: Cliente sin teléfono
- **GIVEN** un cliente sin teléfono
- **WHEN** el usuario abre el perfil
- **THEN** no se muestran los botones Llamar ni WhatsApp

### Requirement: Errores con avisos de la app
El perfil SHALL informar los errores al guardar cliente o vehículo con los avisos (toasts) de la app y MUST NOT usar `alert()`.

#### Scenario: Error al editar
- **GIVEN** la API responde 422 al editar el cliente
- **WHEN** el usuario guarda
- **THEN** ve un toast de error con el mensaje y no aparece una alerta del navegador

### Requirement: Historial del cliente
El perfil SHALL mostrar un historial con pestañas **Atenciones**, **Presupuestos** y **Turnos** (los 5 más recientes; en turnos, los próximos primero), con "Ver todos". Cada pestaña MUST manejar carga, error y vacío. El backend SHALL aceptar el filtro `customer_id` en `GET /api/v1/budgets`.

#### Scenario: Filtro de presupuestos por cliente
- **GIVEN** presupuestos de dos clientes
- **WHEN** se consulta `GET /api/v1/budgets?customer_id=:id`
- **THEN** la respuesta incluye solo los del cliente indicado

#### Scenario: Ver presupuestos del cliente
- **GIVEN** un cliente con 2 presupuestos
- **WHEN** el usuario abre la pestaña Presupuestos
- **THEN** ve los 2 con fecha, estado y total, y al tocar uno se abre su edición

#### Scenario: Cliente sin historial
- **GIVEN** un cliente sin atenciones
- **WHEN** el usuario abre la pestaña Atenciones
- **THEN** ve un estado vacío con el botón "Nueva atención"

### Requirement: Último service por vehículo
Al listar vehículos por cliente, la API SHALL incluir `last_service_date` y `last_mileage` de la atención más reciente de cada vehículo, sin consultas N+1. El perfil SHALL mostrarlos en cada vehículo.

#### Scenario: Vehículo con atenciones
- **GIVEN** un vehículo con atenciones del 10/03 (45.000 km) y del 15/08 (52.000 km)
- **WHEN** se consulta `GET /api/v1/vehicles?customer_id=:id`
- **THEN** ese vehículo trae `last_service_date` = 15/08 y `last_mileage` = 52000

#### Scenario: Vehículo sin atenciones
- **WHEN** el vehículo no tiene atenciones
- **THEN** `last_service_date` y `last_mileage` son nulos y el perfil muestra "Sin services"

#### Scenario: Sin N+1
- **GIVEN** un cliente con 5 vehículos con atenciones
- **WHEN** se listan sus vehículos
- **THEN** la cantidad de consultas no crece con la cantidad de vehículos

### Requirement: Accesos rápidos desde el perfil
El perfil SHALL ofrecer "Nuevo presupuesto" (con el cliente elegido) y, en cada vehículo, "Presupuestar" y "Nueva atención" (con cliente y vehículo elegidos). Los formularios de presupuesto y atención SHALL leer `customer_id` y `vehicle_id` de la URL al crear.

#### Scenario: Presupuestar un vehículo
- **GIVEN** el perfil de un cliente con el vehículo "AB123CD"
- **WHEN** el usuario toca "Presupuestar" en ese vehículo
- **THEN** se abre el nuevo presupuesto con el cliente y el vehículo ya elegidos

#### Scenario: Nueva atención
- **WHEN** el usuario toca "Nueva atención" en un vehículo
- **THEN** se abre el formulario de atención con cliente y vehículo elegidos

#### Scenario: Abrir el alta de vehículo por URL
- **WHEN** el usuario llega a `/customers/:id?addVehicle=1`
- **THEN** se abre el formulario de vehículo con el cliente elegido y el parámetro se quita de la URL

