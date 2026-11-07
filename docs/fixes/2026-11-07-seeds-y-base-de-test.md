# Fix: contraseñas fuera de seeds.rb y guard de base de test

## Lectura rápida
`db/seeds.rb` versionaba contraseñas reales en texto plano, y RSpec podía correr contra la base de desarrollo. Ahora el seed toma las contraseñas de variables de entorno y `rails_helper` aborta si la base no es `*_test`.

## Error
- Síntoma 1: `db/seeds.rb` crea dos usuarios reales con contraseñas en texto plano. Se verificó en producción (solo lectura, `authenticate`) que las dos **siguen vigentes**.
- Síntoma 2: `RAILS_ENV=test bin/rails runner 'puts ActiveRecord::Base.connection_db_config.database'` imprime `lubricentro_development`.
- Causa 2: `backend/.env` define `DATABASE_URL` hacia la base de dev; dotenv la carga también en test y Rails la mezcla sobre `database.yml`.
- Origen: `docs/PENDIENTES.md`.

## Plan
- [x] Test que reproduce (`spec/db/seeds_spec.rb`; el guard se verificó a mano, ver Verificación)
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review
- [x] QA visual: N/A (solo backend)

## Solución
- `db/seeds.rb`: los usuarios iniciales usan `SEED_ADMIN_PASSWORD` / `SEED_OWNER_PASSWORD`. Si falta la variable, el usuario no se crea y se avisa.
- `spec/rails_helper.rb`: si la base configurada no termina en `_test`, aborta antes de cargar `rspec/rails` (o sea, antes de que DatabaseCleaner trunque nada).
- `backend/.env.example` (no versionado) documenta las variables nuevas.

## Verificación
- `RAILS_ENV=test bundle exec rspec spec/models/user_spec.rb` sin override: aborta con el mensaje del guard.
- Con `DATABASE_URL` de test: suite completa con 956 ejemplos y 0 fallos. RuboCop no marca nada.

## Seguimiento
- **Rotar las dos contraseñas en producción**: estuvieron en el historial de git.
- Quitar `DATABASE_URL` de `backend/.env` (usar `POSTGRES_*`) para que `bundle exec rspec` funcione sin override.
