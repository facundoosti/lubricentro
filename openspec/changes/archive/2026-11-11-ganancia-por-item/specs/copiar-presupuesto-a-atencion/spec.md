## ADDED Requirements

### Requirement: La copia incluye la ganancia
Al copiar un presupuesto a una atención, cada línea SHALL conservar su `margin_percentage` además de descripción, cantidad, precio unitario, alícuota y orden.

#### Scenario: Copiar una línea con ganancia
- **GIVEN** un presupuesto con una línea 1 × $1.000 al 21% con ganancia 30%
- **WHEN** el usuario lo copia a una atención nueva
- **THEN** la línea de la atención tiene ganancia 30% y la barra muestra Total $1.510
