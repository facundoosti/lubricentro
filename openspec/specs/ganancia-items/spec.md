# ganancia-items Specification

## Purpose
TBD - created by archiving change ganancia-por-item. Update Purpose after archive.
## Requirements
### Requirement: % de ganancia guardado por línea
Cada ítem de presupuesto y de atención SHALL guardar su `margin_percentage` (≥ 0 y < 1000, 2 decimales, por defecto 0). La API SHALL recibirlo en `items_attributes` y devolverlo en cada ítem.

#### Scenario: Guardar una línea con ganancia
- **WHEN** se guarda un presupuesto con un ítem `{ quantity: 1, unit_price: 1000, iva_rate: 21, margin_percentage: 30 }`
- **THEN** el ítem queda con `margin_percentage` = 30

#### Scenario: Ganancia por defecto
- **WHEN** se guarda un ítem sin `margin_percentage`
- **THEN** el ítem queda con `margin_percentage` = 0 y los totales no cambian respecto de antes

#### Scenario: Ganancia inválida
- **WHEN** se guarda un ítem con `margin_percentage` = -5
- **THEN** la API responde 422 y no se guarda

### Requirement: Fórmula sumada de IVA y ganancia
El importe final de una línea SHALL ser `cantidad × unitario neto × (1 + IVA% + ganancia%)`. El IVA MUST calcularse sobre el neto sin ganancia, redondeado por alícuota. La ganancia de la línea SHALL ser `round(cantidad × neto × ganancia% / 100, 2)`. Los totales del presupuesto (`total_list`, `total_card`) y de la atención (`total_amount`) SHALL incluir la ganancia, y las respuestas SHALL incluir `margin_total`.

#### Scenario: Línea con IVA y ganancia
- **GIVEN** un presupuesto con un ítem 1 × $1.000 al 21% con ganancia 30% y recargo de tarjeta 10%
- **WHEN** se guarda
- **THEN** `subtotal_net` = 1000, `total_iva` = 210, `margin_total` = 300, `total_list` = 1510 y `total_card` = 1661

#### Scenario: Línea sin IVA con ganancia
- **GIVEN** una atención con un ítem 2 × $500 sin IVA con ganancia 20%
- **WHEN** se guarda
- **THEN** `total_amount` = 1200 y `margin_total` = 200

#### Scenario: Vista previa en el formulario
- **GIVEN** una línea 1 × $1.000, IVA 21% y ganancia 30%
- **WHEN** el usuario carga esos valores
- **THEN** el importe final de la línea es $1.510 y el desglose de la barra muestra Ganancia $300 e IVA 21% $210

### Requirement: Ganancia oculta al cliente
La impresión del presupuesto MUST NOT mostrar la ganancia, el % de ganancia, el subtotal neto ni la base del IVA. Cada línea SHALL mostrar cantidad, descripción, precio unitario final (`unitario × (1 + IVA% + ganancia%)`) e importe final. El pie SHALL mostrar el IVA por alícuota (sin base) solo si hay IVA, el total efectivo/débito y el total tarjeta. El mensaje de WhatsApp MUST NOT mencionar la ganancia.

#### Scenario: Imprimir un presupuesto con ganancia
- **GIVEN** el presupuesto del escenario "Línea con IVA y ganancia"
- **WHEN** el usuario abre la impresión
- **THEN** la línea muestra P. unit. $1.510 e importe $1.510, el pie muestra "IVA 21%" $210, Efectivo/Débito $1.510 y Tarjeta $1.661, y no aparecen "Ganancia", "Subtotal neto" ni "$300"

#### Scenario: WhatsApp
- **WHEN** se arma el mensaje de WhatsApp de ese presupuesto
- **THEN** muestra Total efectivo / débito $1.510 y Total tarjeta $1.661 sin mencionar la ganancia

### Requirement: Columna "% Ganancia" en el formulario
El componente "Productos y Servicios" SHALL mostrar en presupuesto y atención una columna "% Ganancia" editable por línea (vacía o 0 = sin ganancia), y la columna de importe SHALL titularse "Importe final". Al elegir un **producto** del buscador, la línea SHALL tomar 30% de ganancia por defecto; los servicios y el texto libre arrancan en 0%. En el backend el default sigue en 0 y una ganancia vacía o nula MUST guardarse como 0 (sin 422).

#### Scenario: Agregar una línea
- **WHEN** el usuario agrega una línea en el presupuesto o en la atención
- **THEN** la columna "% Ganancia" arranca en 0

#### Scenario: Elegir un producto
- **WHEN** el usuario elige un producto en el buscador de una línea
- **THEN** la línea queda con ganancia 30%

#### Scenario: Elegir un servicio
- **WHEN** el usuario elige un servicio en el buscador
- **THEN** la línea queda con ganancia 0%

#### Scenario: Ganancia vacía en la API
- **WHEN** se guarda un ítem con `margin_percentage` = "" o null
- **THEN** el ítem queda con `margin_percentage` = 0

### Requirement: Ingresos del dashboard con ganancia
El dashboard SHALL calcular los ingresos por productos y servicios como `Σ round(cantidad × unitario, 2) + round(round(cantidad × unitario, 2) × ganancia% / 100, 2)` sobre los ítems de atención, con los mismos redondeos que el modelo.

#### Scenario: Ingreso de un ítem con ganancia
- **GIVEN** un ítem de atención de 1,5 × $33,33 con ganancia 10% vinculado a un producto
- **WHEN** se piden las estadísticas del dashboard
- **THEN** el ingreso por productos es 55,00

