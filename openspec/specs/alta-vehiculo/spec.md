# alta-vehiculo Specification

## Purpose
TBD - created by archiving change mejoras-clientes-vehiculos. Update Purpose after archive.
## Requirements
### Requirement: Búsqueda automática por patente
Cuando la patente tiene un formato válido (ABC123 o AB123CD) y el usuario deja de escribir, el formulario SHALL consultar `GET /api/v1/vehicles/lookup` una sola vez por patente. Solo MUST completar marca, modelo y año si esos campos están vacíos o fueron autocompletados antes.

#### Scenario: Patente encontrada
- **GIVEN** el formulario de nuevo vehículo con marca, modelo y año vacíos
- **WHEN** el usuario escribe "AB123CD" y deja de escribir
- **THEN** se completan marca, modelo y año y se ven marcados como "Autocompletado"

#### Scenario: No pisa datos escritos a mano
- **GIVEN** el usuario escribió la marca "Ford"
- **WHEN** la búsqueda devuelve otra marca
- **THEN** la marca sigue siendo "Ford" y se completan solo los campos vacíos

#### Scenario: Una sola consulta por patente
- **WHEN** el usuario escribe la misma patente válida dos veces seguidas
- **THEN** se hace una sola consulta a `lookup`

### Requirement: Feedback de la búsqueda por patente
El formulario SHALL informar el resultado de la búsqueda cuando no hay datos o el servicio falla.

#### Scenario: Patente sin datos
- **WHEN** `lookup` responde 404
- **THEN** se ve "No encontramos datos para esta patente. Completalos a mano."

#### Scenario: Servicio caído
- **WHEN** `lookup` responde 503 o falla la red
- **THEN** se ve "El servicio de búsqueda no responde. Completalos a mano." y el botón ✨ permite reintentar

### Requirement: Patente ya registrada
El backend SHALL aceptar el filtro `license_plate` en `GET /api/v1/vehicles` (coincidencia exacta sobre la patente normalizada, con datos del dueño). El formulario SHALL usarlo para avisar antes de guardar y MUST deshabilitar Guardar si la patente pertenece a otro vehículo.

#### Scenario: Filtro por patente en la API
- **GIVEN** un vehículo con patente "AB123CD"
- **WHEN** se consulta `GET /api/v1/vehicles?license_plate=ab 123 cd`
- **THEN** la respuesta incluye ese vehículo con el nombre de su dueño

#### Scenario: Aviso en el formulario
- **GIVEN** un vehículo "AB123CD" de "María Gómez"
- **WHEN** el usuario escribe "AB123CD" en un vehículo nuevo
- **THEN** ve "Patente registrada a María Gómez · Ver perfil" y el botón Guardar está deshabilitado

#### Scenario: Editar el mismo vehículo
- **GIVEN** el usuario edita el vehículo "AB123CD"
- **WHEN** la patente sigue siendo "AB123CD"
- **THEN** no aparece el aviso y puede guardar

### Requirement: Años desde 1950
El formulario SHALL ofrecer años desde el actual hasta 1950, y el backend SHALL validar que el año esté entre 1950 y el año siguiente al actual.

#### Scenario: Auto de 1986
- **WHEN** el usuario elige el año 1986 y guarda
- **THEN** el vehículo se crea

#### Scenario: Año fuera de rango en la API
- **WHEN** se envía un vehículo con año 1900
- **THEN** la API responde 422 con un error sobre el año

### Requirement: Crear cliente desde el formulario de vehículo
El buscador de clientes del formulario de vehículo SHALL ofrecer "+ Crear cliente" con el texto buscado. Al crearlo, MUST quedar elegido en el vehículo sin perder lo ya cargado.

#### Scenario: Cliente nuevo en el mostrador
- **GIVEN** el usuario cargó patente, marca, modelo y año
- **WHEN** busca "Carlos Ruiz", no hay resultados, toca "+ Crear cliente \"Carlos Ruiz\"", completa el teléfono y guarda
- **THEN** el cliente se crea, queda elegido en el vehículo y los datos del vehículo siguen cargados

