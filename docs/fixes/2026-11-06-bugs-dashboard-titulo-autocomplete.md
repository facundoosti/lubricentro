# Fix: "Ingresos: $ NaN", título de pestaña en /login y X del autocomplete

## Lectura rápida
Tres bugs chicos de `docs/PENDIENTES.md` ("Bugs fuera del tema"): el dashboard mostraba `$ NaN`, `/login` heredaba el título "Dashboard - …" y en el buscador de clientes el texto quedaba debajo de la X. El cuarto ("budgets" sin traducir) ya estaba resuelto en `e07ae99`.

## Error
- **NaN**: `sum(:total_amount)` devuelve `BigDecimal`, que se serializa como string (`"1500.0"`). El `reduce` hacía `0 + "1500.0"` → concatenación → `NaN` (`frontend/src/components/dashboard/MiniChart.jsx:16`).
- **Título**: `PageMeta` escribía `document.title` durante el render y nunca lo restauraba; las páginas sin `PageMeta` (como `/login`) quedaban con el último título (`frontend/src/components/common/PageMeta.jsx:6`).
- **Autocomplete**: el input tenía `pr-10` (40 px) pero con texto se muestran dos botones (X + flecha, ~60 px) (`frontend/src/components/features/customers/CustomerSearchInput.jsx:263`).
- Origen: `docs/PENDIENTES.md`

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (react-reviewer: 0 bloqueantes; se aplicaron las sugerencias triviales)
- [x] QA visual (ver `docs/qa/2026-11-06-pendientes-quick-fix.md`)

## Solución
- `MiniChart`: `Number(d.revenue) || 0` en el total y en el tooltip. Se arregla en el front para no cambiar el contrato de la API.
- `PageMeta`: título y descripción pasan a `useEffect`; el del título restaura el anterior al desmontar.
- `CustomerSearchInput`: `pr-16` cuando hay texto (y se ve la X), `pr-10` si no.

## Verificación
- Tests nuevos: `MiniChart.test.jsx` (2), `PageMeta.test.jsx` (2), caso nuevo en `CustomerSearchInput.test.jsx`. Antes del fix fallaban 3; con el fix pasan 11/11.
- `npx vitest run` (suite completa): 49 archivos, 367 tests ✅
- `npx eslint` sobre los archivos tocados ✅
- QA visual: `docs/qa/2026-11-06-pendientes-quick-fix.md` (12 ✅, 1 🚧 sin datos)
