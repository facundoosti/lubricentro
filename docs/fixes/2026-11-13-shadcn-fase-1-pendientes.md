# Fix: pendientes chicos de la fase 1 de shadcn/Base UI

## Lectura rápida
Limpieza post fase 1 (6c1d103): tokens de warning en vez de colores fijos, tests que faltaban, `Dialog.jsx` dividido, `onSearch('')` solo si hubo búsqueda y casillas de subcategorías otra vez en su posición original.

## Error
- Síntoma:
  - TC-03: las casillas de las subcategorías del Combobox de categoría quedaban ~9px más a la izquierda que en la línea base.
  - Colores fijos (`text-yellow-500`, `text-white`) en ConfirmDialog, Button y Badge en vez de tokens.
  - El Combobox llamaba `onSearch('')` (y repetía búsquedas) al abrir/cerrar sin haber buscado.
  - Faltaban tests: "Limpiar" del Combobox múltiple con `clearable` y los 3 filtros múltiples de ProductsTable.
  - `Dialog.jsx` con 261 líneas (FormLayout/FreeLayout adentro) y JSDoc de `initialFocus` mal formado.
- Causa:
  - Indentación: la primitiva `ComboboxItem` renderiza indicador → children, así que la guía vertical (1px + gap 8px) quedaba **después** de la casilla; antes iba guía → casilla (`frontend/src/components/ui/primitives/combobox.jsx`).
  - `onSearch`: `handleOpenChange` llamaba `onSearch('')` siempre al cerrar y Base UI emite `onInputValueChange('')` al abrir/cerrar (`frontend/src/components/ui/Combobox.jsx`).
- Origen: `openspec/changes/archive/2026-11-13-shadcn-base-ui-fase-1/` (qa.md › Hallazgos, design.md D5) + pendientes del usuario.

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review
- [x] QA visual (TC-03 re-corrido, oscuro + claro)

## Solución
- **Tokens**: nuevo `--color-on-warning: #ffffff` (`src/index.css`, documentado en `docs/DESIGN_SYSTEM.md`). Button `warning` y Badge `solid warning` usan `text-on-warning`. Ícono warning de ConfirmDialog: `text-yellow-500` → `text-warning-500`.
- **Combobox**: `sentQueryRef` guarda el último texto enviado. No se repite la misma búsqueda y al cerrar solo se manda `''` si había una búsqueda aplicada.
- **Subcategorías**: prop `leading` en la primitiva `ComboboxItem` (se renderiza antes del indicador). El wrapper pasa la guía por ahí. Queda guía (x=26) → casilla (x=35), igual que el `SingleSelectSearch` original.
- **Dialog**: `FormLayout` → `ui/DialogFormLayout.jsx`, `FreeLayout` → `ui/DialogFreeLayout.jsx` (sin cambios de comportamiento). `Dialog.jsx` baja a 182 líneas. JSDoc de `initialFocus` con el tipo real de Base UI.
- **Tests nuevos**: Combobox (guía antes del indicador; abrir/cerrar sin escribir no llama `onSearch`; "Limpiar" en múltiple → `[]`), Button/Badge (`text-on-warning`), ConfirmDialog (`text-warning-500`), ProductsTable (marcas, proveedores y categorías llaman `onFilterChange`; quitar chip).
- Ajustado el test "elegir una opción después de buscar": ahora deja pasar el debounce antes de elegir (si no, la búsqueda nunca se aplicaba y no hay `''` que mandar).

### No hecho (decisión)
- ❌ **Quitar `aria-modal`**: no es redundante. Base UI no lo pone en `Dialog.Popup` (al quitarlo falla `Dialog.test.jsx`) y la spec `formularios-dialogo` lo exige. Se deja en Dialog y ConfirmDialog.
- Anillo de foco violeta del buscador: sin cambios (comportamiento deseado).

### Seguimiento
- Contraste: blanco sobre `#f79009` da ~2.3:1 (no cumple AA). Ahora es un token: se puede oscurecer `--color-on-warning` cuando se decida.
- El ícono warning de ConfirmDialog pasa de amarillo (`#eab308`) al naranja de `warning-500` (`#f79009`): es un cambio leve de color.
- `sentQueryRef` no se resetea si un consumidor alterna `onSearch` entre definido y `undefined` (hoy ninguno lo hace).

## Verificación
- `npx vitest run` → 65 archivos, **564 tests ok** (antes 551).
- `npm run lint` → ok.
- QA: `node tools/qa-runner/run.mjs <scratch>/tc03.qa.mjs` (TC-03 de `qa.mjs` + medición) → 2/2 ok. Hijas: guía x=26, casilla x=35 (raíz x=12). Captura igual a `baseline/TC-03-desktop-dark.jpg`.
- Review `react-reviewer`: sin bloqueantes. Aplicadas: fake timers en el test nuevo, reset de mocks en ProductsTable y token documentado.
