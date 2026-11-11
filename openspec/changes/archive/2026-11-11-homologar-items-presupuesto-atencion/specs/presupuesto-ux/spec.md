## ADDED Requirements

### Requirement: Sección "Productos y Servicios" compartida
La sección de ítems del formulario de presupuesto SHALL titularse "Productos y Servicios" (no "Artículos") y SHALL ser el mismo componente que usa el formulario de atención. La columna de descripción SHALL titularse "Producto / servicio" y la de alícuota "% IVA".

#### Scenario: Abrir el formulario de presupuesto
- **WHEN** el usuario abre "Nuevo presupuesto"
- **THEN** ve la sección "Productos y Servicios" con la cantidad de líneas y no aparece el texto "Artículos"

#### Scenario: Mismo componente en atención
- **WHEN** el usuario abre "Nueva atención"
- **THEN** ve la misma sección "Productos y Servicios" con las mismas columnas que en el presupuesto
