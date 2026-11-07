## Why

El backend corre en UTC (`config.time_zone` sin definir), pero el taller trabaja en hora de Argentina (UTC−3). Por eso:

- **El bot de WhatsApp agenda turnos 3 horas corridos.** El cliente pide "13:00", el bot lo guarda como 13:00 UTC y la agenda lo muestra a las 10:00.
- **Los horarios de atención se leen en UTC.** `opening_hours` se interpreta en UTC, así que los turnos libres que ofrece el bot no coinciden con el horario real ni con los turnos cargados desde la web.
- **"Hoy" cambia de día a las 21:00.** `Date.current` pasa al día siguiente a esa hora y desfasa el dashboard, los vencimientos y la fecha por defecto de los presupuestos.

Hoy es el momento más barato para corregirlo: producción tiene 0 turnos y `opening_hours` vacío (medido el 2026-11-07), así que no hay datos que migrar.

## What Changes

- **Zona horaria de la app:** fijar `config.time_zone = "America/Argentina/Buenos_Aires"` en `config/application.rb`. La base sigue guardando en UTC (`default_timezone` queda en `:utc`).
- **Bot de WhatsApp:**
  - `schedule_appointment` y `check_available_slots` pasan a interpretar fecha y hora en hora argentina.
  - "hoy" y "mañana" se calculan con la fecha argentina.
- **Texto que genera el backend:** `formatted_date` del serializer de turnos, las horas del dashboard y los mensajes del bot pasan a mostrarse en hora argentina.
- **Rangos de fechas** ("hoy", "esta semana", "este mes", filtros por fecha): pasan a usar los límites del día argentino.
- **API:** los `datetime` se serializan con offset `-03:00` en lugar de `Z`. El instante es el mismo y el frontend ya los parsea con `new Date()`, así que no es breaking para el frontend.
- **Tests:** specs que fijen la zona y cubran los bordes (turno a las 22:00 en Argentina, que en UTC cae al día siguiente).

## Capabilities

### New Capabilities
- `zona-horaria`: la app interpreta y muestra fechas y horas en hora de Argentina. Cubre los turnos del bot, la disponibilidad, los límites de "hoy" y el formato de horas en las respuestas.

### Modified Capabilities
<!-- Ninguna: no hay specs existentes de turnos ni del bot en openspec/specs/. -->

## Impact

- **Apps:** solo backend. El frontend no se toca: ya envía instantes en UTC (`toISOString`) y muestra en la hora local del navegador.
- **Migraciones:** ninguna, ni de esquema ni de datos.
  - Producción tiene 0 turnos, así que no hay registros con el corrimiento.
  - Las columnas `date` (`next_service_date`, `service_date`, `date` de presupuestos) no dependen de la zona.
- **Código afectado:**
  - `config/application.rb`
  - `app/services/tool_registry/{check_available_slots,schedule_appointment}.rb`
  - `app/serializers/appointment_serializer.rb`
  - `app/services/dashboard_stats_service.rb`
  - Los scopes y controladores que usan `Date.current`. Hoy ya usan `Time.zone`/`Date.current`, así que heredan la zona sin cambios.
- **Specs:** pueden fallar las que comparen strings ISO con `Z` o asuman UTC.

## Fuera de alcance

- Zona horaria configurable por taller (desde Settings).
- Cambios en el frontend (fechas del calendario, `toLocaleString`).
- Programar recordatorios por hora (`config/recurring.yml` está vacío en producción).
- Cargar `opening_hours` en producción: lo hace el usuario desde Settings.
