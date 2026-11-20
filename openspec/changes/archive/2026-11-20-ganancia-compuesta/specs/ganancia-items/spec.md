## RENAMED Requirements

- FROM: `### Requirement: Fórmula sumada de IVA y ganancia`
- TO: `### Requirement: Fórmula compuesta de IVA y ganancia`

## MODIFIED Requirements

### Requirement: Fórmula compuesta de IVA y ganancia
El importe final de una línea SHALL ser compuesto: primero el IVA y después la ganancia sobre el neto con IVA, es decir `neto × (1 + IVA%) × (1 + ganancia%)`, con `neto = round(cantidad × unitario, 2)`. El IVA de la línea SHALL ser `round(neto × IVA% / 100, 2)` (0 si no tiene alícuota) y la ganancia de la línea SHALL ser `round((neto + IVA de la línea) × ganancia% / 100, 2)`. El IVA de los totales MUST seguir redondeándose por alícuota sobre el neto sin ganancia. Los totales del presupuesto (`total_list`, `total_card`) y de la atención (`total_amount`) SHALL incluir la ganancia compuesta, y las respuestas SHALL incluir `margin_total` (suma de las ganancias de línea).

#### Scenario: Línea con IVA y ganancia
- **GIVEN** un presupuesto con un ítem 1 × $1.000 al 21% con ganancia 30% y recargo de tarjeta 10%
- **WHEN** se guarda
- **THEN** `subtotal_net` = 1000, `total_iva` = 210, `margin_total` = 363, `total_list` = 1573 y `total_card` = 1730.3

#### Scenario: Línea con IVA y ganancia 50%
- **GIVEN** un presupuesto con un ítem 1 × $1.000 al 21% con ganancia 50%
- **WHEN** se guarda
- **THEN** `total_iva` = 210, `margin_total` = 605 y `total_list` = 1815

#### Scenario: Línea sin IVA con ganancia
- **GIVEN** una atención con un ítem 2 × $500 sin IVA con ganancia 20%
- **WHEN** se guarda
- **THEN** `total_amount` = 1200 y `margin_total` = 200

#### Scenario: Vista previa en el formulario
- **GIVEN** una línea 1 × $1.000, IVA 21% y ganancia 50%
- **WHEN** el usuario carga esos valores
- **THEN** el importe final de la línea es $1.815 y el desglose de la barra muestra IVA 21% $210 y Ganancia $605

### Requirement: Ganancia oculta al cliente
La impresión del presupuesto MUST NOT mostrar la ganancia, el % de ganancia, el subtotal neto ni la base del IVA. Cada línea SHALL mostrar cantidad, descripción, precio unitario final (`unitario × (1 + IVA%) × (1 + ganancia%)`, cada parte redondeada a centavos) e importe final. El pie SHALL mostrar el IVA por alícuota (sin base) solo si hay IVA, el total efectivo/débito y el total tarjeta. El mensaje de WhatsApp MUST NOT mencionar la ganancia.

#### Scenario: Imprimir un presupuesto con ganancia
- **GIVEN** el presupuesto del escenario "Línea con IVA y ganancia"
- **WHEN** el usuario abre la impresión
- **THEN** la línea muestra P. unit. $1.573 e importe $1.573, el pie muestra "IVA 21%" $210, Efectivo/Débito $1.573 y Tarjeta $1.730,30, y no aparecen "Ganancia", "Subtotal neto" ni "$363"

#### Scenario: WhatsApp
- **WHEN** se arma el mensaje de WhatsApp de ese presupuesto
- **THEN** muestra Total efectivo / débito $1.573 y Total tarjeta $1.730,30 sin mencionar la ganancia

### Requirement: Columna "% Ganancia" en el formulario
El componente "Productos y Servicios" SHALL mostrar en presupuesto y atención una columna "% Ganancia" editable por línea (vacía o 0 = sin ganancia), ubicada **después de la columna IVA** y antes de "Importe final" (orden: Cant., Producto / servicio, Precio unit. s/IVA, IVA, % Ganancia, Importe final). La columna de importe SHALL titularse "Importe final". Al elegir un **producto** del buscador, la línea SHALL tomar 50% de ganancia por defecto; los servicios y el texto libre arrancan en 0%. En el backend el default sigue en 0 y una ganancia vacía o nula MUST guardarse como 0 (sin 422).

#### Scenario: Orden de columnas
- **WHEN** el usuario abre "Productos y Servicios" en el presupuesto o la atención
- **THEN** el encabezado "% Ganancia" aparece después de "IVA" y antes de "Importe final", y en cada línea el campo de ganancia está después del selector de IVA

#### Scenario: Agregar una línea
- **WHEN** el usuario agrega una línea en el presupuesto o en la atención
- **THEN** la columna "% Ganancia" arranca en 0

#### Scenario: Elegir un producto
- **WHEN** el usuario elige un producto en el buscador de una línea
- **THEN** la línea queda con ganancia 50%

#### Scenario: Elegir un servicio
- **WHEN** el usuario elige un servicio en el buscador
- **THEN** la línea queda con ganancia 0%

#### Scenario: Ganancia vacía en la API
- **WHEN** se guarda un ítem con `margin_percentage` = "" o null
- **THEN** el ítem queda con `margin_percentage` = 0

### Requirement: Ingresos del dashboard con ganancia
El dashboard SHALL calcular los ingresos por productos y servicios sobre los ítems de atención como `Σ neto + round((neto + IVA de la línea) × ganancia% / 100, 2)`, con `neto = round(cantidad × unitario, 2)` e `IVA de la línea = round(neto × IVA% / 100, 2)` (0 sin alícuota), con los mismos redondeos que el modelo. El IVA MUST NOT sumarse como ingreso.

#### Scenario: Ingreso de un ítem sin IVA con ganancia
- **GIVEN** un ítem de atención de 1,5 × $33,33 sin IVA con ganancia 10% vinculado a un producto
- **WHEN** se piden las estadísticas del dashboard
- **THEN** el ingreso por productos es 55,00

#### Scenario: Ingreso de un ítem con IVA y ganancia
- **GIVEN** un ítem de atención de 1 × $1.000 al 21% con ganancia 50% vinculado a un producto
- **WHEN** se piden las estadísticas del dashboard
- **THEN** el ingreso por productos es 1605,00
