# alta-cliente Specification

## Purpose
TBD - created by archiving change mejoras-clientes-vehiculos. Update Purpose after archive.
## Requirements
### Requirement: Campos obligatorios del cliente
El formulario de cliente SHALL exigir solo nombre y teléfono. Email, dirección y foto MUST ser opcionales.

#### Scenario: Alta con nombre y teléfono
- **GIVEN** el formulario de nuevo cliente
- **WHEN** el usuario completa solo nombre y teléfono y guarda
- **THEN** el cliente se crea y se muestra un aviso de éxito

#### Scenario: Falta el teléfono
- **WHEN** el usuario intenta guardar sin teléfono
- **THEN** ve el error "El teléfono es requerido" y no se envía el formulario

### Requirement: Email vacío guardado como nulo
El backend SHALL guardar un email vacío o con solo espacios como `NULL`, para que varios clientes sin email no choquen con el índice único.

#### Scenario: Dos clientes sin email
- **GIVEN** un cliente existente con email vacío
- **WHEN** se crea otro cliente con `email` = ""
- **THEN** la API responde 201 y ambos clientes tienen `email` nulo

#### Scenario: Backfill de emails vacíos
- **GIVEN** clientes guardados con `email` = ""
- **WHEN** se ejecuta `customers:normalize_blank_emails`
- **THEN** esos clientes quedan con `email` nulo y el resto no cambia

### Requirement: Búsqueda de clientes por teléfono
La búsqueda de clientes SHALL encontrar coincidencias por teléfono comparando solo dígitos, además de nombre y email.

#### Scenario: Buscar con otro formato
- **GIVEN** un cliente con teléfono "11 5555-1234"
- **WHEN** se busca `search=1155551234`
- **THEN** el cliente aparece en los resultados

### Requirement: Aviso de teléfono duplicado
Al completar el teléfono en el alta, el frontend SHALL consultar `GET /api/v1/customers?phone=…` y, si existe un cliente con el mismo número, mostrar un aviso con su nombre y un link a su perfil. El aviso MUST NOT impedir guardar.

#### Scenario: Teléfono ya registrado
- **GIVEN** un cliente "Juan Pérez" con teléfono "+54 9 11 5555-1234"
- **WHEN** el usuario escribe "1155551234" en el teléfono de un cliente nuevo y sale del campo
- **THEN** ve "Ya existe Juan Pérez con este teléfono" con un link "Ver perfil" y puede guardar igual

#### Scenario: Filtro exacto por teléfono en la API
- **GIVEN** clientes con teléfonos "1155551234" y "1155559999"
- **WHEN** se consulta `GET /api/v1/customers?phone=+54 9 11 5555-1234`
- **THEN** la respuesta incluye solo el primero

### Requirement: Acciones después de crear un cliente
Después de crear un cliente, el sistema SHALL ofrecer "Ver perfil" y "+ Agregar vehículo".

#### Scenario: Agregar vehículo desde el aviso
- **GIVEN** el usuario acaba de crear un cliente
- **WHEN** toca "+ Agregar vehículo"
- **THEN** se abre el perfil del cliente con el formulario de vehículo abierto y el cliente ya elegido

#### Scenario: Ver perfil desde el aviso
- **WHEN** el usuario toca "Ver perfil"
- **THEN** navega a `/customers/:id`

### Requirement: Formulario de cliente consistente
El formulario SHALL usar el mismo estilo de campos que el resto de los formularios, mostrar la foto en una sección plegable "Foto (opcional)" y MUST NOT escribir en la consola.

#### Scenario: Foto plegada por defecto
- **WHEN** el usuario abre el formulario de nuevo cliente
- **THEN** la sección de foto está plegada y no hay `console.log` en la consola

