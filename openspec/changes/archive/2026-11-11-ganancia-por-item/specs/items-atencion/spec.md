## MODIFIED Requirements

### Requirement: Total de la atención con IVA calculado por el backend
Al guardar una atención con ítems nuevos, modificados o borrados, el backend SHALL calcular `total_amount` (redondeado a 2 decimales) como neto de los ítems con alícuota + IVA redondeado por alícuota + importes de ítems sin IVA + ganancia de todos los ítems (mismo cálculo que el total efectivo/débito del presupuesto). El cliente MUST NOT poder fijar `total_amount`. La respuesta `with_details` SHALL incluir `subtotal_net`, `total_iva`, `iva_breakdown`, `exempt_total` y `margin_total`.

#### Scenario: Atención mixta
- **GIVEN** un ítem de 2 × $10.000 al 21% y un ítem de 1 × $5.000 sin IVA, sin ganancia
- **WHEN** se guarda la atención
- **THEN** `total_amount` = 29200 y `iva_breakdown` contiene `{ rate: "21.0", base: "20000.0", amount: "4200.0" }`

#### Scenario: Atención con ganancia
- **GIVEN** un ítem de 1 × $1.000 al 21% con ganancia 30%
- **WHEN** se guarda la atención
- **THEN** `total_amount` = 1510 y `margin_total` = 300

#### Scenario: Guardar solo la cabecera conserva el total
- **GIVEN** una atención con `total_amount` = 80150 cuyos ítems suman $80.000 (dato histórico)
- **WHEN** se actualizan solo las notas
- **THEN** `total_amount` sigue en 80150

#### Scenario: Total enviado por el cliente
- **WHEN** se envía `total_amount: 1` junto con ítems que suman $29.200
- **THEN** la atención queda con `total_amount` = 29200
