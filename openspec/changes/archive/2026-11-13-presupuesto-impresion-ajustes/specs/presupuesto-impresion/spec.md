## ADDED Requirements

### Requirement: Año con dos dígitos
La hoja de presupuesto impresa SHALL mostrar el año de la fecha con dos dígitos.

#### Scenario: Presupuesto de 2026
- **GIVEN** un presupuesto con fecha 2026-11-13
- **WHEN** se abre la hoja de impresión
- **THEN** el año se muestra como `26`

#### Scenario: Presupuesto sin fecha
- **GIVEN** un presupuesto sin fecha
- **WHEN** se abre la hoja de impresión
- **THEN** día, mes y año quedan vacíos

### Requirement: Nombre vacío sin cliente
El campo NOMBRE de la hoja SHALL mostrar el nombre del cliente y quedar vacío cuando el presupuesto no tiene cliente.

#### Scenario: Con cliente
- **GIVEN** un presupuesto con cliente "Juan Pérez"
- **WHEN** se abre la hoja de impresión
- **THEN** NOMBRE muestra "Juan Pérez"

#### Scenario: Sin cliente con vehículo descripto
- **GIVEN** un presupuesto sin cliente y con descripción de vehículo "Gol Trend"
- **WHEN** se abre la hoja de impresión
- **THEN** NOMBRE queda vacío
- **AND** la descripción del vehículo sigue apareciendo en el renglón Vehículo

### Requirement: Columna Artículo
La tabla de ítems de la hoja impresa SHALL titular la columna de descripción como "ARTÍCULO".

#### Scenario: Encabezado de la tabla
- **WHEN** se abre la hoja de impresión de un presupuesto con ítems
- **THEN** el encabezado de la columna de descripción dice "ARTÍCULO" y no "DESCRIPCIÓN"
