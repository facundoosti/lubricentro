# planes-cuotas Specification

## Purpose
TBD - created by archiving change presupuesto-hoja-rediseno. Update Purpose after archive.
## Requirements
### Requirement: ABM de planes de cuotas
El sistema SHALL permitir crear, editar, desactivar y borrar planes de cuotas, con nombre, cantidad de cuotas (más de 1), recargo en % (0 o más) y orden. Esto se hace desde Configuración.

#### Scenario: Crear plan
- **WHEN** se crea el plan "VISA", con 6 cuotas y 20% de recargo
- **THEN** el plan queda activo y aparece en la lista

#### Scenario: Cuotas inválidas
- **WHEN** se intenta crear un plan de 1 cuota
- **THEN** la API responde 422

### Requirement: Cálculo de cuotas del presupuesto
La API del presupuesto SHALL devolver `installment_options` para cada plan activo, en orden de posición. Cada opción trae `total = total_list × (1 + recargo/100)` y `installment_amount = total / cuotas`, redondeados a 2 decimales.

#### Scenario: Cálculo
- **WHEN** `total_list` es 120000 y hay un plan activo de 3 cuotas con 10% de recargo
- **THEN** `installment_options` trae `total` 132000 e `installment_amount` 44000

#### Scenario: Plan inactivo
- **WHEN** un plan está desactivado
- **THEN** no aparece en `installment_options`

