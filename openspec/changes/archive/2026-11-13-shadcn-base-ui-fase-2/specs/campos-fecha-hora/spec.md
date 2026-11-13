## ADDED Requirements

### Requirement: Fecha tipeable dd/mm/aaaa
La app SHALL cargar fechas con un `DateInput` de `@ui` que muestra y acepta `dd/mm/aaaa`, inserta las barras automáticamente, solo admite dígitos y entrega al formulario el valor en ISO `yyyy-MM-dd`. Ningún formulario ni filtro de `features/`, `pages/` o `layout/` SHALL usar `<input type="date">`.

#### Scenario: Tipear una fecha válida
- **GIVEN** el formulario de turno con el campo Fecha vacío
- **WHEN** el usuario tipea "13112026"
- **THEN** el campo muestra "13/11/2026" y el formulario recibe "2026-11-13"

#### Scenario: Pegar una fecha con barras
- **GIVEN** un `DateInput` vacío
- **WHEN** el usuario pega "05/03/2027"
- **THEN** el campo muestra "05/03/2027" y `onChange` recibe "2027-03-05"

#### Scenario: Letras ignoradas
- **GIVEN** un `DateInput` vacío
- **WHEN** el usuario tipea "1a3"
- **THEN** el campo muestra "13"

#### Scenario: Valor inicial al editar
- **GIVEN** una atención existente con fecha "2026-10-02"
- **WHEN** se abre su formulario de edición
- **THEN** el campo de fecha muestra "02/10/2026"

### Requirement: Fecha inválida o incompleta
Una fecha inexistente (ej. 31/02), incompleta o fuera de rango SHALL entregar al formulario un valor inválido distinguible del vacío (`INVALID_INPUT`) que bloquea el envío con "Fecha inválida" y, al salir del campo, SHALL marcarse como inválida (`aria-invalid="true"`) manteniendo el texto tipeado para corregirlo. Un `reset` del formulario SHALL limpiar ese texto y la marca.

#### Scenario: Fecha inexistente
- **GIVEN** un `DateInput` vacío
- **WHEN** el usuario tipea "31022026" y sale del campo
- **THEN** `onChange` recibe `INVALID_INPUT` y el input tiene `aria-invalid="true"` y sigue mostrando "31/02/2026"

#### Scenario: Requerida en el turno
- **GIVEN** el formulario de turno con el campo Fecha incompleto ("13/11")
- **WHEN** el usuario envía el formulario
- **THEN** se muestra "Fecha inválida" y no se envía

#### Scenario: Sin error a mitad de tipeo
- **GIVEN** el formulario de turno con una fecha cargada
- **WHEN** el usuario la selecciona y tipea encima "131120"
- **THEN** no aparece ningún error mientras tipea; al salir del campo se muestra "Fecha inválida"

#### Scenario: Fecha opcional inválida
- **GIVEN** el formulario de atención con "Próximo servicio" en "31/02/2027"
- **WHEN** el usuario guarda
- **THEN** se muestra "Fecha inválida" y no se envía

#### Scenario: Reset después de un texto inválido
- **GIVEN** un `DateInput` con "13/1" marcado como inválido
- **WHEN** el formulario se resetea a vacío
- **THEN** el campo queda vacío y sin `aria-invalid`

#### Scenario: Borrar la fecha
- **GIVEN** un `DateInput` con "13/11/2026"
- **WHEN** el usuario borra todo el texto
- **THEN** `onChange` recibe ""

### Requirement: Calendario en popover
El `DateInput` SHALL tener un botón con nombre accesible "Abrir calendario" que abre un calendario en español (semana desde lunes) en un popover, posicionado en el mes de la fecha elegida o en el actual. Elegir un día SHALL fijar la fecha, cerrar el popover y devolver el foco al input.

#### Scenario: Elegir un día
- **GIVEN** un `DateInput` con "13/11/2026"
- **WHEN** el usuario abre el calendario y hace click en el día 20
- **THEN** el campo muestra "20/11/2026", `onChange` recibe "2026-11-20" y el calendario se cierra

#### Scenario: Mes inicial
- **GIVEN** un `DateInput` con "02/10/2026"
- **WHEN** el usuario abre el calendario
- **THEN** se muestra octubre de 2026

#### Scenario: Calendario dentro de un diálogo
- **GIVEN** el formulario de turno (diálogo) con el calendario abierto
- **WHEN** el usuario presiona Escape
- **THEN** se cierra solo el calendario y el formulario sigue abierto

### Requirement: Hora tipeable hh:mm
La app SHALL cargar horas con un `TimeInput` de `@ui` que muestra y acepta `hh:mm` en 24 h, inserta los dos puntos automáticamente y entrega `HH:mm`; una hora incompleta o fuera de rango SHALL entregar `INVALID_INPUT` y marcarse inválida al salir. En Configuración, un día abierto SHALL exigir "desde" y "hasta" válidos para guardar. Ningún archivo de `features/`, `pages/` o `layout/` SHALL usar `<input type="time">`.

#### Scenario: Tipear una hora
- **GIVEN** el horario del lunes en Configuración
- **WHEN** el usuario tipea "0830" en "desde"
- **THEN** el campo muestra "08:30" y el horario guarda "08:30"

#### Scenario: Hora fuera de rango
- **GIVEN** un `TimeInput` vacío
- **WHEN** el usuario tipea "2575" y sale del campo
- **THEN** `onChange` recibe `INVALID_INPUT` y el input tiene `aria-invalid="true"`

#### Scenario: Horario vacío en un día abierto
- **GIVEN** el lunes abierto en Configuración
- **WHEN** el usuario borra "desde" y guarda
- **THEN** se muestra "Completá desde y hasta con una hora válida (hh:mm)" y no se guarda

### Requirement: Filtros de fecha sin cambios de contrato
Los filtros por fecha (Recordatorios desde/hasta) SHALL seguir enviando `start_date` y `end_date` en `yyyy-MM-dd`, o sin parámetro si están vacíos.

#### Scenario: Filtrar recordatorios por rango
- **GIVEN** la pantalla de Recordatorios
- **WHEN** el usuario tipea "01/11/2026" y "30/11/2026" y aplica el filtro
- **THEN** el pedido de recordatorios lleva `start_date=2026-11-01` y `end_date=2026-11-30`

#### Scenario: Filtro con fecha inválida
- **GIVEN** la pantalla de Recordatorios
- **WHEN** el usuario tipea "01/11" en Desde y aplica el filtro
- **THEN** no se hace un pedido nuevo, se avisa "Revisá las fechas" y el campo queda marcado inválido
