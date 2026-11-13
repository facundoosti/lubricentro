# Fix: el autocompletado del navegador tapa los resultados de los buscadores

## Lectura rápida
Al enfocar un buscador (p. ej. cliente en "Nuevo Turno"), Brave abría su popup nativo de emails encima de la lista de resultados. Chromium ignora `autoComplete="off"` si clasifica el campo como email por el placeholder: se cambió "email" → "correo" en los 3 buscadores de cliente y se agregó `autoComplete="off"` a los 17 buscadores (corta el historial).

## Error
- Síntoma: al hacer focus en "Buscar cliente por nombre o email..." aparece el popup de Brave (correos guardados / "Nuevo alias de correo") tapando los clientes. Pasa en otros buscadores.
- Causa: los inputs de búsqueda no desactivan el autocompletado; Chromium infiere "campo email" por el placeholder (`frontend/src/components/features/customers/CustomerSearchInput.jsx:239`, `AppointmentForm.jsx:176`, `ServiceRecordForm.jsx:85`) y en el resto muestra historial.
- Origen: descripción del usuario + captura.

## Plan
- [x] Test que reproduce
- [x] Fix mínimo
- [x] Tests + lint
- [x] Review (react-reviewer: sin bloqueantes; faltaba `Reminders.jsx`, ya agregado)
- [x] QA visual: N/A — el popup es UI nativa de Brave, no está en el DOM ni lo captura Playwright; no cambia nada renderizado. Verificación manual en Brave.

## Solución
- **Intento 1 (insuficiente):** solo `autoComplete="off"`. El usuario confirmó que seguía pasando.
- **Diagnóstico:** Brave headless con `--show-autofill-type-predictions` → el input de "Nuevo Turno" tenía `heuristic type: EMAIL_ADDRESS` con `autocomplete: off`. Variantes probadas en el form real: `type="search"`, `role="combobox"`, `name` neutro → siguen en `EMAIL_ADDRESS`. Placeholder sin "email" ("…teléfono…", "…correo…", "…mail…") → `UNKNOWN_TYPE`. El resto de los buscadores ya daba `UNKNOWN_TYPE`.
- **Fix final:** placeholder "…nombre o correo…" en `AppointmentForm.jsx`, `ServiceRecordForm.jsx` y el default de `CustomerSearchInput.jsx`.
- `autoComplete="off"` en todos los `<input>` de búsqueda (16 archivos, 17 inputs, 1 línea cada uno). Supera el límite de ~5 archivos del quick-fix, pero es el mismo atributo mecánico sin lógica.
- Test guard `frontend/src/test/__tests__/searchInputsAutocomplete.test.js`: escanea los `.jsx` y falla si un input con placeholder "Buscar…" (o con `value={…search}`, o en un componente `*Search*.jsx`) no tiene `autoComplete="off"`, o si un placeholder "Buscar…" dice "email"/"e-mail".

## Verificación
- `npx vitest run src/test/__tests__/searchInputsAutocomplete.test.js`: falló con 16 inputs antes del fix → pasa después.
- `npx vitest run`: 66 archivos, 538 tests ✅ (también después de agregar `Reminders.jsx`).
- `npx eslint` sobre los archivos tocados ✅.
- `npx vitest run` tras el fix final: 66 archivos, 539 tests ✅; eslint ✅.
- Brave headless con predicciones de autofill: "Nuevo Turno" y `/budgets/new` → `UNKNOWN_TYPE` (antes `EMAIL_ADDRESS`); `/customers`, `/vehicles`, `/products`, `/services`, `/suppliers`, `/budgets`, `/reminders`, `/service-records`, `/service-records/new` → `UNKNOWN_TYPE`.
- El popup nativo no se puede capturar (perfil limpio sin correos guardados) → confirmación final manual en el Brave del usuario.

## Seguimiento
- El test guard es heurístico (regex sobre el JSX): un buscador sin "Buscar" en el placeholder ni `value={…search}` se le escapa. Alternativa: un componente `SearchInput` compartido en `@ui`.
