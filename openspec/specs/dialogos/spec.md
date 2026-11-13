# dialogos Specification

## Purpose
TBD - created by archiving change dialogos-unificados. Update Purpose after archive.
## Requirements
### Requirement: Pila única de diálogos
Todos los diálogos de la app (formularios, confirmaciones, informativos, acciones masivas, importación y visor de imágenes) SHALL construirse sobre el `Dialog` o el `ConfirmDialog` de `@ui` y compartir una única pila: el último abierto queda encima de los de abajo.

#### Scenario: Confirmación sobre un formulario
- **GIVEN** un formulario abierto en un diálogo
- **WHEN** se abre un `ConfirmDialog` encima
- **THEN** la confirmación se muestra por encima del formulario

#### Scenario: Escape con dos diálogos de distinto tipo
- **GIVEN** un `ConfirmDialog` abierto sobre otro diálogo
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
Con al menos un diálogo abierto, el contenido de la app y los diálogos que no están arriba NO SHALL recibir foco ni clicks; las notificaciones (toasts) y las listas desplegables del diálogo de arriba SHALL seguir usables.

#### Scenario: App no interactuable con diálogo abierto
- **GIVEN** un diálogo abierto
- **WHEN** el usuario hace click en un botón de la app detrás del diálogo
- **THEN** el botón no se activa, y al cerrar el último diálogo vuelve a responder

#### Scenario: Diálogo inferior no interactuable
- **GIVEN** dos diálogos apilados
- **WHEN** el usuario recorre con Tab
- **THEN** el foco nunca llega a un elemento del diálogo de abajo, y al cerrarse el de arriba vuelve a ser alcanzable

#### Scenario: Lista desplegable usable
- **GIVEN** el formulario de vehículo abierto con la lista de búsqueda de clientes desplegada
- **WHEN** el usuario hace click en un cliente
- **THEN** el cliente queda seleccionado

#### Scenario: Toast usable con diálogo abierto
- **GIVEN** un diálogo abierto y un toast visible
- **WHEN** el usuario pasa el mouse sobre el toast, hace click en él o lo descarta arrastrándolo (el toast no tiene botón de cerrar)
- **THEN** el toast queda por encima del diálogo, el hover pausa su cierre automático, al arrastrarlo se descarta, y el diálogo sigue abierto en todos los casos

### Requirement: Retorno de foco y scroll lock
Al abrir un diálogo el foco SHALL ir dentro del diálogo; al cerrarlo SHALL volver al elemento que lo tenía antes. El scroll del body SHALL bloquearse mientras haya algún diálogo abierto y restaurarse al cerrar el último.

#### Scenario: Retorno de foco tras confirmar
- **GIVEN** el usuario abrió un `ConfirmDialog` con el botón Eliminar de una fila
- **WHEN** cancela la confirmación
- **THEN** el foco vuelve al botón Eliminar

#### Scenario: Scroll lock
- **GIVEN** una página con scroll
- **WHEN** se abre un diálogo y después se cierra
- **THEN** mientras está abierto la página no scrollea, y al cerrarlo vuelve a scrollear

### Requirement: Click en el fondo según el tipo de diálogo
Los diálogos de confirmación e informativos (`ConfirmDialog`, `CustomerCreatedDialog`, visor de imágenes) SHALL cerrarse con click en el fondo. Los diálogos con datos cargados (formularios, cambio masivo de IVA, cambio masivo de precios, importación) NO SHALL cerrarse con click en el fondo.

#### Scenario: Confirmación cierra con click afuera
- **GIVEN** un `ConfirmDialog` abierto
- **WHEN** el usuario hace click en el fondo
- **THEN** la confirmación se cierra sin ejecutar la acción

#### Scenario: Cambio masivo de precios no cierra con click afuera
- **GIVEN** el diálogo de cambio masivo de precios con un porcentaje cargado
- **WHEN** el usuario hace click en el fondo
- **THEN** el diálogo sigue abierto con el valor cargado

