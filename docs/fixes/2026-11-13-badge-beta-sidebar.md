# Fix: badge "Beta" en Inbox y Recordatorios

## Lectura rápida
Inbox y Recordatorios no indicaban que están en prueba. Se agregó un badge "Beta" naranja (contrasta con el violeta de la marca) en sus ítems del sidebar.

## Error
- Síntoma: secciones en beta sin ninguna marca visual.
- Causa: el sidebar no soportaba una etiqueta por ítem (`frontend/src/layout/Sidebar.jsx` · `NavItem`).
- Origen: pedido del usuario ("badge que diga Beta en un color llamativo contrastante al diseño").

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review
- [x] QA visual

## Solución
- `BetaBadge` (span) + prop `beta` en `NavItem`; `beta: true` en Inbox y Recordatorios.
- Color: `bg-warning-500` + `text-on-warning` (tokens semánticos, contraste 7.55:1 en ambos temas).
- Solo con el sidebar visible (expandido/hover/mobile); colapsado se oculta y el link mantiene `aria-label`/`title`.
- No se reutilizó `@ui/Badge`: su tamaño más chico (`text-xs px-2.5`) queda grande para un ítem de menú.

## Verificación
- `npx vitest run src/layout` → 12/12 (2 tests nuevos: expandido muestra el badge en ambos ítems; colapsado lo oculta).
- `npx eslint src/layout` → ok.
- react-reviewer: sin bloqueantes.
- QA visual: `docs/qa/2026-11-13-badge-beta-sidebar.md` → 4/4 ✅.

## Seguimiento
- El naranja es el mismo de los estados "warning"; si se confunde con una advertencia, evaluar un token propio para "beta".
