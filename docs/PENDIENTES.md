# Pendientes

Backlog de mejoras detectadas y diferidas. Al tomar uno, movelo a un change de OpenSpec (o fix chico) y borralo de acá.

> Resueltos el 2026-11-06 con `/quick-fix`, ver `docs/fixes/2026-11-06-*.md`: H-06 a H-10, colSpan, tooltip de Turnos, hover de "Editar", flecha del tour, accesibilidad de modales y switches, "$ NaN", X del autocomplete, título de `/login`, "budgets" y spec de zona horaria. Los ítems **mobile** se descartaron porque la app es desktop-first.
>
> Resueltos el 2026-11-07: Ruby 4.0.9 + `load_defaults 8.1`. También se sacaron las contraseñas de `seeds.rb` y se agregó un guard de base de test (`docs/fixes/2026-11-07-seeds-y-base-de-test.md`).

## Backend

- [ ] Evaluar fijar `config.time_zone = "America/Argentina/Buenos_Aires"`: hoy la app corre en UTC y `opening_hours` se interpreta en UTC. Afecta turnos, recordatorios y el bot, así que va con un change propio.
- [ ] Quitar `DATABASE_URL` de `backend/.env` y usar `POSTGRES_*`. Hoy pisa la base de test: el guard de `rails_helper` aborta en vez de truncar dev, pero `bundle exec rspec` sigue necesitando override.

## Seguridad

- [ ] Rotar en producción las contraseñas de los dos usuarios que estaban en `seeds.rb`. Siguen vigentes (verificado el 2026-11-07) y quedaron en el historial de git.
