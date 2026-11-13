## ADDED Requirements

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
La app SHALL tener un componente `Select` en `@ui` para listas cortas sin búsqueda, usable con teclado (flechas, Enter, Escape) y etiquetable con `aria-labelledby`. El horario y el estado del formulario de turnos SHALL usarlo.

#### Scenario: Elegir hora con teclado
- **GIVEN** el formulario de turno con el Select de hora enfocado
- **WHEN** el usuario presiona Enter, baja con la flecha y presiona Enter
- **THEN** queda elegida la segunda hora de la lista

#### Scenario: Etiqueta accesible
- **GIVEN** el Select de estado con `aria-labelledby="appointment-status-label"`
- **WHEN** se consulta su nombre accesible
- **THEN** es el texto de la etiqueta "Estado"

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
