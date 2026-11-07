# Fix: spec de turnos disponibles dependiente de la zona horaria

## Lectura rápida
`check_available_slots_spec.rb:86` fallaba con la zona local −03 y pasaba en UTC/CI. El spec creaba los turnos con la zona del sistema; ahora usa `Time.zone`, igual que el servicio.

## Error
- Síntoma: con `TZ=America/Argentina/Buenos_Aires`, "when all slots are booked" devolvía 1 turno libre.
- Causa: `date.to_time.change(hour:)` usa la zona del **sistema operativo**; `CheckAvailableSlots#generate_slots` arma los slots con `Time.zone.parse` (UTC). Con −03 los turnos quedaban 3 h corridos (`backend/spec/services/tool_registry/check_available_slots_spec.rb:81`).
- Origen: `docs/PENDIENTES.md`

## Plan
- [x] Test que reproduce (el propio spec, con `TZ=-03`)
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (rails-reviewer: 0 bloqueantes; confirma que `filter_booked` no tiene el problema)
- [x] QA visual: N/A (solo backend, solo spec)

## Solución
Se cambió solo el spec, a `date.in_time_zone.change(hour:)`. **No** se fijó `config.time_zone` (lo que proponía el pendiente): cambiaría cómo se interpretan y muestran los horarios de turnos en producción, y eso no es un quick-fix.

## Verificación
- `TZ=America/Argentina/Buenos_Aires`: antes 1 falla de 7; después 7/7 ✅. También pasa en `UTC` y `Asia/Tokyo`.
- `rubocop` sobre el spec ✅
- Se corrió contra el Postgres de test en Docker (`:5435`), como hace el hook.

## Seguimiento
- Evaluar fijar `config.time_zone = "America/Argentina/Buenos_Aires"`: hoy la app corre en UTC y el horario de atención (`opening_hours`) se interpreta en UTC. Necesita un change propio (afecta turnos, recordatorios y el bot).
- ⚠️ `backend/.env` define `DATABASE_URL` → `lubricentro_development`, que también pisa la base de **test**. Correr `RAILS_ENV=test bundle exec rspec` a mano sin sobreescribir `DATABASE_URL` le pega a la base de desarrollo (el hook ya lo hace bien).
