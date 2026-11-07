# formularios-dialogo Specification

## Purpose
TBD - created by archiving change form-dialog-centrado. Update Purpose after archive.
## Requirements
### Requirement: Formularios en modal centrado
Los formularios de alta y edición de cliente, vehículo, producto, servicio, proveedor y turno SHALL abrirse en un diálogo centrado en pantalla, con ancho máximo de ~768px (`max-w-3xl`), alto máximo de 90% del viewport, header y footer fijos y cuerpo con scroll solo cuando el contenido no entra.

#### Scenario: Abrir un formulario de alta
- **GIVEN** el usuario está en el listado de productos
- **WHEN** hace click en "Nuevo"
- **THEN** se abre un diálogo centrado con `role="dialog"` y `aria-modal="true"`, el título del formulario y los botones Cancelar y Guardar en el footer

#### Scenario: Formulario sin scroll en notebook
- **GIVEN** un viewport de 1440×900
- **WHEN** se abre el formulario de cliente, vehículo, servicio, proveedor o turno
- **THEN** todos los campos y el botón Guardar se ven sin scrollear el cuerpo del diálogo

#### Scenario: Contenido más alto que la pantalla
- **GIVEN** un formulario cuyo contenido supera el 90% del alto del viewport
- **WHEN** se abre el diálogo
- **THEN** solo el cuerpo scrollea y el header y el footer quedan visibles

### Requirement: Layout de 2 columnas
Los campos del formulario SHALL distribuirse en 2 columnas dentro del diálogo, y los campos de texto largo (notas, descripción, observaciones) SHALL ocupar el ancho completo.

#### Scenario: Textarea a ancho completo
- **GIVEN** el formulario de producto abierto
- **WHEN** se renderiza el campo de descripción
- **THEN** ocupa las 2 columnas

### Requirement: Footer con acciones alineadas a la derecha
El footer SHALL mostrar los botones Cancelar y Guardar con ancho natural, alineados a la derecha, con Guardar como acción principal y un estado "Guardando..." deshabilitado mientras se envía.

#### Scenario: Guardando
- **GIVEN** el diálogo con `isLoading` activo
- **WHEN** se renderiza el footer
- **THEN** el botón Guardar muestra "Guardando..." y ambos botones están deshabilitados

### Requirement: Cierre solo por acción explícita
El diálogo SHALL cerrarse únicamente con el botón ✕, el botón Cancelar o la tecla Escape. El click en el fondo NO SHALL cerrarlo.

#### Scenario: Click en el fondo
- **GIVEN** un formulario abierto con datos cargados
- **WHEN** el usuario hace click fuera del diálogo
- **THEN** el diálogo sigue abierto y conserva los datos

#### Scenario: Cerrar con Escape
- **GIVEN** un formulario abierto
- **WHEN** el usuario presiona Escape
- **THEN** el diálogo se cierra

#### Scenario: Escape con una lista desplegable abierta
- **GIVEN** un formulario abierto con la lista de búsqueda de clientes desplegada
- **WHEN** el usuario presiona Escape
- **THEN** se cierra solo la lista y el diálogo sigue abierto

#### Scenario: Cerrar con ✕ o Cancelar
- **GIVEN** un formulario abierto
- **WHEN** el usuario hace click en ✕ o en Cancelar
- **THEN** el diálogo se cierra

### Requirement: Diálogos apilados
Cuando un formulario abre otro formulario (alta de cliente desde el formulario de vehículo), el segundo diálogo SHALL mostrarse encima, más angosto y con un fondo más oscuro; Escape SHALL cerrar solo el diálogo de arriba.

#### Scenario: Alta de cliente desde vehículo
- **GIVEN** el formulario de nuevo vehículo abierto
- **WHEN** el usuario abre el alta rápida de cliente
- **THEN** aparece un segundo diálogo encima, más angosto que el de vehículo, con fondo más oscuro

#### Scenario: Escape con dos diálogos
- **GIVEN** el diálogo de cliente apilado sobre el de vehículo
- **WHEN** el usuario presiona Escape
- **THEN** se cierra solo el diálogo de cliente y el de vehículo sigue abierto

### Requirement: Foco y accesibilidad
Al abrir, el foco SHALL ir al diálogo (salvo que un campo lo tome con autofocus); al cerrar, SHALL volver al elemento que lo tenía antes. El diálogo SHALL estar etiquetado por su título y el scroll del body SHALL bloquearse mientras haya algún diálogo abierto.

#### Scenario: Retorno de foco
- **GIVEN** el usuario abrió el formulario con el botón "Nuevo"
- **WHEN** cierra el diálogo
- **THEN** el foco vuelve al botón "Nuevo"

#### Scenario: Etiqueta accesible
- **GIVEN** un diálogo con título "Nuevo cliente"
- **WHEN** se consulta su nombre accesible
- **THEN** es "Nuevo cliente"

