# Fix: pendientes de frontend post shadcn/Base UI fase 2

## Lectura rápida
Cuatro pendientes de `docs/PENDIENTES.md`: el calendario de `DateInput` se carga con `lazy()`, Recordatorios aplica el resto de los filtros aunque una fecha sea inválida, hay un test de la regla ESLint anti-nativos y `--color-on-warning` pasa a oscuro para cumplir AA.

## Error
- Síntoma:
  - Bundle inicial +39,5 kB gzip por react-day-picker + locale, aunque el calendario solo se usa al abrir el popover (`src/components/ui/DateInput.jsx:3,8`).
  - Recordatorios: con una fecha inválida no se aplicaba **ningún** filtro (`src/pages/Reminders.jsx` `handleFilter`, `return` temprano).
  - La regla `no-restricted-syntax` (`eslint.config.js`) solo se había verificado a mano.
  - Texto blanco sobre `warning-500` (`#f79009`) → ~2.3:1, no cumple AA (`src/index.css:61`).
- Causa: decisiones/deudas de la fase 2 (`225681c`) y de la fase 1 (`16455c5`).
- Origen: `docs/PENDIENTES.md` › Frontend — post shadcn/Base UI fase 2. Contraste: el usuario eligió texto oscuro (`#18181b`).

## Plan
- [x] Test que reproduce (Recordatorios y contraste fallaban; ESLint es cobertura nueva; lazy: medido con el build)
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (`react-reviewer`: sin bloqueantes)
- [x] QA visual (TC-07, TC-13, TC-16 de la fase 2, oscuro + claro)

## Solución
- **Calendar lazy**: nuevo `@ui/DateCalendar` (Calendar + locale `es` + lunes primero). `DateInput` lo importa con `lazy()` dentro de `Suspense` (fallback de 242×300, el tamaño del calendario). Chunk `DateCalendar` de 17,1 kB gzip; el bundle principal baja de 468,9 a 452,7 kB gzip (−16,2 kB). Si falla la carga del chunk (la app no tiene Error Boundary), el `import()` cae en un aviso dentro del popover ("No se pudo cargar el calendario…") en vez de dejar la página en blanco (sugerencia del review). El resto de los +39,5 kB (date-fns, `@date-fns/tz`) lo usa más código y queda en el bundle principal.
- **Recordatorios**: `handleFilter` aplica búsqueda, estado y la fecha válida; la inválida no se aplica (queda la anterior) y se sigue mostrando "Revisá las fechas" con el campo en rojo.
- **Test ESLint**: `src/test/__tests__/eslintNativeControls.test.js` corre `ESLint.lintText` con la config real: rechaza `<select>` y `type="date|time|checkbox"` en `pages/`, `features/` y `layout/` (con el wrapper sugerido) y los permite en `components/ui`.
- **Contraste**: `--color-on-warning: #18181b` (~8:1). Caso nuevo en `themeContrast.test.js` y `docs/DESIGN_SYSTEM.md` actualizado. Hoy ninguna pantalla usa el warning sólido (Button `warning`, Badge `solid warning`, ConfirmDialog `variant="warning"`), así que no hay cambio visible.

## Verificación
- Test de Recordatorios y de contraste: fallaban antes del fix (`expected null to be 'Ana'`, `expected 2.35 ≥ 4.5`), pasan después.
- `npx vitest run` → 74 archivos, **663 tests ok**. `npm run lint` → ok. `npm run build` → ok.
- QA: `node tools/qa-runner/run.mjs openspec/changes/archive/2026-11-13-shadcn-base-ui-fase-2/qa.mjs --only TC-07,TC-13,TC-16` → 6/6 ok (calendario lazy dentro del diálogo, Escape cierra solo el calendario; aviso de fecha inválida).

### Seguimiento
- Sumar una aserción de foco (día seleccionado/hoy) tras abrir el calendario lazy; hoy los tests esperan el `grid`.
- El fallback fijo 242×300 puede dar un salto chico en meses de 6 filas (cosmético).
