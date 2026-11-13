# Fix: limpieza post shadcn/Base UI fase 2

## Lectura rápida
Tres pendientes chicos de `docs/PENDIENTES.md`: se borró `ServiceRecordForm` (sin uso), se quitaron los estilos globales de checkbox nativo y se movió `buttonVariants` a su propio archivo para sacar el warning de lint.

## Error
- Síntoma:
  - `ServiceRecordForm.jsx` (254 líneas) y su test seguían en el repo sin ninguna pantalla que los use.
  - `src/index.css` mantenía ~45 líneas de estilos `input[type="checkbox"]` sin uso tras `@ui/Checkbox`.
  - `npm run lint` daba un warning `react-refresh/only-export-components` en `src/components/ui/primitives/button.jsx:39` (exportaba `buttonVariants`).
- Causa: restos de la migración de la fase 2 (`225681c`).
- Origen: `docs/PENDIENTES.md` › Frontend — post shadcn/Base UI fase 2.

## Plan
- [x] Test que reproduce (N/A: no es un bug de comportamiento; la "reproducción" es el warning de `eslint` y la búsqueda de usos)
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (`react-reviewer`: sin bloqueantes; las sugerencias son opcionales: menciones históricas de `ServiceRecordForm` en `docs/fixes` y en el archive, que se dejan)
- [x] QA visual (TC-08 checkboxes y TC-13 calendario de la fase 2, oscuro + claro)

## Solución
- **ServiceRecordForm**: `codegraph callers ServiceRecordForm` → sin callers; el único import era su propio test. Se borraron los dos archivos (las atenciones usan `ServiceRecordFormPage`).
- **CSS de checkbox**: ningún `.jsx` renderiza `<input type="checkbox">` (la regla ESLint anti-nativos ya lo impide). Se quitó el bloque de `src/index.css`; la primitiva `primitives/checkbox.jsx` tiene sus propias clases. Se ajustó su comentario, que nombraba ese CSS.
- **buttonVariants**: pasó a `src/components/ui/primitives/button-variants.js`; `button.jsx` exporta solo `Button` y `calendar.jsx` importa las variantes del archivo nuevo.

## Verificación
- `npm run lint` → 0 problemas (antes 1 warning).
- `npx vitest run` → 73 archivos, **655 tests ok**.
- `npm run build` → ok.
- QA: `node tools/qa-runner/run.mjs openspec/changes/archive/2026-11-13-shadcn-base-ui-fase-2/qa.mjs --only TC-08,TC-13` → 4/4 ok (casillas 16px, radio 4px, violeta al marcar, cabecera `mixed`; calendario dentro del diálogo, "noviembre 2026").
