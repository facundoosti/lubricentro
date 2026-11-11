## MODIFIED Requirements

### Requirement: Alícuota guardada en cada ítem del presupuesto
Cada ítem de presupuesto SHALL guardar su propio % de IVA (`iva_rate`): cualquier valor mayor o igual a 0 y menor a 100, con hasta 2 decimales, o vacío (= sin IVA, precio final). Un `iva_rate` de 0 MUST guardarse como vacío. La alícuota del ítem MUST NOT cambiar si después cambia la alícuota del producto de origen. Las alícuotas del catálogo de productos siguen siendo 21 o 10,5.

#### Scenario: Ítem con alícuota válida
- **WHEN** se guarda un presupuesto con un ítem de `iva_rate` = 10.5
- **THEN** el ítem queda con `iva_rate` = 10.5

#### Scenario: Ítem con % libre
- **WHEN** se guarda un ítem con `iva_rate` = 15
- **THEN** el ítem queda con `iva_rate` = 15 y su importe con IVA es cantidad × unitario × 1,15

#### Scenario: Ítem sin alícuota
- **WHEN** se guarda un ítem sin `iva_rate`
- **THEN** el ítem queda con `iva_rate` nulo y se trata como sin IVA

#### Scenario: Ítem con 0%
- **WHEN** se guarda un ítem con `iva_rate` = 0
- **THEN** el ítem queda con `iva_rate` nulo y se trata como sin IVA

#### Scenario: Alícuota inválida en un ítem
- **WHEN** se guarda un ítem con `iva_rate` = 100 o con `iva_rate` = -1
- **THEN** la API responde 422 y el presupuesto no se guarda

#### Scenario: Cambia el producto después de cotizar
- **GIVEN** un presupuesto con un ítem al 21% que vino de un producto
- **WHEN** ese producto pasa a 10,5%
- **THEN** el ítem del presupuesto sigue al 21% y sus totales no cambian

### Requirement: Alícuota inicial según el origen del ítem
Al cargar un ítem en el formulario, el frontend SHALL proponer el % de IVA según su origen, y el usuario SHALL poder escribir cualquier % por línea en un campo numérico (vacío = sin IVA).

#### Scenario: Ítem elegido de un producto
- **GIVEN** un producto con `iva_rate` = 10.5
- **WHEN** el usuario lo elige en el buscador de ítems
- **THEN** la línea toma el precio neto del producto y el % 10,5

#### Scenario: Ítem elegido de un servicio
- **WHEN** el usuario elige un servicio en el buscador
- **THEN** la línea toma el precio del servicio y el % queda vacío (sin IVA)

#### Scenario: Ítem de texto libre
- **WHEN** el usuario escribe una descripción sin elegir de la lista
- **THEN** la línea queda al 21%

#### Scenario: Cambio manual del %
- **GIVEN** una línea de 1 × $1.000 al 21%
- **WHEN** el usuario escribe 30 en el % de esa línea
- **THEN** el importe de la línea pasa a $1.300 y la vista previa de totales se recalcula

#### Scenario: Borrar el %
- **GIVEN** una línea al 21%
- **WHEN** el usuario vacía el campo %
- **THEN** la línea se trata como sin IVA

### Requirement: Impresión con desglose de IVA
La hoja de impresión SHALL mostrar por línea el precio unitario sin IVA, el % de IVA y el importe con IVA (bruto), y en el pie: subtotal neto, IVA por cada % usado (con su base), subtotal con IVA, importe sin IVA, total efectivo/débito y total tarjeta. Los % con decimales MUST mostrarse con coma (ej. "15,75%"). Las líneas del pie con importe 0 MUST NOT mostrarse.

#### Scenario: Presupuesto con IVA
- **GIVEN** un ítem de 2 × $10.000 al 21%, un ítem de 1 × $4.000 al 10,5% y un ítem de 1 × $15.000 sin IVA, con recargo de tarjeta 10%
- **WHEN** el usuario abre la impresión
- **THEN** el pie muestra Subtotal neto $24.000, IVA 21% $4.200, IVA 10,5% $420, Sin IVA $15.000, Efectivo/Débito $43.620 y Tarjeta $47.982

#### Scenario: Presupuesto con % libre
- **GIVEN** un ítem de 1 × $1.000 al 15%
- **WHEN** el usuario abre la impresión
- **THEN** la línea muestra "15%" y el pie muestra "IVA 15%" por $150

#### Scenario: Presupuesto viejo
- **GIVEN** un presupuesto con todos los ítems sin alícuota
- **WHEN** el usuario abre la impresión
- **THEN** el pie muestra solo los totales efectivo/débito y tarjeta, sin líneas de IVA
