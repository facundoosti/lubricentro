# dialogos Specification

## Purpose
TBD - created by archiving change dialogos-unificados. Update Purpose after archive.
## Requirements
### Requirement: Pila única de diálogos
Todos los diálogos de la app (formularios, confirmaciones, informativos, acciones masivas, importación y visor de imágenes) SHALL compartir una única pila: el último abierto queda encima con mayor z-index que los de abajo.

#### Scenario: Confirmación sobre un formulario
- **GIVEN** un formulario abierto en un diálogo
- **WHEN** se abre un `ConfirmModal` encima
- **THEN** la confirmación se muestra por encima del formulario

#### Scenario: Escape con dos diálogos de distinto tipo
- **GIVEN** un `ConfirmModal` abierto sobre otro diálogo
- **WHEN** el usuario presiona Escape
- **THEN** se cierra solo la confirmación y el diálogo de abajo sigue abierto

### Requirement: Escape respeta a los hijos
Escape SHALL cerrar solo el diálogo de arriba de la pila y NO SHALL cerrarlo si un elemento hijo ya atendió la tecla (`defaultPrevented`) o si el diálogo deshabilita el cierre por Escape.

#### Scenario: Importación en curso
- **GIVEN** el diálogo de importación de productos subiendo un archivo
- **WHEN** el usuario presiona Escape
- **THEN** el diálogo sigue abierto

### Requirement: Trampa de foco
Mientras un diálogo está arriba de la pila, Tab y Shift+Tab SHALL ciclar solo entre los elementos enfocables de ese diálogo.

#### Scenario: Tab desde el último elemento
- **GIVEN** un diálogo abierto con el foco en su último elemento enfocable
- **WHEN** el usuario presiona Tab
- **THEN** el foco pasa al primer elemento enfocable del mismo diálogo

#### Scenario: Shift+Tab desde el primer elemento
- **GIVEN** un diálogo abierto con el foco en su primer elemento enfocable
- **WHEN** el usuario presiona Shift+Tab
- **THEN** el foco pasa al último elemento enfocable del mismo diálogo

### Requirement: Contenido de fondo inerte
Con al menos un diálogo abierto, el contenido de la app y los diálogos que no están arriba SHALL marcarse `inert`; las notificaciones (toasts) y las listas desplegables del diálogo de arriba NO SHALL quedar inertes.

#### Scenario: App inerte con diálogo abierto
- **GIVEN** un diálogo abierto
- **WHEN** se inspecciona el contenedor de la app
- **THEN** tiene el atributo `inert`, y al cerrar el último diálogo se quita

#### Scenario: Diálogo inferior inerte
- **GIVEN** dos diálogos apilados
- **WHEN** se inspecciona el diálogo de abajo
- **THEN** tiene `inert`, y al cerrarse el de arriba deja de tenerlo

#### Scenario: Lista desplegable usable
- **GIVEN** el formulario de vehículo abierto con la lista de búsqueda de clientes desplegada
- **WHEN** el usuario hace click en un cliente
- **THEN** el cliente queda seleccionado

### Requirement: Retorno de foco y scroll lock
Al abrir un diálogo el foco SHALL ir dentro del diálogo; al cerrarlo SHALL volver al elemento que lo tenía antes. El scroll del body SHALL bloquearse mientras haya algún diálogo abierto y restaurarse a su valor previo al cerrar el último.

#### Scenario: Retorno de foco tras confirmar
- **GIVEN** el usuario abrió un `ConfirmModal` con el botón Eliminar de una fila
- **WHEN** cancela la confirmación
- **THEN** el foco vuelve al botón Eliminar

### Requirement: Click en el fondo según el tipo de diálogo
Los diálogos de confirmación e informativos (`ConfirmModal`, `CustomerCreatedDialog`, visor de imágenes) SHALL cerrarse con click en el fondo. Los diálogos con datos cargados (formularios, cambio masivo de IVA, cambio masivo de precios, importación) NO SHALL cerrarse con click en el fondo.

#### Scenario: Confirmación cierra con click afuera
- **GIVEN** un `ConfirmModal` abierto
- **WHEN** el usuario hace click en el fondo
- **THEN** la confirmación se cierra sin ejecutar la acción

#### Scenario: Cambio masivo de precios no cierra con click afuera
- **GIVEN** el diálogo de cambio masivo de precios con un porcentaje cargado
- **WHEN** el usuario hace click en el fondo
- **THEN** el diálogo sigue abierto con el valor cargado

