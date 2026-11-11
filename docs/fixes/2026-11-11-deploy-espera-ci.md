# Fix: el deploy espera la CI y la factory de productos genera nombres únicos

## Lectura rápida
El commit `6b7817c` se desplegó a producción aunque la Backend CI falló. Railway desplegaba en cada push sin esperar la CI ("Wait for CI" apagado). Además, un test fallaba al azar porque la factory de productos repetía nombres.

## Error
- Síntoma 1: Backend CI falló en `6b7817c` (`products_spec.rb:432`, `Name has already been taken`) y el backend igual quedó desplegado y migrado.
- Causa 1: los servicios `backend`, `frontend` y `cron` de Railway están conectados al repo con `source.checkSuites: false`, así que despliegan en cada push a `main` sin esperar la CI. `.github/workflows/deploy.yml` sí salteaba el backend si la CI fallaba, pero no frenaba a Railway. Además, el frontend se desplegaba 2 veces (Railway + `railway up` del workflow).
- Síntoma 2: test intermitente en CI.
- Causa 2: `name { Faker::Commerce.product_name }` (`backend/spec/factories/products.rb:37`) repite nombres (22 repetidos en 500), y `products.name` es único.
- Origen: revisión post-deploy del fix `2026-11-11-nombre-producto-500.md`.

## Plan
- [x] Test que reproduce (`spec/models/product_factory_spec.rb`: 500 nombres, falló con 478 únicos). El deploy no se puede testear con RSpec: se verifica con la configuración de Railway (`checkSuites`).
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (rails-reviewer, sin bloqueantes)
- [x] QA visual: N/A, no hay cambios de UI
- [ ] Activar "Wait for CI" en Railway (backend, frontend, cron). Lo hace el usuario desde el dashboard, porque el MCP de Railway no expone `checkSuites`.

## Solución
- Factory: `sequence(:name) { |n| "#{Faker::Commerce.product_name} #{n}" }`.
- Se borra `.github/workflows/deploy.yml`. Railway queda como único mecanismo de deploy y, con "Wait for CI", despliega solo si pasan las GitHub Actions del commit.
- `docs/DEPLOY_RAILWAY.md` §6 y `CLAUDE.md` actualizados.

## Verificación
- `rspec spec/models/product_factory_spec.rb spec/requests/api/v1/products_spec.rb`: 57 ejemplos, 0 fallas, 3 corridas seguidas.
- RuboCop sin ofensas.
- Railway (`get-service-config`): antes, `checkSuites: false` en los 3 servicios.
- Review (rails-reviewer): sin bloqueantes. Ningún spec depende del nombre exacto de la factory.

## Seguimiento
- Otras factories con riesgo de colisión: `services.rb:21` (`Faker::Commerce.unique` sin `clear`, con índice único), `vehicles.rb:28` (patente aleatoria con índice único), trait `cuit` de `suppliers.rb:33`; `users`/`customers` con `Faker::Internet.unique.email` (riesgo muy bajo).
- Backend CI y Frontend CI tienen filtro `paths`. Un commit que toca solo un lado corre una sola CI y Railway espera solo esa. Un commit solo de docs no corre ninguna CI.
- Los secrets `RAILWAY_TOKEN`, `RAILWAY_SERVICE_BACKEND` y `RAILWAY_SERVICE_FRONTEND` de GitHub quedan sin uso: se pueden borrar.
