# datos-fiscales-cliente Specification

## Purpose
TBD - created by archiving change presupuesto-hoja-rediseno. Update Purpose after archive.
## Requirements
### Requirement: CUIT del cliente
El cliente SHALL poder tener un CUIT opcional, con 11 dígitos, que se guarda con el formato `NN-NNNNNNNN-N`.

#### Scenario: CUIT sin guiones
- **WHEN** se guarda un cliente con CUIT "20284561234"
- **THEN** queda guardado como "20-28456123-4"

#### Scenario: CUIT inválido
- **WHEN** se guarda un cliente con CUIT "123"
- **THEN** la API responde 422 con un error en `cuit`

### Requirement: Tipo de factura del cliente
El cliente SHALL poder tener un tipo de factura opcional entre A, B, C y CF (consumidor final).

#### Scenario: Tipo inválido
- **WHEN** se guarda un cliente con tipo de factura "Z"
- **THEN** la API responde 422 con un error en `invoice_type`

#### Scenario: Carga desde el formulario
- **WHEN** el usuario completa el CUIT y elige "B" en el formulario de cliente y guarda
- **THEN** el cliente queda con esos datos y la API los devuelve

