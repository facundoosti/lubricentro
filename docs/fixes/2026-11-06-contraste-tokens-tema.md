# Fix: contraste del CTA en oscuro, borde del checkbox, hover de "Editar" y flecha del tour (H-09, H-10)

## Lectura rápida
Los botones violeta en modo oscuro tenían texto casi negro sobre violeta (3.6:1) y el borde del checkbox no llegaba a 3:1 en ninguno de los dos temas. Ahora el texto es blanco en ambos temas y `--color-outline` es `#71717a`. De paso, "Editar" usa un token en vez de `yellow-500` y la flecha del tour toma el color del popover.

## Error
- **H-09**: `--color-on-primary: #0a0012` sobre `--color-primary-container: #7c3aed` da 3.6:1 (< 4.5) (`frontend/src/index.css:44`). Algunos CTAs usaban `text-white` y otros `text-on-primary`.
- **H-10**: `--color-outline` en claro (`#a1a1aa` sobre blanco) da 2.6:1 (< 3). En oscuro (`#52525b` sobre `#121215`) también fallaba: 2.4:1. Este último no estaba en el pendiente y lo detectó el test.
- **Hover "Editar"**: `hover:text-yellow-500` es un color de paleta y tiene poco contraste en claro (5 tablas).
- **Tour**: la flecha usaba `outline-variant` (el borde tenue) en vez del fondo del popover.
- Origen: `docs/PENDIENTES.md`

## Plan
- [x] Test que reproduce (`src/test/__tests__/themeContrast.test.js`: calcula el contraste WCAG desde los tokens reales de `index.css`)
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (react-reviewer: 0 bloqueantes; se aplicaron las sugerencias triviales)
- [x] QA visual (ver `docs/qa/2026-11-06-pendientes-quick-fix.md`)

## Solución
- `index.css`: en oscuro `--color-on-primary: #ffffff` (5.7:1, igual que en claro). `--color-outline: #71717a` en los dos temas (4.8:1 en claro, 3.9:1 en oscuro). Flechas del tour con `--color-surface-container`.
- Decisión del usuario (H-09): **texto blanco**. Para que nada quede blanco sobre lila, los 6 lugares que usaban `bg-primary` + `text-on-primary` pasan a `bg-primary-container`: burbuja y botón de enviar del Inbox, filtros del Inbox, paginación de Recordatorios, botón de guardar de `SlideOver` y los checks de `Single/MultiSelectSearch`. **En claro no cambia nada**, porque ahí `primary` y `primary-container` son el mismo `#7c3aed`.
- "Editar" en Clientes, Proveedores, Atenciones, Vehículos y Servicios: `hover:text-primary`.

⚠️ Esto toca más de 5 archivos de producción, pero todos los cambios son mecánicos (una clase o un token) y no tocan lógica ni contrato.

## Verificación
- `themeContrast.test.js`: antes del fix fallaban 4 de 5; con el fix pasan 5/5.

- `npx vitest run` (suite completa): 49 archivos, 367 tests ✅
- `npx eslint` sobre los archivos tocados ✅
- QA visual: `docs/qa/2026-11-06-pendientes-quick-fix.md` (12 ✅, 1 🚧 sin datos)

## Seguimiento
- `border-outline` (el borde "prominente") se ve un poco más marcado en los ~16 lugares que lo usan: hovers de botones secundarios, tiles y separadores. Revisado en el QA visual.
