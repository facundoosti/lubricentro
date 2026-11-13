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
- (Parte 1) No se tocó `InputField`; en la Parte 2 se eliminó.

## Verificación
- `npx vitest run src/components/features/settings/`: 10/10 tests, incluido el nuevo test de labels y placeholders.
- `npx eslint src/components/features/settings/`: OK.
- `react-reviewer`: sin bloqueantes.
- QA (`tools/qa-runner`, 1440×900, dark y light): 2/2 OK.

## Parte 2: mismo estilo que el resto de Configuración
- Síntoma: los inputs de planes se veían distintos de los de al lado. Tenían 44px de alto vs 38px, fondo transparente, `px-4`, sombra, y el label en blanco con negrita.
- Causa: usaban `@ui/InputField`, un componente viejo de plantilla que solo usaba este formulario.
- Reproducido con TC-03, que compara los estilos computados contra "Nombre del Lubricentro": falló en height, background, padding, shadow y color del label.
- Fix:
  - `Field` + `inputCls` pasan de `pages/Settings.jsx` a `components/features/settings/SettingsField.jsx`, con un `htmlFor` opcional.
  - Los usan Configuración y el formulario de planes.
  - `ui/InputField.jsx` se borra porque queda sin referencias.
- Verificación:
  - `vitest` de `settings/` + `pages/`: 109/109.
  - ESLint: OK.
  - QA: 4/4 (TC-02 y TC-03, en dark y light).

## Seguimiento
- La app tiene unas 6 variantes de clase de input copiadas a mano: `utils/formStyles.js`, `ProductForm`, `SupplierForm`, `ServiceRecordFormPage`, `ItemRow` y `SettingsField`. Unificarlas en un `@ui/Input` + `@ui/Field` va por OpenSpec.
- Los labels de los campos de Configuración (fuera de planes) siguen sin `htmlFor`. Ahora se puede pasar.
