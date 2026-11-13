## ADDED Requirements

### Requirement: Autocomplete de búsqueda remota
Los buscadores de clientes y de productos SHALL usar un único autocomplete (`@ui/Autocomplete`, sobre Base UI):
- SHALL buscar en el backend con el texto tipeado (debounce de 300 ms).
- SHALL mostrar "Buscando..." mientras carga y un mensaje cuando no hay resultados.
- SHALL permitir moverse con ↑ y ↓, elegir con Enter y cerrar la lista con Escape.
- SHALL ofrecer un botón para limpiar el texto y la selección.
- El campo MUST desactivar el autocompletado del navegador (`autoComplete="off"`).

#### Scenario: Elegir un cliente con el teclado
- **GIVEN** el formulario de turno y el buscador de clientes con 2 resultados para "Ana"
- **WHEN** el usuario presiona ↓ dos veces y Enter
- **THEN** queda elegido el segundo cliente, el campo muestra "<nombre> - <contacto>" y se cierra la lista

#### Scenario: Elegir un producto con el teclado
- **GIVEN** el diálogo de actualización masiva de precios y el buscador de productos con resultados para "aceite"
- **WHEN** el usuario presiona ↓ y Enter
- **THEN** el campo muestra el nombre del primer producto y se cierra la lista

#### Scenario: Sin resultados
- **GIVEN** el buscador de clientes
- **WHEN** el usuario escribe un texto sin coincidencias y termina la búsqueda
- **THEN** la lista muestra "No se encontraron clientes"

#### Scenario: Limpiar la selección
- **GIVEN** un cliente elegido en el buscador
- **WHEN** el usuario toca "Limpiar selección"
- **THEN** el campo queda vacío y el formulario recibe el cliente vacío (`''` / `null`)

#### Scenario: Escape dentro de un diálogo
- **GIVEN** el formulario de vehículo con la lista del buscador de clientes desplegada
- **WHEN** el usuario presiona Escape
- **THEN** se cierra solo la lista y el formulario sigue abierto

### Requirement: Crear cliente desde el autocomplete
Cuando el consumidor lo habilite, el buscador de clientes SHALL mostrar al final de la lista la opción "+ Crear cliente" con el texto buscado. La opción SHALL poder elegirse con el mouse o con el teclado (↓ hasta la opción y Enter).

#### Scenario: Crear cliente con el teclado
- **GIVEN** el formulario de vehículo, el buscador con el texto "Carlos Ruiz" y sin resultados
- **WHEN** el usuario presiona ↓ y Enter
- **THEN** se abre el alta de cliente con "Carlos Ruiz" precargado y el formulario de vehículo sigue abierto
