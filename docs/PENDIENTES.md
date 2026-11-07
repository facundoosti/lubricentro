# Pendientes

Backlog de mejoras detectadas y diferidas. Al tomar uno, movelo a un change de OpenSpec (o fix chico) y borralo de acá.

> Resueltos el 2026-11-06 con `/quick-fix`, ver `docs/fixes/2026-11-06-*.md`: H-06 a H-10, colSpan, tooltip de Turnos, hover de "Editar", flecha del tour, accesibilidad de modales y switches, "$ NaN", X del autocomplete, título de `/login`, "budgets" y spec de zona horaria. Los ítems **mobile** se descartaron porque la app es desktop-first.

## Backend

- [ ] Evaluar `config.load_defaults 8.1` tras el upgrade a Rails 8.1 (hoy sigue en 8.0).
- [ ] Evaluar fijar `config.time_zone = "America/Argentina/Buenos_Aires"`: hoy la app corre en UTC y `opening_hours` se interpreta en UTC. Afecta turnos, recordatorios y el bot, así que va con un change propio.
- [ ] `backend/.env` define `DATABASE_URL` hacia `lubricentro_development`, y en `RAILS_ENV=test` también pisa la base de test. Correr rspec a mano sin sobreescribir `DATABASE_URL` le pega a la base de dev. Usar `DATABASE_URL` solo en dev o pasar a `POSTGRES_*`.

## Seguridad

- [ ] `backend/db/seeds.rb` versiona contraseñas en texto plano de usuarios reales (admin incluido). Moverlas a variables de entorno y rotarlas si se usan en producción.
