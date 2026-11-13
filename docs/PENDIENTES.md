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

Mejoras detectadas el 2026-11-12 comparando `BudgetPrint.jsx` con el talonario original (foto del 2026-11-10, impresión más nueva; `docs/presupuesto.jpeg` es una versión anterior en rojo).

**Visual (fix chico, sin migración)**
- [ ] Color de marca: el talonario nuevo es naranja (~`#F04E23`), el viejo rojo; confirmar con el dueño antes de cambiar `#cc2200`.
- [ ] Encabezado con fondo gris degradado en vez de negro (gasta menos tinta).
- [ ] Bordes redondeados en franja PRESUPUESTO y encabezado de la tabla.
- [ ] Tabla con fondo gris claro y renglones blancos; renglón "Vehículo" con fondo gris.
- [ ] Marca de agua opcional: logo Killamet muy tenue detrás de la tabla.
- [ ] Ícono de ubicación junto a la dirección y ciudad: "Bs. As. 820 (Dolores)".
- [ ] Pie: no repetir dirección/teléfono del encabezado; usarlo para email/Instagram.
- [ ] Mostrar el código del producto (ej. PH10044) junto al nombre o en columna propia.
- [ ] Columna P. UNIT. solo si algún ítem tiene cantidad > 1 (a evaluar).
- [ ] Totales en recuadro alineado con la columna IMPORTE; etiquetas "PRECIO D/LISTA – EFT/DEB" y "TARJETA D/CRED", ambas resaltadas en amarillo.

**Funcional (OpenSpec, requiere migración)**
- [ ] Planes de cuotas en los totales (ej. VISA 3 y 6 cuotas con recargo); hoy el dueño los anota a mano. Requiere configurar recargos.
- [ ] CUIT y tipo de factura (FACT) del cliente arriba a la izquierda; `customers` no tiene CUIT.
- [ ] Instagram y email del lubricentro en `settings` (hoy no existen esos campos).

**Técnico**
- [ ] El PDF se genera como imagen (html2canvas): texto no seleccionable, pesa más y se corta si supera una A4.
- [ ] `BudgetPrint.jsx` supera las 300 líneas: extraer `PrintSheet` o el recuadro DÍA/MES/AÑO a un componente propio (review de `presupuesto-impresion-ajustes`).

## Frontend — post shadcn/Base UI fase 2

Detectados el 2026-11-13 al cerrar `shadcn-base-ui-fase-2` (commit `225681c`, archivo en `openspec/changes/archive/2026-11-13-shadcn-base-ui-fase-2/`).

> Resueltos el 2026-11-13: borrado de `ServiceRecordForm`, CSS de checkbox nativo y warning de `buttonVariants` (`docs/fixes/2026-11-13-limpieza-post-shadcn-fase-2.md`); Calendar con `lazy()`, filtro de Recordatorios con fecha inválida, test de la regla anti-nativos y contraste del warning (`docs/fixes/2026-11-13-pendientes-frontend-fase-2.md`).

- [ ] Migrar `CustomerSearchInput` (~300 líneas, con alta rápida de cliente) y `ProductSearchInput` a Autocomplete de Base UI. Hoy funcionan con portal propio en el diálogo; es un change propio (OpenSpec).
