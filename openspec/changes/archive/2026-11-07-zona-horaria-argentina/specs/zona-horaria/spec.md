## ADDED Requirements

### Requirement: Zona horaria de la aplicación
El backend SHALL usar `America/Argentina/Buenos_Aires` como zona horaria de la aplicación. Los `datetime` MUST seguir guardándose en UTC en la base.

#### Scenario: Zona configurada
- **GIVEN** la aplicación ya arrancó
- **WHEN** se consulta `Time.zone`
- **THEN** su nombre es `America/Argentina/Buenos_Aires`
- **AND** `ActiveRecord.default_timezone` es `:utc`

### Requirement: El bot agenda turnos en hora argentina
`schedule_appointment` SHALL interpretar `preferred_date` (`YYYY-MM-DD HH:MM`, sin offset) como hora de Argentina. El mensaje de confirmación MUST mostrar esa misma hora.

#### Scenario: Turno pedido a las 13:00
- **GIVEN** un cliente con un único vehículo y la fecha actual anterior al turno
- **WHEN** el bot agenda con `preferred_date: "2026-11-20 13:00"`
- **THEN** el turno se guarda con `scheduled_at` igual a `2026-11-20 16:00 UTC`
- **AND** la respuesta dice "20/11/2026 a las 13:00"

### Requirement: Disponibilidad según el horario de atención local
`check_available_slots` SHALL generar los turnos libres a partir de `opening_hours` en hora de Argentina. MUST descartar los que se solapen con turnos existentes, sin importar desde dónde se crearon.

#### Scenario: Slots en hora local
- **GIVEN** `opening_hours` del día con `open: true`, `from: "09:00"` y `to: "18:00"`
- **WHEN** se consultan los turnos libres de ese día
- **THEN** la respuesta lista "09:00 a 12:00", "12:00 a 15:00" y "15:00 a 18:00"

#### Scenario: Turno cargado desde la web bloquea el slot local
- **GIVEN** el mismo horario de atención
- **AND** un turno con `scheduled_at` en `2026-11-20T12:00:00Z` (09:00 en Argentina), como lo manda el frontend
- **WHEN** se consultan los turnos libres del 2026-11-20
- **THEN** el slot "09:00 a 12:00" no aparece

### Requirement: "Hoy" es el día argentino
Las referencias a "hoy" del backend SHALL usar la fecha de Argentina. Eso incluye las palabras "hoy" y "mañana" del bot, los turnos de hoy del dashboard y la fecha por defecto de presupuestos y atenciones.

#### Scenario: De noche en Argentina sigue siendo hoy
- **GIVEN** el instante actual es `2026-11-08 01:30 UTC` (07/11 a las 22:30 en Argentina)
- **AND** existe un turno el 07/11 a las 10:00 hora argentina
- **WHEN** se piden las estadísticas del dashboard
- **THEN** `appointments_today` cuenta ese turno

#### Scenario: "mañana" para el bot
- **GIVEN** el instante actual es `2026-11-08 01:30 UTC`
- **WHEN** el bot consulta disponibilidad con `date: "mañana"`
- **THEN** consulta el día 08/11

### Requirement: Horas formateadas en hora argentina
Los textos de fecha y hora que arma el backend SHALL expresarse en hora de Argentina. Eso incluye `formatted_date` del serializer de turnos y `time` de los turnos de hoy en el dashboard. La API MUST seguir devolviendo los `datetime` como ISO 8601 con offset, representando el mismo instante.

#### Scenario: formatted_date local
- **GIVEN** un turno con `scheduled_at` en `2026-11-20T16:00:00Z`
- **WHEN** se serializa con la vista `formatted`
- **THEN** `formatted_date` es `"20/11/2026 13:00"`
- **AND** `scheduled_at` representa el instante `2026-11-20T16:00:00Z`
