## ADDED Requirements

### Requirement: Alícuota de IVA por producto
Cada producto SHALL tener una alícuota de IVA (`iva_rate`) con valor 21 o 10,5. El valor por defecto MUST ser 21. El precio unitario (`unit_price`) SHALL seguir representando el precio **sin IVA**.

#### Scenario: Producto nuevo sin alícuota indicada
- **GIVEN** un usuario autenticado
- **WHEN** crea un producto sin enviar `iva_rate`
- **THEN** el producto se guarda con `iva_rate` = 21

#### Scenario: Producto al 10,5%
- **GIVEN** un usuario autenticado
- **WHEN** crea o edita un producto con `iva_rate` = 10.5
- **THEN** el producto se guarda con `iva_rate` = 10.5

#### Scenario: Alícuota inválida
- **GIVEN** un usuario autenticado
- **WHEN** envía un producto con `iva_rate` = 15
- **THEN** la API responde 422 con `success: false` y un error sobre la alícuota

#### Scenario: Productos existentes al migrar
- **GIVEN** productos creados antes de este cambio
- **WHEN** se ejecuta la migración
- **THEN** todos quedan con `iva_rate` = 21 y su `unit_price` no cambia

### Requirement: Precio con IVA en la respuesta de productos
La API de productos SHALL devolver `iva_rate` y `unit_price_with_iva` = `round(unit_price × (1 + iva_rate / 100), 2)`.

#### Scenario: Producto al 21%
- **GIVEN** un producto con `unit_price` = 10000 e `iva_rate` = 21
- **WHEN** se consulta `GET /api/v1/products/:id`
- **THEN** la respuesta incluye `iva_rate` = "21.0" y `unit_price_with_iva` = "12100.0"

#### Scenario: Producto al 10,5%
- **GIVEN** un producto con `unit_price` = 10000 e `iva_rate` = 10.5
- **WHEN** se consulta el producto
- **THEN** `unit_price_with_iva` = "11050.0"

### Requirement: Edición masiva de alícuota
El sistema SHALL permitir cambiar la alícuota de varios productos a la vez mediante `POST /api/v1/products/bulk_iva_update`, seleccionándolos por `product_ids` o por los filtros del listado. No MUST modificar ningún otro atributo.

#### Scenario: Cambio por selección
- **GIVEN** tres productos al 21%
- **WHEN** se envía `bulk_iva_update` con dos `product_ids` e `iva_rate` = 10.5
- **THEN** esos dos quedan al 10,5%, el tercero sigue al 21% y la respuesta incluye `updated` = 2

#### Scenario: Cambio por filtros
- **GIVEN** productos de dos proveedores
- **WHEN** se envía `bulk_iva_update` con `supplier_id` de uno de ellos e `iva_rate` = 10.5
- **THEN** solo cambian los productos de ese proveedor

#### Scenario: Alícuota inválida en la edición masiva
- **WHEN** se envía `bulk_iva_update` con `iva_rate` = 27
- **THEN** la API responde 422 y ningún producto cambia

#### Scenario: Sin productos que coincidan
- **WHEN** se envía `bulk_iva_update` con filtros que no coinciden con ningún producto
- **THEN** la API responde 422 con `success: false`

#### Scenario: Acción desde la tabla de productos
- **GIVEN** el usuario seleccionó productos en la tabla
- **WHEN** toca "Cambiar IVA", elige 10,5% y confirma
- **THEN** ve un aviso con la cantidad actualizada y la tabla muestra la nueva alícuota

### Requirement: Columna IVA en el importador
El importador de productos SHALL aceptar una columna opcional `iva` (posición 9) con valores 21 o 10,5 en formatos `21`, `21%`, `10,5`, `10.5` o `10,5%`.

#### Scenario: Fila con IVA 10,5
- **WHEN** se importa una fila con `iva` = "10,5%"
- **THEN** el producto queda con `iva_rate` = 10.5

#### Scenario: Producto nuevo sin columna IVA
- **WHEN** se importa una fila de un producto nuevo con `iva` vacío
- **THEN** el producto queda con `iva_rate` = 21

#### Scenario: Producto existente sin columna IVA
- **GIVEN** un producto existente con `iva_rate` = 10.5
- **WHEN** se importa una fila de ese producto con `iva` vacío
- **THEN** el producto conserva `iva_rate` = 10.5

#### Scenario: Valor de IVA inválido
- **WHEN** se importa una fila con `iva` = "abc"
- **THEN** esa fila se reporta como error y no se modifica el producto

### Requirement: Precio con IVA visible en el frontend
La tabla de productos SHALL mostrar la alícuota y el precio con IVA junto al precio neto. El formulario de producto SHALL permitir elegir la alícuota (21% o 10,5%).

#### Scenario: Tabla de productos
- **GIVEN** un producto con `unit_price` = 10000 e `iva_rate` = 21
- **WHEN** el usuario abre la página de productos
- **THEN** la fila muestra "$10.000", "21%" y "$12.100"

#### Scenario: Formulario de producto
- **WHEN** el usuario edita un producto y elige 10,5%
- **THEN** al guardar el producto queda con `iva_rate` = 10.5
