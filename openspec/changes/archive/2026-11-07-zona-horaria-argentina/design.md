## Context

- **Backend:** Rails 8.1 sin `config.time_zone`, así que `Time.zone` es UTC. Las columnas `datetime` se guardan en UTC, y eso no cambia.
- **El código ya es zone-aware:** usa `Time.current`, `Date.current`, `Time.zone.parse` y `all_day`. No hay `Time.now`, `Date.today` ni SQL con `DATE()`/`date_trunc`. Fijar la zona corrige casi todo el comportamiento sin tocar esos archivos.
- **Frontend:**
  - Manda `scheduled_at` con `toISOString()`, o sea como un instante UTC correcto.
  - Muestra las fechas con `new Date(...)` y `toLocaleString('es-AR')`, en la hora local del navegador.
  - Los turnos creados desde la web ya están bien. Los mal guardados son los que el backend arma a partir de un texto sin offset: los que agenda el bot y los slots que calcula a partir de `opening_hours`.
- **Datos en producción (2026-11-07):** 0 turnos y `opening_hours` vacío.

## Goals / Non-Goals

**Goals:**
- Que todo texto de fecha y hora sin offset que interpreta el backend se lea en hora de Argentina: lo que manda el bot y lo que sale de `opening_hours`.
- Que los límites de "hoy", "esta semana" y "este mes" sean los del día argentino.
- Que las horas que el backend formatea (`formatted_date`, dashboard, mensajes del bot) salgan en hora de Argentina.

**Non-Goals:**
- Zona horaria configurable o por usuario.
- Tocar el frontend.
- Migrar datos.

## Decisions

1. **Zona fija con `config.time_zone = "America/Argentina/Buenos_Aires"`** en `config/application.rb`. `active_record.default_timezone` queda en `:utc`.
   - *Alternativa descartada:* hacer `in_time_zone("America/Argentina/Buenos_Aires")` en cada punto. Es fácil olvidarse uno, y el código ya está escrito sobre `Time.zone`.
   - *Alternativa descartada:* zona por taller en `Setting`. Hay un solo taller, así que hoy es complejidad sin uso.
2. **Usar el identificador IANA `America/Argentina/Buenos_Aires`**, no el alias de Rails `"Buenos Aires"`. Así queda explícito y estable en logs y specs.
   - Argentina no tiene horario de verano desde 2009. El offset es −03:00 fijo, pero tzinfo lo maneja igual.
3. **Specs con la zona real, sin stubs.** Las specs de bordes usan `travel_to` con instantes en UTC que caen en otro día en Argentina, por ejemplo 2026-11-08 01:30Z, que en Argentina sigue siendo el 07 a las 22:30.
   - Además se agrega una spec de configuración que asegura `Time.zone.name`.
4. **Serialización de la API:** se acepta que Blueprinter emita `-03:00` en lugar de `Z`.
   - Es el mismo instante y JS lo parsea igual.
   - Las specs que comparan strings ISO pasan a comparar instantes (`Time.zone.parse(json[...])`) o a usar el formato nuevo.

## Risks / Trade-offs

- [Specs que asumían UTC (strings con `Z`, horas fijas)] → Correr la suite completa. Ajustar solo la aserción, no el comportamiento.
- [Integraciones externas que lean timestamps de la API (n8n, webhooks de Kapso)] → Reciben ISO 8601 con offset, que es estándar. El webhook de Kapso es solo entrante, así que no se ve afectado.
- [Turnos creados en desarrollo con el corrimiento] → Son datos de prueba y no se migran.
- [Solid Queue / jobs programados] → Los `recurring` de producción están vacíos. `perform_at` usa instantes, así que no depende de la zona.

## Migration Plan

1. Deploy normal, sin migraciones.
2. Después del deploy, verificar con `railway ssh` (solo lectura) que `Time.zone.name` sea `America/Argentina/Buenos_Aires`.
3. **Rollback:** revertir el commit. Como no se tocan datos, revertir no deja nada inconsistente.

## Open Questions

- Ninguna bloqueante. Si más adelante aparece un segundo taller en otra zona, se evalúa mover la zona a `Setting`.
