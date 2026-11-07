## 1. Backend — configuración

- [x] 1.1 Spec de configuración (`spec/config/time_zone_spec.rb`): `Time.zone.name == "America/Argentina/Buenos_Aires"` y `ActiveRecord.default_timezone == :utc`. Verla fallar.
- [x] 1.2 Fijar `config.time_zone = "America/Argentina/Buenos_Aires"` en `config/application.rb` (reemplazar el comentario de ejemplo).

## 2. Backend — bot de WhatsApp

- [x] 2.1 Spec de `ToolRegistry::ScheduleAppointment`: `preferred_date: "2026-11-20 13:00"` se guarda como `2026-11-20 16:00 UTC` y la respuesta dice "20/11/2026 a las 13:00".
- [x] 2.2 Specs de `ToolRegistry::CheckAvailableSlots`:
  - con 09:00 a 18:00, lista los slots en hora local;
  - un turno en `2026-11-20T12:00:00Z` bloquea "09:00 a 12:00";
  - con `travel_to 2026-11-08 01:30 UTC`, "mañana" consulta el 08/11.
  Ajustar el código solo si alguna falla después de 1.2.

## 3. Backend — "hoy" y formatos

- [x] 3.1 Spec de `DashboardStatsService`: con `travel_to 2026-11-08 01:30 UTC`, un turno del 07/11 a las 10:00 hora argentina cuenta en `appointments_today`, y su `time` es "10:00".
- [x] 3.2 Spec del serializer de turnos (vista `formatted`): `scheduled_at` en `2026-11-20T16:00:00Z` da `formatted_date` igual a `"20/11/2026 13:00"`, y `scheduled_at` representa el mismo instante.

## 4. Backend — regresión

- [x] 4.1 Correr la suite completa. Ajustar solo las aserciones que asumían UTC (strings ISO con `Z`, horas fijas): compararlas como instantes, sin cambiar comportamiento.
- [x] 4.2 `bundle exec rubocop` y `bundle exec rspec` completos en verde (con `DATABASE_URL` de test: `make test-backend-local`).
