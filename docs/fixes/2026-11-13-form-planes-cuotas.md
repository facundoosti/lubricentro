# Fix: formulario de planes de cuotas sin labels visibles

## Lectura rápida
El formulario de planes de cuotas (Configuración) usaba los placeholders como única etiqueta, y no se entendía qué era cada campo. Ahora cada campo tiene un label visible y un placeholder de ejemplo.

## Error
- Síntoma: no se entiende qué va en cada campo. Los placeholders no se ven bien.
- Causa: `frontend/src/components/features/settings/InstallmentPlanForm.jsx:12-17`.
  - Los campos solo tenían `aria-label` y placeholder, sin label visible.
  - Cuando el campo tiene valor, el placeholder desaparece. Pasa al editar un plan y con el recargo, que arranca en `0`.
  - Las columnas eran de 80–100px, y `h-9 px-2` vía `className` no pisaba el `h-11 px-4` de `InputField`, que no usa twMerge.
- Origen: descripción del usuario.

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review
- [x] QA visual (`docs/qa/2026-11-13-form-planes-cuotas.md`)

## Solución
- Cada `InputField` recibe `label` + `id` (con `useId`, porque pueden convivir dos formularios: edición y alta).
- Placeholders de ejemplo: `Ej: VISA`, `Ej: 3`, `Ej: 10`, `Auto`. Orden vacío ya usa la siguiente posición libre (`toPlanPayload`).
- Columnas `1fr / 96 / 112 / 96 px`. Se sacan las clases que no se mergeaban (`inputCls`).
- No se tocó `InputField`, que es compartido.

## Verificación
- `npx vitest run src/components/features/settings/`: 10/10 tests, incluido el nuevo test de labels y placeholders.
- `npx eslint src/components/features/settings/`: OK.
- `react-reviewer`: sin bloqueantes.
- QA (`tools/qa-runner`, 1440×900, dark y light): 2/2 OK.

## Seguimiento
- `InputField` concatena `className` sin `cn()`/twMerge: los overrides que entran en conflicto (`h-*`, `px-*`) no aplican de forma confiable. Revisar el impacto antes de cambiarlo.
- El label "Nombre del plan" ocupa casi todo el ancho de su columna (~135px). Si se agranda la fuente, se puede acortar a "Nombre".
