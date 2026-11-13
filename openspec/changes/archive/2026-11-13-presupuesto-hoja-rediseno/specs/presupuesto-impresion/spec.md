## ADDED Requirements

### Requirement: Solo importe final por ítem
La tabla de ítems de la hoja impresa SHALL mostrar las columnas CANT, ARTÍCULO e IMPORTE, sin columna de precio unitario.

#### Scenario: Sin precio unitario
- **WHEN** se abre la hoja de un presupuesto con un ítem de cantidad 4
- **THEN** la tabla no tiene columna "P. UNIT."
- **AND** el importe del renglón es el total final de la línea

### Requirement: Código de producto en el artículo
La hoja SHALL mostrar el código del producto (`product_code`) delante de la descripción cuando el ítem lo tenga.

#### Scenario: Ítem con código
- **WHEN** un ítem tiene `product_code` "PH10044"
- **THEN** el renglón muestra "PH10044" junto a la descripción

#### Scenario: Ítem sin código
- **WHEN** un ítem no tiene `product_code`
- **THEN** el renglón muestra solo la descripción

### Requirement: Totales con etiquetas del talonario
La hoja SHALL mostrar los totales en un recuadro con las etiquetas "PRECIO D/LISTA – EFT/DEB" y "TARJETA D/CRED", ambas resaltadas.

#### Scenario: Totales
- **WHEN** se abre la hoja de un presupuesto
- **THEN** se ven `total_list` con la etiqueta "PRECIO D/LISTA – EFT/DEB" y `total_card` con "TARJETA D/CRED"

### Requirement: Cuotas en los totales
La hoja SHALL mostrar hasta 3 planes de cuotas activos, con el valor de cada cuota, debajo de los totales.

#### Scenario: Con planes activos
- **WHEN** hay un plan activo "VISA" de 3 cuotas con 10% de recargo y `total_list` es 120000
- **THEN** la hoja muestra "VISA 3 cuotas de $ 44.000"

#### Scenario: Sin planes
- **WHEN** no hay planes activos
- **THEN** no se muestran renglones de cuotas

### Requirement: Leyenda de no comprobante
La hoja SHALL mostrar siempre la leyenda "NO VÁLIDO COMO COMPROBANTE DE FACTURACIÓN".

#### Scenario: Leyenda visible
- **WHEN** se abre la hoja de cualquier presupuesto
- **THEN** se ve la leyenda "NO VÁLIDO COMO COMPROBANTE DE FACTURACIÓN"

### Requirement: Datos fiscales del cliente en la hoja
La hoja SHALL mostrar el CUIT y el tipo de factura del cliente debajo del nombre cuando tengan valor.

#### Scenario: Cliente con CUIT
- **WHEN** el cliente tiene CUIT "20-28456123-4" y tipo de factura "B"
- **THEN** la hoja muestra "CUIT: 20-28456123-4" y "FACT: B"

#### Scenario: Cliente sin datos fiscales
- **WHEN** el cliente no tiene CUIT ni tipo de factura
- **THEN** no se muestran esas etiquetas

### Requirement: Pie con contacto del lubricentro
El pie de la hoja SHALL mostrar el email y el Instagram del lubricentro, sin repetir la dirección ni el teléfono del encabezado.

#### Scenario: Con email e Instagram
- **WHEN** la configuración tiene el email "a@b.com" y el Instagram "killamet"
- **THEN** el pie muestra "a@b.com" y "@killamet"
- **AND** el pie no muestra la dirección ni el teléfono

#### Scenario: Sin contacto
- **WHEN** la configuración no tiene email ni Instagram
- **THEN** la hoja no muestra el pie

### Requirement: Estilo del talonario nuevo
La hoja SHALL usar el color de marca definido en una sola constante, un encabezado gris degradado, bordes redondeados, una tabla gris claro con renglones blancos, la marca de agua del logo y un ícono de ubicación junto a la dirección.

#### Scenario: Color de marca centralizado
- **WHEN** se cambia la constante del color de marca
- **THEN** la franja PRESUPUESTO, el encabezado de la tabla y el recuadro de totales cambian de color
