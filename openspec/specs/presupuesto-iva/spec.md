# presupuesto-iva Specification

## Purpose
IVA discriminado en los presupuestos (responsable inscripto): alícuota guardada en cada ítem, totales calculados por el backend con desglose por alícuota, e impresión con ese desglose.
## Requirements
### Requirement: Alícuota guardada en cada ítem del presupuesto
Cada ítem de presupuesto SHALL guardar su propia alícuota (`iva_rate`): 21, 10,5 o vacía (= sin IVA, precio final). Al crear un ítem o cambiar su alícuota, cualquier otro valor MUST rechazarse con 422. Los ítems guardados antes con otro % (por el % libre anterior) SHALL poder volver a guardarse sin cambiar su alícuota. La alícuota del ítem MUST NOT cambiar si después cambia la alícuota del producto de origen.

#### Scenario: Ítem con alícuota válida
- **WHEN** se guarda un presupuesto con un ítem de `iva_rate` = 10.5
- **THEN** el ítem queda con `iva_rate` = 10.5

#### Scenario: Ítem sin alícuota
- **WHEN** se guarda un ítem sin `iva_rate`
- **THEN** el ítem queda con `iva_rate` nulo y se trata como sin IVA

#### Scenario: Alícuota inválida en un ítem
- **WHEN** se guarda un ítem con `iva_rate` = 15
- **THEN** la API responde 422 y el presupuesto no se guarda

#### Scenario: Ítem viejo con % libre
- **GIVEN** un ítem guardado con `iva_rate` = 15
- **WHEN** se edita su cantidad sin tocar la alícuota
- **THEN** se guarda y conserva `iva_rate` = 15

#### Scenario: Duplicar o copiar un ítem con % anterior
- **GIVEN** un presupuesto con un ítem guardado al 15%
- **WHEN** se duplica el presupuesto o se copia a una atención nueva
- **THEN** la copia conserva el 15% sin error; al crear la atención se acepta cualquier línea cuyo % coincida con alguno de los ítems del presupuesto de origen, y un % fuera de 21 / 10,5 que no esté en el presupuesto sigue dando 422

#### Scenario: Cambia el producto después de cotizar
- **GIVEN** un presupuesto con un ítem al 21% que vino de un producto
- **WHEN** ese producto pasa a 10,5%
- **THEN** el ítem del presupuesto sigue al 21% y sus totales no cambian

### Requirement: Alícuota inicial según el origen del ítem
Al cargar un ítem en el formulario, el frontend SHALL proponer la alícuota según su origen, y el usuario SHALL poder cambiarla por línea con un select (21% · 10,5% · Sin IVA). Si la línea tiene guardado otro %, el select SHALL mostrarlo como opción extra "(anterior)".

#### Scenario: Ítem elegido de un producto
- **GIVEN** un producto con `iva_rate` = 10.5
- **WHEN** el usuario lo elige en el buscador de ítems
- **THEN** la línea toma el precio neto del producto y la alícuota 10,5%

#### Scenario: Ítem elegido de un servicio
- **WHEN** el usuario elige un servicio en el buscador
- **THEN** la línea toma el precio del servicio y queda en "Sin IVA"

#### Scenario: Ítem de texto libre
- **WHEN** el usuario escribe una descripción sin elegir de la lista
- **THEN** la línea queda al 21%

#### Scenario: Cambio manual de la alícuota
- **GIVEN** una línea al 21%
- **WHEN** el usuario elige "Sin IVA" en esa línea
- **THEN** la vista previa de totales se recalcula sin IVA para esa línea

#### Scenario: Línea con % anterior
- **GIVEN** una línea guardada con `iva_rate` = 15
- **WHEN** el usuario abre el formulario
- **THEN** el select muestra "15% (anterior)" seleccionado

### Requirement: Totales con IVA discriminado calculados por el backend
Al guardar un presupuesto el backend SHALL calcular y persistir:
- `subtotal_net`: suma de los importes netos de los ítems con alícuota.
- `total_iva`: suma, por alícuota, de `round(base × alícuota / 100, 2)`.
- `total_list` (total efectivo/débito): `subtotal_net + total_iva + importes de ítems sin IVA`.
- `total_card`: `round(total_list × (1 + recargo / 100), 2)`.

La respuesta del presupuesto con ítems SHALL incluir `iva_breakdown` (base e importe por alícuota) y `exempt_total`.

#### Scenario: Presupuesto mixto
- **GIVEN** un ítem de 2 × $10.000 al 21%, un ítem de 1 × $4.000 al 10,5% y un ítem de 1 × $15.000 sin IVA, con recargo de tarjeta 10%
- **WHEN** se guarda el presupuesto
- **THEN** `subtotal_net` = 24000, `total_iva` = 4620 (4200 + 420), `exempt_total` = 15000, `total_list` = 43620 y `total_card` = 47982

#### Scenario: Desglose por alícuota
- **GIVEN** el presupuesto del escenario anterior
- **WHEN** se consulta `GET /api/v1/budgets/:id`
- **THEN** `iva_breakdown` contiene `{ rate: "21.0", base: "20000.0", amount: "4200.0" }` y `{ rate: "10.5", base: "4000.0", amount: "420.0" }`

#### Scenario: Recargo sobre el total con IVA
- **GIVEN** un ítem de 1 × $100 al 21% y recargo 10%
- **WHEN** se guarda
- **THEN** `total_list` = 121 y `total_card` = 133.1

#### Scenario: Vista previa en el formulario
- **GIVEN** el usuario carga ítems en el formulario
- **WHEN** cambia una cantidad, un precio o una alícuota
- **THEN** la barra de totales muestra al instante los mismos valores que calcularía el backend

### Requirement: Presupuestos existentes sin cambios
Los presupuestos creados antes de este cambio MUST conservar sus totales: sus ítems quedan sin alícuota.

#### Scenario: Presupuesto viejo después de migrar
- **GIVEN** un presupuesto existente con `total_list` = 50000
- **WHEN** se ejecutan las migraciones y se vuelve a guardar sin cambios
- **THEN** `total_list` sigue en 50000 y `total_iva` = 0

### Requirement: Impresión con desglose de IVA
La hoja de impresión SHALL mostrar por línea cantidad, descripción, precio unitario final (con IVA y ganancia) e importe final, sin columna de alícuota. En el pie SHALL mostrar el IVA de cada alícuota usada (sin base), total efectivo/débito y total tarjeta. MUST NOT mostrar subtotal neto, subtotal con IVA, importe sin IVA ni ganancia. Los % con decimales MUST mostrarse con coma.

#### Scenario: Presupuesto con IVA
- **GIVEN** un ítem de 2 × $10.000 al 21%, un ítem de 1 × $4.000 al 10,5% y un ítem de 1 × $15.000 sin IVA, sin ganancia, con recargo de tarjeta 10%
- **WHEN** el usuario abre la impresión
- **THEN** el pie muestra IVA 21% $4.200, IVA 10,5% $420, Efectivo/Débito $43.620 y Tarjeta $47.982, y no muestra "Subtotal neto"

#### Scenario: Presupuesto viejo
- **GIVEN** un presupuesto con todos los ítems sin alícuota
- **WHEN** el usuario abre la impresión
- **THEN** el pie muestra solo los totales efectivo/débito y tarjeta, sin líneas de IVA

