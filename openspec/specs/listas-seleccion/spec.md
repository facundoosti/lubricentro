# listas-seleccion Specification

## Purpose
TBD - created by archiving change shadcn-base-ui-fase-1. Update Purpose after archive.
## Requirements
### Requirement: Combobox único simple y múltiple
La app SHALL tener un único componente `Combobox` en `@ui` para elegir una o varias opciones con búsqueda. Con `multiple` SHALL permitir elegir varias opciones y mostrarlas como chips; sin `multiple` SHALL permitir elegir una sola. `SingleSelectSearch`, `MultiSelectSearch` y `SearchableSelect` NO SHALL existir.

#### Scenario: Selección simple
- **GIVEN** el formulario de producto con el Combobox de categoría
- **WHEN** el usuario escribe "Filt" y elige "Filtros"
- **THEN** `onChange` recibe el valor de "Filtros" y el input muestra "Filtros"

#### Scenario: Selección múltiple
- **GIVEN** el filtro de marcas del listado de productos
- **WHEN** el usuario elige "Shell" y "YPF"
- **THEN** `onChange` recibe ambos valores y se ven dos chips

#### Scenario: Quitar un chip
- **GIVEN** el filtro de marcas con "Shell" y "YPF" elegidos
- **WHEN** el usuario quita el chip "Shell"
- **THEN** `onChange` recibe solo el valor de "YPF"

### Requirement: Búsqueda remota
Cuando el Combobox recibe `onSearch`, SHALL llamarlo con el texto tipeado y NO SHALL filtrar las opciones localmente; mientras `loading` es verdadero SHALL mostrar un indicador de carga.

#### Scenario: Llama a onSearch
- **GIVEN** un Combobox con `onSearch`
- **WHEN** el usuario escribe "acei"
- **THEN** `onSearch` se llama con "acei"

#### Scenario: Cargando
- **GIVEN** un Combobox abierto con `loading` activo
- **WHEN** se renderiza la lista
- **THEN** se muestra un indicador de carga accesible ("Cargando…")

#### Scenario: Sin resultados
- **GIVEN** un Combobox abierto sin opciones y sin `loading`
- **WHEN** se renderiza la lista
- **THEN** se muestra "Sin resultados"

### Requirement: Limpiar selección
Con `clearable` activo y un valor elegido, el Combobox SHALL mostrar un botón para limpiar con nombre accesible "Limpiar"; al usarlo `onChange` SHALL recibir `null` (simple) o `[]` (múltiple).

#### Scenario: Limpiar en simple
- **GIVEN** un Combobox simple con "Filtros" elegido y `clearable`
- **WHEN** el usuario hace click en "Limpiar"
- **THEN** `onChange` recibe `null`

### Requirement: Select sin búsqueda
La app SHALL tener un componente `Select` en `@ui` para listas cortas sin búsqueda, usable con teclado (flechas, Enter, Escape) y etiquetable con `aria-labelledby`. **Todas** las listas cortas sin búsqueda de la app SHALL usarlo (formularios de turno, producto, vehículo, atención y presupuesto, IVA, estado de presupuesto, filtros de productos y recordatorios, cambio masivo de precios); no SHALL quedar `<select>` nativos en `features/`, `pages/` ni `layout/`. Su lista desplegada SHALL respetar el tema claro/oscuro.

#### Scenario: Elegir hora con teclado
- **GIVEN** el formulario de turno con el Select de hora enfocado
- **WHEN** el usuario presiona Enter, baja con la flecha y presiona Enter
- **THEN** queda elegida la segunda hora de la lista

#### Scenario: Etiqueta accesible
- **GIVEN** el Select de estado con `aria-labelledby="appointment-status-label"`
- **WHEN** se consulta su nombre accesible
- **THEN** es el texto de la etiqueta "Estado"

#### Scenario: Valor inicial en un formulario de edición
- **GIVEN** un vehículo existente con un valor elegido en su Select
- **WHEN** se abre su formulario de edición
- **THEN** el Select muestra la opción guardada y al enviar sin cambios el payload lleva el mismo valor

#### Scenario: Filtro "Todos"
- **GIVEN** Recordatorios filtrado por estado "Enviado"
- **WHEN** el usuario elige "Todos los estados" y aplica el filtro
- **THEN** el pedido de recordatorios no lleva el parámetro `status`

### Requirement: Listas dentro de diálogos
Cuando una lista (Combobox, Select o autocomplete de clientes/productos) está desplegada dentro de un diálogo, Escape SHALL cerrar solo la lista y el diálogo SHALL seguir abierto; la lista SHALL mostrarse por encima del diálogo y aceptar clicks.

#### Scenario: Escape con Combobox abierto en un formulario
- **GIVEN** el formulario de producto con el Combobox de categoría desplegado
- **WHEN** el usuario presiona Escape
- **THEN** se cierra la lista y el formulario sigue abierto

#### Scenario: Escape con Select abierto en un formulario
- **GIVEN** el formulario de turno con el Select de estado desplegado
- **WHEN** el usuario presiona Escape
- **THEN** se cierra la lista y el formulario sigue abierto

#### Scenario: Click en una opción dentro de un diálogo apilado
- **GIVEN** el alta de cliente apilada sobre el formulario de vehículo, con una lista desplegada
- **WHEN** el usuario hace click en una opción
- **THEN** la opción queda elegida y ambos diálogos siguen abiertos

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
