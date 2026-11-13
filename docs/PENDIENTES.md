# Pendientes

Backlog de mejoras detectadas y diferidas. Al tomar uno, movelo a un change de OpenSpec (o fix chico) y borralo de acá.

> Resueltos el 2026-11-06 con `/quick-fix`, ver `docs/fixes/2026-11-06-*.md`: H-06 a H-10, colSpan, tooltip de Turnos, hover de "Editar", flecha del tour, accesibilidad de modales y switches, "$ NaN", X del autocomplete, título de `/login`, "budgets" y spec de zona horaria. Los ítems **mobile** se descartaron porque la app es desktop-first.
>
> Resueltos el 2026-11-07: Ruby 4.0.9 + `load_defaults 8.1` y zona horaria argentina (`openspec/specs/zona-horaria`). También se sacaron las contraseñas de `seeds.rb` y se agregó un guard de base de test (`docs/fixes/2026-11-07-seeds-y-base-de-test.md`).

## Backend

- [ ] El servicio `cron` de Railway no tiene schedule (`cronSchedule: None`), así que `ServiceReminderJob` no corre solo. Al configurarlo, recordá que el cron va en UTC y el job usa la fecha argentina: hay que dispararlo después de las 03:00 UTC.
- [ ] Agregar specs de borde en ART para `service_reminders#index` (filtro por fecha) y `#statistics` (mes actual). Hoy funcionan, pero no tienen cobertura.
- [ ] Quitar `DATABASE_URL` de `backend/.env` y usar `POSTGRES_*`. Hoy pisa la base de test: el guard de `rails_helper` aborta en vez de truncar dev, pero `bundle exec rspec` sigue necesitando override.

## Seguridad

- [ ] Rotar en producción las contraseñas de los dos usuarios que estaban en `seeds.rb`. Siguen vigentes (verificado el 2026-11-07) y quedaron en el historial de git.

## Hoja de presupuesto (impresión/PDF)

Rediseño del talonario implementado en el change `presupuesto-hoja-rediseno` (2026-11-13): estilo nuevo, SKU, cuotas, datos fiscales del cliente, email e Instagram.

- [ ] El PDF se genera como imagen (html2canvas): texto no seleccionable, pesa más y se corta si supera una A4. Generarlo como texto.

## Frontend — post shadcn/Base UI fase 2

Detectados el 2026-11-13 al cerrar `shadcn-base-ui-fase-2` (commit `225681c`, archivo en `openspec/changes/archive/2026-11-13-shadcn-base-ui-fase-2/`).

> Resueltos el 2026-11-13: borrado de `ServiceRecordForm`, CSS de checkbox nativo y warning de `buttonVariants` (`docs/fixes/2026-11-13-limpieza-post-shadcn-fase-2.md`); Calendar con `lazy()`, filtro de Recordatorios con fecha inválida, test de la regla anti-nativos y contraste del warning (`docs/fixes/2026-11-13-pendientes-frontend-fase-2.md`).

